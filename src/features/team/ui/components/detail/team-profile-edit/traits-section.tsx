'use client';

import type { UseFormSetValue } from 'react-hook-form';
import { Label } from '@/shared/ui/shadcn/label';
import { Toggle } from '@/shared/ui/shadcn/toggle';
import { AgeRangeSelector } from '@/shared/ui/composite/age-range-selector';
import { SkillRangeSlider } from '@/shared/ui/composite/skill-range-slider';
import { GENDER_OPTIONS, type GenderValue } from '@/shared/config/match-constants';
import type { TeamProfileEditFormData } from './types';

interface TeamProfileEditTraitsSectionProps {
  gender: GenderValue;
  selectedAges: string[];
  levelMin: number;
  levelMax: number;
  onAgeSelection: (age: string) => void;
  setValue: UseFormSetValue<TeamProfileEditFormData>;
}

export function TeamProfileEditTraitsSection({
  gender,
  selectedAges,
  levelMin,
  levelMax,
  onAgeSelection,
  setValue,
}: TeamProfileEditTraitsSectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-bold text-slate-700">성별</Label>
        <div className="flex gap-2">
          {GENDER_OPTIONS.map((option) => (
            <Toggle
              key={option.value}
              variant="outline"
              pressed={gender === option.value}
              onPressedChange={() =>
                setValue('gender', option.value, {
                  shouldDirty: true,
                  shouldTouch: true,
                })
              }
              className="h-9 rounded-lg px-4 text-sm font-medium"
            >
              {option.label}
            </Toggle>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-bold text-slate-700">평균 나이</Label>
        <AgeRangeSelector
          selectedAges={selectedAges}
          onSelect={onAgeSelection}
          onRangeUpdate={(ages) =>
            setValue('selectedAges', ages, {
              shouldDirty: true,
              shouldTouch: true,
            })
          }
        />
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-bold text-slate-700">평균 실력</Label>
        <SkillRangeSlider
          minValue={levelMin}
          maxValue={levelMax}
          onChange={(min, max) => {
            setValue('levelMin', min, { shouldDirty: true, shouldTouch: true });
            setValue('levelMax', max, { shouldDirty: true, shouldTouch: true });
          }}
        />
      </div>
    </div>
  );
}
