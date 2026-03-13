'use client';

import { useFormContext } from 'react-hook-form';
import { Flag, Check } from 'lucide-react';
import { Spinner } from '@/shared/ui/shadcn/spinner';

import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { sanitizeTeamCode, sanitizeTeamName } from '@/features/team/lib';

import { StepHeader } from './step-header';
import { TeamLogoField } from './team-logo-field';
import {
  TEAM_CODE_ERROR_MESSAGE,
  TEAM_CODE_MAX_LENGTH,
  TEAM_CODE_PREVIEW_BASE_URL,
  TEAM_CODE_PREVIEW_LABEL,
  TEAM_NAME_MAX_LENGTH,
} from '@/shared/config/team-constants';

interface TeamCreateStepInfoProps {
  logoId: string;
  codeStatus: 'idle' | 'available' | 'taken' | 'invalid';
  isCheckingCode: boolean;
  onCodeChange: (value: string) => void;
  onLogoFileSelect: (file: File) => Promise<void>;
  isUploadingLogo: boolean;
  logoUploadError: string | null;
}

export function TeamCreateStepInfo({
  logoId,
  codeStatus,
  isCheckingCode,
  onCodeChange,
  onLogoFileSelect,
  isUploadingLogo,
  logoUploadError,
}: TeamCreateStepInfoProps) {
  const { register, watch, setValue } = useFormContext();
  const teamCode = watch('code') ?? '';
  const teamName = watch('name') ?? '';

  return (
    <div className="space-y-6">
      <StepHeader step={1} title="팀 정보" icon={Flag} />

      {/* 팀명 */}
      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">
          팀 이름 <span className="text-red-500">*</span>
        </Label>
        <Input
          {...register('name', { required: true, maxLength: TEAM_NAME_MAX_LENGTH })}
          placeholder="예: 강남 슬램덩크"
          className="h-12"
          maxLength={TEAM_NAME_MAX_LENGTH}
          onChange={(e) => {
            const value = sanitizeTeamName(e.target.value);
            setValue('name', value);
          }}
        />
        <p className="text-xs text-muted-foreground text-right">
          {teamName.length}/{TEAM_NAME_MAX_LENGTH}
        </p>
      </div>

      {/* 팀 코드 */}
      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">
          팀 코드 <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            {...register('code', { required: true })}
            placeholder="예: Draft2026"
            className="h-12 pr-10"
            maxLength={TEAM_CODE_MAX_LENGTH}
            onChange={(e) => {
              const value = sanitizeTeamCode(e.target.value);
              setValue('code', value);
              onCodeChange(value);
            }}
          />
          {isCheckingCode && (
            <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4  text-muted-foreground" />
          )}
          {!isCheckingCode && codeStatus === 'available' && (
            <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
          )}
        </div>
        {codeStatus === 'invalid' && (
          <p className="text-xs text-red-500">{TEAM_CODE_ERROR_MESSAGE}</p>
        )}
        {codeStatus === 'taken' && (
          <p className="text-xs text-red-500">이미 사용 중인 코드입니다</p>
        )}
        {codeStatus === 'available' && (
          <p className="text-xs text-green-600">사용 가능한 팀 코드입니다</p>
        )}
        <p className="text-sm text-slate-500">{TEAM_CODE_PREVIEW_LABEL}</p>
        <p className="break-all text-sm font-medium text-primary">
          {TEAM_CODE_PREVIEW_BASE_URL}
          {teamCode}
        </p>
        <p className="text-xs text-muted-foreground">
          한글, 영문 대소문자, 숫자만 사용 가능 (15자 이내)
        </p>
      </div>

      {/* 팀 로고 */}
      <TeamLogoField
        logoId={logoId}
        onLogoFileSelect={onLogoFileSelect}
        isUploadingLogo={isUploadingLogo}
        logoUploadError={logoUploadError}
      />
    </div>
  );
}
