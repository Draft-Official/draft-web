'use client';

import type { Control, UseFormSetValue } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Label } from '@/shared/ui/shadcn/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/shadcn/select';
import { TimePickerSelect } from '@/shared/ui/composite/time-picker-select';
import { LocationSearchField } from '@/shared/ui/composite/location-search-field';
import type { LocationData } from '@/shared/types/location.types';
import type { LocationSearchResolvedValue } from '@/shared/lib/hooks/use-location-search';
import { TEAM_DURATION_OPTIONS } from '@/features/team/lib';
import {
  REGULAR_DAY_OPTIONS,
  type RegularDayValue,
} from '@/shared/config/team-constants';
import { cn } from '@/shared/lib/utils';
import type { TeamProfileEditFormData } from '../../edit/types';

interface TeamProfileEditScheduleSectionProps {
  regularDays: RegularDayValue[];
  control: Control<TeamProfileEditFormData>;
  setValue: UseFormSetValue<TeamProfileEditFormData>;
  locationData: LocationData | null;
  onLocationResolvedChange: (next: LocationSearchResolvedValue) => void;
}

export function TeamProfileEditScheduleSection({
  regularDays,
  control,
  setValue,
  locationData,
  onLocationResolvedChange,
}: TeamProfileEditScheduleSectionProps) {
  const toggleDay = (day: RegularDayValue) => {
    const next = regularDays.includes(day)
      ? regularDays.filter((d) => d !== day)
      : [...regularDays, day];
    setValue('regularDays', next, { shouldDirty: true, shouldTouch: true });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">
          정기 운동 요일 <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-7 gap-1.5">
          {REGULAR_DAY_OPTIONS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center text-base font-bold transition-all border',
                regularDays.includes(day.value)
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              {day.shortLabel}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-700">시작 시간</Label>
          <Controller
            name="regularTime"
            control={control}
            render={({ field }) => (
              <TimePickerSelect
                value={field.value}
                onValueChange={field.onChange}
                defaultValue="20:00"
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-bold text-slate-700">진행 시간</Label>
          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="h-(--dimension-x12) bg-white border-border font-bold">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      <LocationSearchField
        label="홈구장"
        required
        value={locationData}
        onResolvedChange={onLocationResolvedChange}
      />
    </div>
  );
}
