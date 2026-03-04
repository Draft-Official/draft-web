'use client';

import type { UseFormRegister } from 'react-hook-form';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import {
  sanitizeTeamName,
} from '@/features/team/lib';
import { TEAM_NAME_MAX_LENGTH } from '@/shared/config/team-constants';
import type { TeamProfileEditFormData } from './types';
import { TeamLogoField } from '../team-logo-field';

interface TeamProfileEditBasicInfoSectionProps {
  logoId: string;
  name: string;
  register: UseFormRegister<TeamProfileEditFormData>;
  onLogoFileSelect: (file: File) => Promise<void>;
  isUploadingLogo: boolean;
  logoUploadError: string | null;
}

export function TeamProfileEditBasicInfoSection({
  logoId,
  name,
  register,
  onLogoFileSelect,
  isUploadingLogo,
  logoUploadError,
}: TeamProfileEditBasicInfoSectionProps) {
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
