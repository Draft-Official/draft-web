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
import { TimePickerSelect } from '@/shared/ui/base/time-picker-select';
// import ScrollContainer from 'react-indiana-drag-scroll'; // Moved to internal component
import { DateStrip } from '@/features/match/ui/components/date-strip';
import { SelectedLocationCard } from './selected-location-card';

interface LocationData {
  address: string;
  buildingName?: string;
  bname?: string;
  placeUrl?: string;
  x?: string;
  y?: string;
  kakaoPlaceId?: string;
}

interface MatchCreateBasicInfoProps {
  selectedDate: string | null;
  setSelectedDate: (date: string) => void;
  calendarDates: any[];
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
  const { register, control, setValue, getValues } = useFormContext();
  const methods = { getValues }; // Helper to match prev code

  // Fee Persistence
  const lastCostRef = useRef<string>("10000");
  const lastBeverageRef = useRef<string>("1");

  return (
    <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-400" />
            기본 정보
        </h2>

        {/* Date */}
        <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                경기 날짜 
                {selectedDate && (() => {
                    const [_, m, d] = selectedDate.split('-');
                    return <span className="text-[#FF6600]">{parseInt(m)}월 {parseInt(d)}일</span>;
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
                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0 group-hover:text-[#FF6600]" />
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
                                            className="px-3 py-3 text-slate-400 hover:text-[#FF6600] transition-colors flex-shrink-0"
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
                    <span className={cn("text-xs font-bold", feeType === 'cost' ? "text-[#FF6600]" : "text-slate-400")}>현금</span>
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
                        className="data-[state=checked]:bg-[#FF6600] data-[state=unchecked]:bg-slate-200" 
                    />
                    <span className={cn("text-xs font-bold", feeType === 'beverage' ? "text-[#FF6600]" : "text-slate-400")}>음료</span>
                </div>
            </div>
            <div className="relative">
                <Input
                    type="number"
                    {...register('fee', { required: true })}
                    defaultValue="10000"
                    className="h-12 bg-white border-slate-200 pr-10 text-right font-bold text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder={feeType === 'cost' ? '10000' : '1'}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">
                    {feeType === 'cost' ? '원' : '병'}
                </span>
            </div>

            {/* Beverage Checkbox */}
            <button
                type="button"
                onClick={() => setHasBeverage(!hasBeverage)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors"
            >
                <div className={cn(
                    "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                    hasBeverage
                        ? "bg-[#FF6600] border-[#FF6600]"
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
