'use client';

import { useFormContext } from 'react-hook-form';
import { Flag, Loader2, Check } from 'lucide-react';
import Image from 'next/image';

import { Input } from '@/shared/ui/base/input';
import { Label } from '@/shared/ui/base/label';
import { cn } from '@/shared/lib/utils';

import { StepHeader } from './step-header';
import { TEAM_CODE_ERROR_MESSAGE } from '@/shared/config/team-constants';

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

  return (
    <div className="space-y-6">
      <StepHeader step={1} title="팀 정보" icon={Flag} />

      {/* 팀명 */}
      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">
          팀 이름 <span className="text-red-500">*</span>
        </Label>
        <Input
          {...register('name', { required: true })}
          placeholder="예: 강남 슬램덩크"
          className="h-12"
        />
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
            // 이모티콘 제거: 기본 한글/영문/숫자/일반 문장부호만 허용
            const value = e.target.value.replace(
              /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{FE00}-\u{FE0F}]/gu,
              ''
            );
            setValue('shortIntro', value);
          }}
        />
        <p className="text-xs text-slate-400 text-right">
          {watch('shortIntro')?.length || 0}/15
        </p>
      </div>

      {/* 팀 코드 */}
      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">
          팀 코드 <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
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
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />
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
        <p className="text-xs text-slate-400">
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
