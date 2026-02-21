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
import type { TeamProfileEditFormData } from './types';

interface TeamProfileEditScheduleSectionProps {
  regularDay: RegularDayValue | '';
  control: Control<TeamProfileEditFormData>;
  setValue: UseFormSetValue<TeamProfileEditFormData>;
  locationData: LocationData | null;
  onLocationResolvedChange: (next: LocationSearchResolvedValue) => void;
}

export function TeamProfileEditScheduleSection({
  regularDay,
  control,
  setValue,
  locationData,
  onLocationResolvedChange,
}: TeamProfileEditScheduleSectionProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">
          정기 운동 요일 <span className="text-red-500">*</span>
        </Label>
        <Select
          value={regularDay}
          onValueChange={(value) =>
            setValue('regularDay', value as RegularDayValue, {
              shouldDirty: true,
              shouldTouch: true,
            })
          }
        >
          <SelectTrigger className="h-(--dimension-x12) bg-white border-border font-bold">
            <SelectValue placeholder="요일 선택" />
          </SelectTrigger>
          <SelectContent>
            {REGULAR_DAY_OPTIONS.map((day) => (
              <SelectItem key={day.value} value={day.value}>
                {day.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
