'use client';

import { useRef } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import {
  MapPin,
  ExternalLink,
  Building2
} from 'lucide-react';
import { Input } from '@/shared/ui/base/input';
import { Label } from '@/shared/ui/base/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/base/select';
import { cn } from '@/shared/lib/utils';
import { Switch } from '@/shared/ui/base/switch';
import { TimePickerSelect } from '@/shared/ui/composite/time-picker-select';
// import ScrollContainer from 'react-indiana-drag-scroll'; // Moved to internal component
import { DateStrip } from '@/features/match/ui/components/date-strip';
import { SelectedLocationCard } from './selected-location-card';
import type { LocationData } from '@/features/match-create/model/types';
import type { DateOption } from '@/features/match-create/lib/utils';

interface MatchCreateBasicInfoProps {
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  calendarDates: DateOption[];
  location: string;
  handleLocationSearch: (query: string) => void;
  handleInputFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  showLocationDropdown: boolean;
  locationSearchResults: LocationData[];
  handleLocationSelect: (data: LocationData) => void;
  locationData: LocationData | null;
  openKakaoMap?: () => void; // Optional - not used when card is shown
  locationInputRef: React.RefObject<HTMLDivElement | null>;
  children?: React.ReactNode;
  feeType: "cost" | "beverage";
  setFeeType: (v: "cost" | "beverage") => void;
  hasBeverage: boolean;
  setHasBeverage: (v: boolean) => void;
  isExistingGym?: boolean;
  onClearLocation?: () => void;
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
  location,
  handleLocationSearch,
  handleInputFocus,
  showLocationDropdown,
  locationSearchResults,
  handleLocationSelect,
  locationData,
  openKakaoMap,
  locationInputRef,
  children,
  feeType,
  setFeeType,
  hasBeverage,
  setHasBeverage,
  isExistingGym = false,
  onClearLocation
}: MatchCreateBasicInfoProps) {
  void openKakaoMap;

  const { register, control, setValue, getValues, watch } = useFormContext();
  const methods = { getValues }; // Helper to match prev code

  // Watch startTime and duration for time range display
  const startTime = watch('startTime', '19:00');
  const duration = watch('duration', '2');
  const feeValue = watch('fee', '10000');

  // Fee Persistence
  const lastCostRef = useRef<string>("10000");
  const lastBeverageRef = useRef<string>("1");

  // 음수 입력 차단 핸들러
  const handleFeeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === '-' || e.key === 'e' || e.key === 'E') {
      e.preventDefault();
    }
  };

  // 참가비 입력 핸들러 (양의 정수만, 음료는 1 이상)
  const handleFeeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 허용
    if (feeType === 'beverage' && value === '0') {
      setValue('fee', '1'); // 음료는 최소 1개
    } else {
      setValue('fee', value);
    }
  };

  return (
    <section className="bg-white px-5 py-6 space-y-6 rounded-xl border border-slate-200">
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
                className="-mx-5 w-[calc(100%+40px)]" // Negative margin to bleed to edge
                listClassName="px-5" // Content alignment
            />
        </div>

        {/* Time & Duration */}
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">시작 시간</Label>
                <Controller
                    name="startTime"
                    control={control}
                    defaultValue="19:00"
                    render={({ field }) => (
                        <TimePickerSelect
                            value={field.value}
                            onValueChange={field.onChange}
                            defaultValue="19:00"
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

        {/* Location - Kakao Map Search */}
        <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-900 mb-2 block">장소</Label>

            {locationData ? (
                <SelectedLocationCard
                    location={locationData}
                    isExistingGym={isExistingGym}
                    onClear={() => onClearLocation?.()}
                />
            ) : (
                <div className="relative" ref={locationInputRef}>
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                    <Input
                        placeholder="체육관 검색 (예: 서초종합체육관)"
                        value={location}
                        onChange={(e) => handleLocationSearch(e.target.value)}
                        onFocus={(e) => {
                            handleInputFocus(e);
                        }}
                        className="pl-10 h-12 pr-12"
                    />

                    {/* Search Results Dropdown */}
                    {showLocationDropdown && locationSearchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-[240px] overflow-y-auto">
                            {locationSearchResults.map((result, index) => (
                                <div
                                    key={index}
                                    className="w-full flex items-center justify-between border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors group"
                                >
                                    {/* Main Select Action */}
                                    <button
                                        onClick={() => handleLocationSelect(result)}
                                        className="flex-1 px-4 py-3 text-left flex items-start gap-2 min-w-0"
                                        type="button"
                                    >
                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0 group-hover:text-primary" />
                                        <div className="flex-1 min-w-0">
                                            {result.buildingName && (
                                                <div className="text-sm font-bold text-slate-900 mb-0.5 truncate">
                                                    {result.buildingName}
                                                </div>
                                            )}
                                            <div className={cn(
                                                "text-xs text-slate-600 truncate",
                                                !result.buildingName && "text-sm font-medium text-slate-900"
                                            )}>
                                                {result.address}
                                            </div>
                                        </div>
                                    </button>

                                    {/* External Link Icon */}
                                    {result.placeUrl && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(result.placeUrl, '_blank');
                                            }}
                                            className="px-3 py-3 text-slate-400 hover:text-primary transition-colors flex-shrink-0"
                                            title="카카오맵에서 보기"
                                            type="button"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>

        {children}

            {/* Fee */}
        <div className="space-y-2 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-slate-600">참가비 (1인)</Label>
                <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-bold", feeType === 'cost' ? "text-primary" : "text-slate-400")}>현금</span>
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
                                setValue('fee', lastCostRef.current || '10000');
                            }
                        }}
                        className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-slate-200" 
                    />
                    <span className={cn("text-xs font-bold", feeType === 'beverage' ? "text-primary" : "text-slate-400")}>음료</span>
                </div>
            </div>
            <div className="relative">
                <Input
                    type="text"
                    inputMode="numeric"
                    {...register('fee', { required: true })}
                    onChange={handleFeeChange}
                    onKeyDown={handleFeeKeyDown}
                    defaultValue="10000"
                    className="h-12 bg-white border-slate-200 pr-10 text-right font-bold text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder={feeType === 'cost' ? '10000' : '1'}
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
