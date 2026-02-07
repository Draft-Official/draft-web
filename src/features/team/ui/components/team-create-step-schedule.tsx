'use client';

import { useRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Calendar, MapPin } from 'lucide-react';

import { Input } from '@/shared/ui/base/input';
import { Label } from '@/shared/ui/base/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/base/select';
import { TimePickerSelect } from '@/shared/ui/base/time-picker-select';
import { cn } from '@/shared/lib/utils';

import { StepHeader } from './step-header';
import { SelectedLocationCard } from '@/features/match-create/ui/components/selected-location-card';
import { REGULAR_DAY_OPTIONS, type RegularDayValue } from '@/shared/config/team-constants';
import type { LocationData } from '@/features/match-create/model/types';

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
  location: string;
  locationData: LocationData | null;
  locationSearchResults: LocationData[];
  showLocationDropdown: boolean;
  isExistingGym: boolean;
  onLocationSearch: (query: string) => void;
  onLocationSelect: (data: LocationData) => void;
  onClearLocation: () => void;
}

export function TeamCreateStepSchedule({
  regularDay,
  location,
  locationData,
  locationSearchResults,
  showLocationDropdown,
  isExistingGym,
  onLocationSearch,
  onLocationSelect,
  onClearLocation,
}: TeamCreateStepScheduleProps) {
  const { control, setValue } = useFormContext();
  const locationInputRef = useRef<HTMLDivElement>(null);

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
      <div className="space-y-2">
        <Label className="text-sm font-bold text-slate-700">홈구장</Label>
        {locationData ? (
          <SelectedLocationCard
            location={locationData}
            isExistingGym={isExistingGym}
            onClear={onClearLocation}
          />
        ) : (
          <div className="relative" ref={locationInputRef}>
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
            <Input
              placeholder="체육관 검색 (예: 서초종합체육관)"
              value={location}
              onChange={(e) => onLocationSearch(e.target.value)}
              className="pl-10 h-12"
            />
            {showLocationDropdown && locationSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-[200px] overflow-y-auto">
                {locationSearchResults.map((result, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => onLocationSelect(result)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                  >
                    <div className="text-sm font-medium text-slate-900">
                      {result.buildingName || result.address}
                    </div>
                    {result.buildingName && (
                      <div className="text-xs text-slate-500">{result.address}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
