'use client';

import { useEffect, useId, useState, type ChangeEvent, type DragEvent } from 'react';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { toast } from '@/shared/ui/shadcn/sonner';
import { Button } from '@/shared/ui/shadcn/button';
import { Label } from '@/shared/ui/shadcn/label';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { cn } from '@/shared/lib/utils';
import {
  TEAM_LOGO_ACCEPT,
  TEAM_LOGO_MAX_FILE_SIZE_LABEL,
  validateTeamLogoFile,
} from '@/features/team/lib';
import { TeamLogoCropDialog } from './team-logo/logo-crop-dialog';
import { TeamLogoMakerDialog } from './team-logo/logo-maker-dialog';

interface TeamLogoFieldProps {
  logoId: string;
  isUploadingLogo: boolean;
  logoUploadError: string | null;
  onLogoFileSelect: (file: File) => Promise<void>;
}

export function TeamLogoField({
  logoId,
  isUploadingLogo,
  logoUploadError,
  onLogoFileSelect,
}: TeamLogoFieldProps) {
  const logoInputId = useId();
  const [isMakerOpen, setIsMakerOpen] = useState(false);
  const [isCropOpen, setIsCropOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);
  const [latestLogoFile, setLatestLogoFile] = useState<File | null>(null);

  useEffect(() => {
    // 서버에 저장된 기존 URL 상태로 돌아오면 이전 임시 파일 참조를 비운다.
    if (!logoId || !logoId.startsWith('blob:')) {
      setLatestLogoFile(null);
    }
  }, [logoId]);

  const openCropDialogWithFile = (file: File) => {
    const validationError = validateTeamLogoFile(file);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setCropSourceFile(file);
    setIsCropOpen(true);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      event.target.value = '';
      return;
    }

    openCropDialogWithFile(file);
    event.target.value = '';
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isUploadingLogo) return;
    setIsDragOver(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isUploadingLogo) return;
    event.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!(event.currentTarget as HTMLDivElement).contains(event.relatedTarget as Node | null)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    if (isUploadingLogo) return;

    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    openCropDialogWithFile(file);
  };

  const handleLogoPreviewClick = async () => {
    if (isUploadingLogo || !logoId) return;

    if (latestLogoFile) {
      setCropSourceFile(latestLogoFile);
      setIsCropOpen(true);
      return;
    }

    try {
      const response = await fetch(logoId);
      if (!response.ok) {
        throw new Error('현재 로고 파일을 불러오지 못했습니다.');
      }

      const blob = await response.blob();
      const fileType = blob.type || 'image/png';
      const extension = fileType.split('/')[1] ?? 'png';
      const file = new File([blob], `team-logo-recrop.${extension}`, { type: fileType });
      const validationError = validateTeamLogoFile(file);
      if (validationError) {
        throw new Error(validationError);
      }

      setLatestLogoFile(file);
      setCropSourceFile(file);
      setIsCropOpen(true);
    } catch {
      toast.error('현재 로고를 다시 편집할 수 없습니다. 다시 업로드해주세요.');
    }
  };

  const handleCropOpenChange = (open: boolean) => {
    setIsCropOpen(open);
    if (!open) {
      setCropSourceFile(null);
    }
  };

  const handleLogoFileSelect = async (file: File) => {
    setLatestLogoFile(file);
    await onLogoFileSelect(file);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-bold text-slate-700">팀 로고</Label>

      <div
        className={cn(
          'flex flex-col items-center gap-3 rounded-xl border border-transparent p-2 transition-colors',
          isDragOver && 'border-primary/40 bg-brand-weak'
        )}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {logoId && (
          <button
            type="button"
            disabled={isUploadingLogo}
            onClick={handleLogoPreviewClick}
            className="flex h-24 w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white"
            aria-label="로고 다시 편집하기"
          >
            <Image
              src={logoId}
              alt="선택한 팀 로고"
              width={96}
              height={96}
              className="h-full w-full object-cover"
            />
          </button>
        )}

        <div className="flex w-full flex-col gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10"
            disabled={isUploadingLogo}
            onClick={() => setIsMakerOpen(true)}
          >
            로고 만들기
          </Button>

          <input
            id={logoInputId}
            type="file"
            accept={TEAM_LOGO_ACCEPT}
            className="hidden"
            onChange={handleFileChange}
          />
          <label
            htmlFor={logoInputId}
            className={cn(
              'inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700',
              'hover:bg-slate-100',
              isUploadingLogo && 'pointer-events-none opacity-60'
            )}
          >
            {isUploadingLogo ? (
              <Spinner className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            사진 업로드
          </label>
        </div>

        <p className="text-xs text-slate-500">
          JPG, PNG, WEBP / 최대 {TEAM_LOGO_MAX_FILE_SIZE_LABEL}
          {isDragOver ? ' / 여기에 드롭해서 업로드' : ''}
        </p>
      </div>

      {logoUploadError && <p className="text-xs text-red-500">{logoUploadError}</p>}

      <TeamLogoCropDialog
        open={isCropOpen}
        sourceFile={cropSourceFile}
        isUploadingLogo={isUploadingLogo}
        onOpenChange={handleCropOpenChange}
        onComplete={handleLogoFileSelect}
      />

      <TeamLogoMakerDialog
        open={isMakerOpen}
        onOpenChange={setIsMakerOpen}
        isUploadingLogo={isUploadingLogo}
        onLogoFileSelect={handleLogoFileSelect}
      />
    </div>
  );
}
