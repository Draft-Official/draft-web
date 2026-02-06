'use client';

import { useFormContext } from 'react-hook-form';
import { Flag, Loader2, Check } from 'lucide-react';

import { Input } from '@/shared/ui/base/input';
import { Label } from '@/shared/ui/base/label';
import { cn } from '@/shared/lib/utils';

import { StepHeader } from './step-header';
import { TEAM_CODE_ERROR_MESSAGE } from '@/shared/config/team-constants';

// 팀 로고 옵션
const TEAM_LOGO_OPTIONS = [
  { id: 'basketball', emoji: '🏀', label: '농구공' },
  { id: 'fire', emoji: '🔥', label: '불꽃' },
  { id: 'star', emoji: '⭐', label: '별' },
  { id: 'lightning', emoji: '⚡', label: '번개' },
  { id: 'trophy', emoji: '🏆', label: '트로피' },
  { id: 'eagle', emoji: '🦅', label: '독수리' },
  { id: 'lion', emoji: '🦁', label: '사자' },
  { id: 'dragon', emoji: '🐉', label: '용' },
];

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
          {...register('shortIntro', { required: true, maxLength: 20 })}
          placeholder="예: 매주 수요일 상암에서!"
          className="h-12"
          maxLength={20}
        />
        <p className="text-xs text-slate-400 text-right">
          {watch('shortIntro')?.length || 0}/20
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
        <div className="flex flex-wrap gap-2">
          {TEAM_LOGO_OPTIONS.map((logo) => (
            <button
              key={logo.id}
              type="button"
              onClick={() => setValue('logoId', logo.id)}
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all border-2',
                logoId === logo.id
                  ? 'border-[#FF6600] bg-orange-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              {logo.emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
