'use client';

import { useFormContext } from 'react-hook-form';
import { Flag, Check } from 'lucide-react';
import Image from 'next/image';
import { Spinner } from '@/shared/ui/shadcn/spinner';

import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { cn } from '@/shared/lib/utils';
import { sanitizeShortIntro, sanitizeTeamName } from '@/features/team/lib';

import { StepHeader } from './step-header';
import {
  TEAM_CODE_ERROR_MESSAGE,
  TEAM_NAME_MAX_LENGTH,
} from '@/shared/config/team-constants';

// 프리셋 로고 옵션 (8개: 2개 로고 x 4 반복)
const PRESET_LOGOS = [
  { id: '01', url: '/logos/preset/logo-01.webp' },
  { id: '02', url: '/logos/preset/logo-02.webp' },
] as const;

const TEAM_LOGO_OPTIONS = [
  ...PRESET_LOGOS,
  ...PRESET_LOGOS,
  ...PRESET_LOGOS,
  ...PRESET_LOGOS,
].map((logo, index) => ({
  id: `logo-${String(index + 1).padStart(2, '0')}`,
  url: logo.url,
}));

interface TeamCreateStepInfoProps {
  logoId: string;
  codeStatus: 'idle' | 'available' | 'taken' | 'invalid';
  isCheckingCode: boolean;
  onCodeChange: (value: string) => void;
}

export function TeamCreateStepInfo({
  logoId,
  codeStatus,
  isCheckingCode,
  onCodeChange,
}: TeamCreateStepInfoProps) {
  const { register, watch, setValue } = useFormContext();
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

      {/* 한줄 소개 */}
      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">
          한줄 소개 <span className="text-red-500">*</span>
        </Label>
        <Input
          {...register('shortIntro', { required: true, maxLength: 15 })}
          placeholder="예: 매주 수요일에 봐요"
          className="h-12"
          maxLength={15}
          onChange={(e) => {
            const value = sanitizeShortIntro(e.target.value);
            setValue('shortIntro', value);
          }}
        />
        <p className="text-xs text-muted-foreground text-right">
          {watch('shortIntro')?.length || 0}/15
        </p>
      </div>

      {/* 팀 코드 */}
      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">
          팀 코드 <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            draft.kr/team/
          </span>
          <Input
            {...register('code', { required: true })}
            placeholder="my-team"
            className="h-12 pl-[120px]"
            onChange={(e) => {
              const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
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
          <p className="text-xs text-green-600">사용 가능한 코드입니다</p>
        )}
        <p className="text-xs text-muted-foreground">
          영문 소문자, 숫자, 하이픈만 사용 (3-30자)
        </p>
      </div>

      {/* 팀 로고 */}
      <div className="space-y-3">
        <Label className="text-sm font-bold text-slate-700">팀 로고</Label>
        <div className="grid grid-cols-4 gap-2">
          {TEAM_LOGO_OPTIONS.map((logo) => (
            <button
              key={logo.id}
              type="button"
              onClick={() => setValue('logoId', logo.url)}
              className={cn(
                'aspect-square rounded-xl flex items-center justify-center overflow-hidden transition-all border-2',
                logoId === logo.url
                  ? 'border-primary bg-brand-weak'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <Image
                src={logo.url}
                alt={`로고 ${logo.id}`}
                width={60}
                height={60}
                className="object-cover w-3/4 h-3/4"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
