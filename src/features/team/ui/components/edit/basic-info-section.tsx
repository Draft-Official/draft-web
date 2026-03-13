'use client';

import type { UseFormRegister } from 'react-hook-form';
import { Check } from 'lucide-react';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import {
  sanitizeTeamCode,
  sanitizeTeamName,
} from '@/features/team/lib';
import {
  TEAM_CODE_ERROR_MESSAGE,
  TEAM_CODE_MAX_LENGTH,
  TEAM_CODE_PREVIEW_BASE_URL,
  TEAM_CODE_PREVIEW_LABEL,
  TEAM_NAME_MAX_LENGTH,
} from '@/shared/config/team-constants';
import type { TeamProfileEditFormData } from './types';
import { TeamLogoField } from '../team-logo-field';

interface TeamProfileEditBasicInfoSectionProps {
  code: string;
  codeStatus: 'idle' | 'available' | 'taken' | 'invalid';
  logoId: string;
  name: string;
  isCheckingCode: boolean;
  register: UseFormRegister<TeamProfileEditFormData>;
  onCodeChange: (value: string) => void;
  onLogoFileSelect: (file: File) => Promise<void>;
  isUploadingLogo: boolean;
  logoUploadError: string | null;
}

export function TeamProfileEditBasicInfoSection({
  code,
  codeStatus,
  logoId,
  name,
  isCheckingCode,
  register,
  onCodeChange,
  onLogoFileSelect,
  isUploadingLogo,
  logoUploadError,
}: TeamProfileEditBasicInfoSectionProps) {
  const codeField = register('code', {
    required: true,
    maxLength: TEAM_CODE_MAX_LENGTH,
  });
  const nameField = register('name', {
    required: true,
    maxLength: TEAM_NAME_MAX_LENGTH,
  });

  return (
    <div className="space-y-6">
      <TeamLogoField
        logoId={logoId}
        onLogoFileSelect={onLogoFileSelect}
        isUploadingLogo={isUploadingLogo}
        logoUploadError={logoUploadError}
      />

      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">
          팀 코드 <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <Input
            {...codeField}
            placeholder="예: Draft2026"
            className="h-12 pr-10"
            maxLength={TEAM_CODE_MAX_LENGTH}
            onChange={(e) => {
              const sanitized = sanitizeTeamCode(e.target.value);
              e.target.value = sanitized;
              codeField.onChange(e);
              onCodeChange(sanitized);
            }}
          />
          {isCheckingCode && (
            <Spinner className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          )}
          {!isCheckingCode && codeStatus === 'available' && (
            <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
          )}
        </div>
        <p className="text-sm text-slate-500">{TEAM_CODE_PREVIEW_LABEL}</p>
        <p className="break-all text-sm font-medium text-primary">
          {TEAM_CODE_PREVIEW_BASE_URL}
          {code}
        </p>
        {codeStatus === 'invalid' && (
          <p className="text-xs text-red-500">{TEAM_CODE_ERROR_MESSAGE}</p>
        )}
        {codeStatus === 'taken' && (
          <p className="text-xs text-red-500">이미 사용 중인 팀 코드입니다</p>
        )}
        {codeStatus === 'available' && (
          <p className="text-xs text-green-600">사용 가능한 팀 코드입니다</p>
        )}
        <p className="text-xs text-muted-foreground">
          한글, 영문 대소문자, 숫자만 사용 가능 (15자 이내)
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">
          팀 이름 <span className="text-red-500">*</span>
        </Label>
        <Input
          {...nameField}
          placeholder="예: 강남 슬램덩크"
          className="h-12"
          maxLength={TEAM_NAME_MAX_LENGTH}
          onChange={(e) => {
            const sanitized = sanitizeTeamName(e.target.value);
            e.target.value = sanitized;
            nameField.onChange(e);
          }}
        />
        <p className="text-xs text-slate-400 text-right">{name.length}/{TEAM_NAME_MAX_LENGTH}</p>
      </div>
    </div>
  );
}
