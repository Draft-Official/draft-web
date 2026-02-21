'use client';

import Image from 'next/image';
import type { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { cn } from '@/shared/lib/utils';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { Textarea } from '@/shared/ui/shadcn/textarea';
import { TEAM_LOGO_OPTIONS, sanitizeShortIntro } from '@/features/team/lib';
import type { TeamProfileEditFormData } from './types';

interface TeamProfileEditBasicInfoSectionProps {
  logoId: string;
  shortIntro: string;
  register: UseFormRegister<TeamProfileEditFormData>;
  setValue: UseFormSetValue<TeamProfileEditFormData>;
}

export function TeamProfileEditBasicInfoSection({
  logoId,
  shortIntro,
  register,
  setValue,
}: TeamProfileEditBasicInfoSectionProps) {
  const shortIntroField = register('shortIntro', { maxLength: 15 });

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-bold text-slate-700">팀 로고</Label>
        <div className="grid grid-cols-4 gap-2">
          {TEAM_LOGO_OPTIONS.map((logo) => (
            <button
              key={logo.id}
              type="button"
              onClick={() =>
                setValue('logoId', logo.url, {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
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

      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">
          한줄 소개 <span className="text-red-500">*</span>
        </Label>
        <Input
          {...shortIntroField}
          placeholder="예: 매주 수요일에 봐요"
          className="h-12"
          maxLength={15}
          onChange={(e) => {
            const sanitized = sanitizeShortIntro(e.target.value);
            e.target.value = sanitized;
            shortIntroField.onChange(e);
          }}
        />
        <p className="text-xs text-slate-400 text-right">{shortIntro.length}/15</p>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">팀 소개</Label>
        <Textarea
          {...register('description')}
          placeholder="팀을 소개해주세요"
          rows={4}
        />
      </div>
    </div>
  );
}
