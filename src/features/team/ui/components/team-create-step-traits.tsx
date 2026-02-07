'use client';

import { useFormContext } from 'react-hook-form';
import { Settings } from 'lucide-react';

import { Label } from '@/shared/ui/base/label';
import { Chip } from '@/shared/ui/base/chip';
import { SkillRangeSlider } from '@/shared/ui/base/skill-range-slider';

import { StepHeader } from './step-header';
import { AgeSelector } from '@/features/match-create/ui/components/age-selector';
import { GENDER_OPTIONS, type GenderValue } from '@/shared/config/constants';

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
            <Chip
              key={g.value}
              label={g.label}
              variant="navy"
              isActive={gender === g.value}
              showCheckIcon={false}
              onClick={() => setValue('gender', g.value)}
            />
          ))}
        </div>
      </div>

      {/* 나이 */}
      <div className="space-y-3">
        <Label className="text-sm font-bold text-slate-700">평균 나이</Label>
        <AgeSelector
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
