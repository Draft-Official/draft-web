'use client';

import { useFormContext } from 'react-hook-form';
import { Settings } from 'lucide-react';

import { Label } from '@/shared/ui/shadcn/label';
import { Toggle } from '@/shared/ui/shadcn/toggle';
import { SkillRangeSlider } from '@/shared/ui/composite/skill-range-slider';
import { AgeRangeSelector } from '@/shared/ui/composite/age-range-selector';

import { StepHeader } from './step-header';
import { GENDER_OPTIONS, type GenderValue } from '@/shared/config/match-constants';

interface TeamCreateStepTraitsProps {
  gender: GenderValue;
  selectedAges: string[];
  levelMin: number;
  levelMax: number;
  onAgeSelection: (age: string) => void;
}

export function TeamCreateStepTraits({
  gender,
  selectedAges,
  levelMin,
  levelMax,
  onAgeSelection,
}: TeamCreateStepTraitsProps) {
  const { setValue } = useFormContext();

  return (
    <div className="space-y-6">
      <StepHeader step={3} title="팀 특성" icon={Settings} />

      {/* 성별 */}
      <div className="space-y-3">
        <Label className="text-sm font-bold text-slate-700">성별</Label>
        <div className="flex gap-2">
          {GENDER_OPTIONS.map((g) => (
            <Toggle
              key={g.value}
              variant="outline"
              pressed={gender === g.value}
              onPressedChange={() => setValue('gender', g.value)}
              className="h-9 rounded-lg px-4 text-sm font-medium"
            >
              {g.label}
            </Toggle>
          ))}
        </div>
      </div>

      {/* 나이 */}
      <div className="space-y-3">
        <Label className="text-sm font-bold text-slate-700">평균 나이</Label>
        <AgeRangeSelector
          selectedAges={selectedAges}
          onSelect={onAgeSelection}
          onRangeUpdate={(ages) => setValue('selectedAges', ages)}
        />
      </div>

      {/* 실력 */}
      <div className="space-y-3">
        <Label className="text-sm font-bold text-slate-700">평균 실력</Label>
        <SkillRangeSlider
          minValue={levelMin}
          maxValue={levelMax}
          onChange={(min, max) => {
            setValue('levelMin', min);
            setValue('levelMax', max);
          }}
        />
      </div>
    </div>
  );
}
