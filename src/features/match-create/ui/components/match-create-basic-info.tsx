'use client';

import { useRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
  Building2
} from 'lucide-react';
import { Input } from '@/shared/ui/shadcn/input';
import { Label } from '@/shared/ui/shadcn/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/shadcn/select';
import { cn } from '@/shared/lib/utils';
import { Switch } from '@/shared/ui/shadcn/switch';
import { TimePickerSelect } from '@/shared/ui/composite/time-picker-select';
// import ScrollContainer from 'react-indiana-drag-scroll'; // Moved to internal component
import { DateStrip } from '@/shared/ui/composite/date-strip';
import { LocationSearchField } from '@/shared/ui/composite/location-search-field';
import type { LocationSearchResolvedValue } from '@/shared/lib/hooks/use-location-search';
import type { LocationData } from '@/shared/types/location.types';
import type { DateOption } from '@/features/match-create/lib/utils';

interface MatchCreateBasicInfoProps {
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  calendarDates: DateOption[];
  handleInputFocus: (e: React.FocusEvent<HTMLInputElement>) => void;
  locationData: LocationData | null;
  onLocationResolvedChange: (next: LocationSearchResolvedValue) => void;
  children?: React.ReactNode;
  feeType: "cost" | "beverage";
  setFeeType: (v: "cost" | "beverage") => void;
  hasBeverage: boolean;
  setHasBeverage: (v: boolean) => void;
}

const DURATION_OPTIONS = [
    { label: '1시간', value: '1' },
    { label: '1시간 30분', value: '1.5' },
    { label: '2시간', value: '2' },
    { label: '2시간 30분', value: '2.5' },
    { label: '3시간', value: '3' },
    { label: '3시간 30분', value: '3.5' },
    { label: '4시간', value: '4' },
];

// 종료 시간 계산 헬퍼 함수
function calculateEndTime(startTime: string, duration: string): string {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const durationHours = parseFloat(duration);
  const totalMinutes = startHour * 60 + startMin + (durationHours * 60);
  const endHour = Math.floor(totalMinutes / 60) % 24;
  const endMin = totalMinutes % 60;
  return `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
}

// 시간 포맷 헬퍼 (HH:mm 형식 유지)
function formatTimeDisplay(time: string): string {
  return time;
}

export function MatchCreateBasicInfo({
  selectedDate,
  setSelectedDate,
  calendarDates,
  handleInputFocus,
  locationData,
  onLocationResolvedChange,
  children,
  feeType,
  setFeeType,
  hasBeverage,
  setHasBeverage
}: MatchCreateBasicInfoProps) {
  const { register, control, setValue, getValues, watch } = useFormContext();
  const methods = { getValues }; // Helper to match prev code

  // Watch startTime and duration for time range display
  const startTime = watch('startTime');
  const duration = watch('duration', '2');
  const feeValue = watch('fee', '10000');

  // Fee Persistence
  const lastCostRef = useRef<string>("");
  const lastBeverageRef = useRef<string>("1");

  // 음수 입력 차단 핸들러
  const handleFeeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  // register에서 onChange/onBlur를 분리하여 커스텀 핸들러와 통합
  const feeRegistration = register('fee', { required: true });

  // 참가비 입력 핸들러 (양의 정수만, 음료는 1 이상)
  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
    e.target.value = value; // input 값을 직접 업데이트
    if (feeType === 'beverage') {
      if (value === '0') {
        setValue('fee', '1', { shouldValidate: true });
        e.target.value = '1';
      } else if (Number(value) > 5) {
        setValue('fee', '5', { shouldValidate: true });
        e.target.value = '5';
      }
    }
    // register의 onChange도 호출하여 react-hook-form 상태 동기화
    feeRegistration.onChange(e);
  };

  return (
    <section className="bg-white px-5 py-6 space-y-6">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-400" />
            기본 정보
        </h2>

        {/* Date */}
        <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                경기 날짜
                {selectedDate && (() => {
                    const [, m, d] = selectedDate.split('-');
                    if (!startTime) {
                      return (
                        <span className="text-primary">
                          {parseInt(m)}월 {parseInt(d)}일
                        </span>
                      );
                    }
                    const endTime = calculateEndTime(startTime, duration);
                    const timeRange = `${formatTimeDisplay(startTime)} ~ ${formatTimeDisplay(endTime)}`;
                    return (
                      <span className="text-primary">
                        {parseInt(m)}월 {parseInt(d)}일 {timeRange}
                      </span>
                    );
                })()}
                <span className="text-slate-400 text-xs font-normal ml-auto">(2주 이내의 경기만 게시 가능)</span>
            </Label>
            <DateStrip
                dates={calendarDates}
                selectedDate={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                showAllOption={false}
                className="-mx-(--dimension-spacing-x-global-gutter)"
                listClassName="px-(--dimension-spacing-x-global-gutter)"
            />
        </div>

        {/* Time & Duration */}
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">시작 시간</Label>
                <Controller
                    name="startTime"
                    control={control}
                    render={({ field }) => (
                        <TimePickerSelect
                            value={field.value}
                            onValueChange={field.onChange}
                        />
                    )}
                />
            </div>

            <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">진행 시간</Label>
                <Controller
                    name="duration"
                    control={control}
                    defaultValue="2"
                    render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="h-12 bg-white border-border font-bold">
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

        <LocationSearchField
            label="장소"
            value={locationData}
            onResolvedChange={onLocationResolvedChange}
            onInputFocus={handleInputFocus}
        />

        {children}

            {/* Fee */}
        <div className="space-y-2 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-slate-600">참가비 (1인)</Label>
                <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-bold", feeType === 'cost' ? "text-slate-800" : "text-slate-400")}>현금</span>
                    <Switch
                        checked={feeType === 'beverage'}
                        onCheckedChange={(c) => {
                            const newType = c ? 'beverage' : 'cost';
                            // Save current value
                            const currentVal = methods.getValues('fee');
                            if (feeType === 'cost') {
                                lastCostRef.current = currentVal;
                            } else {
                                lastBeverageRef.current = currentVal;
                            }

                            setFeeType(newType);
                            
                            // Restore or Default
                            if (newType === 'beverage') {
                                setValue('fee', lastBeverageRef.current || '1');
                            } else {
                                setValue('fee', lastCostRef.current);
                            }
                        }}
                        size="flat"
                        className="data-[state=checked]:bg-slate-800 data-[state=unchecked]:bg-slate-200" 
                    />
                    <span className={cn("text-sm font-bold", feeType === 'beverage' ? "text-slate-800" : "text-slate-400")}>음료</span>
                </div>
            </div>
            <div className="relative">
                <Input
                    type="text"
                    inputMode="numeric"
                    name={feeRegistration.name}
                    ref={feeRegistration.ref}
                    onBlur={feeRegistration.onBlur}
                    onChange={handleFeeChange}
                    onKeyDown={handleFeeKeyDown}
                    className="h-12 bg-white border-slate-200 pr-10 text-right font-bold text-lg placeholder:text-slate-400 placeholder:font-normal placeholder:text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder={feeType === 'cost' ? '0 입력시 무료 매치로 등록됩니다' : '1'}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                    {feeType === 'cost' ? '원' : '병'}
                </span>
            </div>
            {feeType === 'cost' && feeValue === '0' && (
                <p className="text-xs text-green-600 font-medium">무료 매치로 등록됩니다</p>
            )}

            {/* Beverage Checkbox */}
            <button
                type="button"
                onClick={() => setHasBeverage(!hasBeverage)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
                <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    hasBeverage
                        ? "bg-primary border-primary"
                        : "bg-white border-slate-300"
                )}>
                    {hasBeverage && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
                <span className="text-sm font-medium text-slate-700">음료/물 제공</span>
            </button>
        </div>
    </section>
  );
}
