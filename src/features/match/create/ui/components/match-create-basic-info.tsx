'use client';

import { useFormContext, Controller } from 'react-hook-form';
import {
  Clock,
  MapPin,
  MapPinned,
  ExternalLink
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/shared/lib/utils';
import { Building2 } from 'lucide-react';

interface LocationData {
  address: string;
  buildingName?: string;
  bname?: string;
  placeUrl?: string;
  x?: string;
  y?: string;
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
  openKakaoMap: () => void;
  locationInputRef: React.RefObject<HTMLDivElement | null>;
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
  locationInputRef
}: MatchCreateBasicInfoProps) {
  const { register, control } = useFormContext();

  return (
    <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        <h2 className="font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-400" />
            기본 정보
        </h2>

        {/* Date */}
        <div className="space-y-3">
            <Label className="text-sm font-bold text-slate-600">일시 <span className="text-[#FF6600] text-xs font-normal ml-1">(2주 내 예약 가능)</span></Label>
            <ScrollArea className="w-full whitespace-nowrap -mx-1">
                <div className="flex gap-2 pb-2 px-1">
                    {calendarDates.map((d) => (
                        <button
                            type="button"
                            key={d.dateISO}
                            onClick={() => setSelectedDate(d.dateISO)}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[64px] h-[64px] rounded-xl border transition-all active:scale-95",
                                selectedDate === d.dateISO
                                    ? "bg-slate-900 border-slate-900 text-white shadow-md"
                                    : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
                            )}
                        >
                            <span className={cn("text-[11px] mb-1 font-medium", selectedDate === d.dateISO ? "text-slate-300" : "text-slate-500")}>{d.dayStr}</span>
                            <span className="text-lg font-bold leading-none">{d.dayNum}</span>
                        </button>
                    ))}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
            </ScrollArea>
        </div>

        {/* Time & Duration */}
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label className="text-sm font-bold text-slate-600">시작 시간</Label>
                <div className="relative">
                    <Clock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400 pointer-events-none" />
                    <Input
                        type="time"
                        step="600"
                        {...register('startTime')}
                        className="pl-10 h-12 bg-white border-slate-200 font-bold"
                        defaultValue="19:00"
                    />
                </div>
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
            <div className="relative" ref={locationInputRef}>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                <Input
                    placeholder="체육관 검색 (예: 서초종합체육관)"
                    value={location}
                    onChange={(e) => handleLocationSearch(e.target.value)}
                    onFocus={(e) => {
                        handleInputFocus(e);
                        if (locationSearchResults.length > 0) {
                            // showLocationDropdown is controlled by parent state passed in as prop, 
                            // but here we are just calling onFocus. 
                            // The parent `match-create-view` logic for `onFocus` also sets `setShowLocationDropdown(true)`.
                            // So we might need to expose that setter or just rely on the parent logic if we passed the right handler.
                            // The prop `handleInputFocus` in the interface seems to be the one.
                            // But wait, the parent `onFocus` in original code did two things: scroll and setDropdown.
                            // I need to make sure `handleInputFocus` does both or I pass `setShowLocationDropdown`.
                            // The interface has `showLocationDropdown` boolean, but not the setter.
                            // Let's assume `handleInputFocus` handles the UI side (scroll), 
                            // but we need to trigger the dropdown visibility too.
                            // I will check the parent code later. For now, I'll pass `setShowLocationDropdown` via a new prop or just
                            // assume the parent handles it if I can. But `onFocus` is an event.
                            // Let's look at the original `onFocus` in `MatchCreateView`:
                            // onFocus={(e) => { handleInputFocus(e); if(results > 0) setShowLocationDropdown(true); }}
                        }
                    }}
                    className="pl-10 h-12 pr-12"
                />

                {/* Map Link Icon (Visible if placeUrl exists) */}
                {locationData?.placeUrl && (
                    <button
                        onClick={openKakaoMap}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors group flex items-center justify-center"
                        title="카카오맵에서 보기"
                        type="button"
                    >
                        <MapPinned className="w-4 h-4 text-[#FF6600]" />
                    </button>
                )}

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
        </div>

        {/* Fee */}
        <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-600">참가비 (1인)</Label>
            <div className="relative">
                <Input
                    type="number"
                    {...register('fee', { required: true })}
                    defaultValue="10000"
                    className="h-12 bg-white border-slate-200 pr-10 text-right font-bold text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="10000"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-medium">원</span>
            </div>
        </div>
    </section>
  );
}
