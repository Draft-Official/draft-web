'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { Calendar } from 'lucide-react';
import { Label } from '@/shared/ui/shadcn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/select';
import { TimePickerSelect } from '@/shared/ui/composite/time-picker-select';
import { cn } from '@/shared/lib/utils';
import type { LocationSearchResolvedValue } from '@/shared/lib/hooks/use-location-search';

import { StepHeader } from './step-header';
import { LocationSearchField } from '@/shared/ui/composite/location-search-field';
import { REGULAR_DAY_OPTIONS, type RegularDayValue } from '@/shared/config/team-constants';
import type { LocationData } from '@/shared/types/location.types';

// 진행 시간 옵션
const DURATION_OPTIONS = [
  { label: '1시간', value: '1' },
  { label: '1시간 30분', value: '1.5' },
  { label: '2시간', value: '2' },
  { label: '2시간 30분', value: '2.5' },
  { label: '3시간', value: '3' },
  { label: '3시간 30분', value: '3.5' },
  { label: '4시간', value: '4' },
];

interface TeamCreateStepScheduleProps {
  regularDay: RegularDayValue | '';
  locationData: LocationData | null;
  onLocationResolvedChange: (next: LocationSearchResolvedValue) => void;
}

export function TeamCreateStepSchedule({
  regularDay,
  locationData,
  onLocationResolvedChange,
}: TeamCreateStepScheduleProps) {
  const { control, setValue } = useFormContext();

  return (
    <div className="space-y-6">
      <StepHeader step={2} title="운동 정보" icon={Calendar} />

      {/* 정기 운동 요일 */}
      <div className="space-y-3">
        <Label className="text-sm font-bold text-slate-700">
          정기 운동 요일 <span className="text-red-500">*</span>
        </Label>
        <div className="grid grid-cols-7 gap-1.5">
          {REGULAR_DAY_OPTIONS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => setValue('regularDay', regularDay === day.value ? '' : day.value)}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center text-base font-bold transition-all border',
                regularDay === day.value
                  ? 'bg-slate-800 text-white border-slate-800'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              )}
            >
              {day.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* 시작 시간 & 진행 시간 */}
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
                <SelectTrigger className="h-12 bg-white border-slate-200 font-bold">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>

      {/* 홈구장 */}
      <LocationSearchField
        label="홈구장"
        required
        value={locationData}
        onResolvedChange={onLocationResolvedChange}
      />
    </div>
  );
}
