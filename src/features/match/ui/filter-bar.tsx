'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Bell, ChevronDown, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from '@/shared/lib/utils';
import { REGIONS } from '@/shared/lib/constants/regions';

// Hook to detect scroll with hysteresis to prevent flickering
const useScrollDirection = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const SCROLL_DOWN_THRESHOLD = 60; // Hide header when scrolling down past this
    const SCROLL_UP_THRESHOLD = 20;   // Show header when scrolling up below this

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (!isScrolled && scrollY > SCROLL_DOWN_THRESHOLD) {
        // Scrolled down past threshold - hide header
        setIsScrolled(true);
      } else if (isScrolled && scrollY < SCROLL_UP_THRESHOLD) {
        // Scrolled up below threshold - show header
        setIsScrolled(false);
      }
      // Do nothing in the middle zone (20-60px) to prevent flickering
    };

    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, [isScrolled]);

  return isScrolled;
};

interface FilterBarProps {
  selectedDateISO: string | null;
  onDateSelect: (date: string | null) => void;
  selectedPositions: string[];
  onPositionsChange: (positions: string[]) => void;
  selectedLocations: string[];
  onLocationsChange: (locations: string[]) => void;
  selectedPriceMax?: number | null;
  onPriceMaxChange?: (price: number | null) => void;
  isHideClosed?: boolean;
  onHideClosedChange?: (hide: boolean) => void;
}

// --- Date Helpers ---
const getNext14Days = () => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dates = [];
  const today = new Date();

  for(let i=0; i<14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const day = days[d.getDay()];

    dates.push({
      dateISO: d.toISOString().split('T')[0],
      label: `${month}월 ${date}일 (${day})`,
      shortLabel: `${month}.${date} (${day})`,
      dayNum: date,
      dayStr: day,
      isToday: i === 0,
    });
  }
  return dates;
};

const LOCATIONS = {
  "서울": ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"],
  "경기": ["수원시", "고양시", "용인시", "성남시", "부천시", "화성시", "안산시", "남양주시", "안양시", "평택시", "의정부시", "파주시", "시흥시", "김포시", "광명시", "광주시", "군포시", "오산시", "이천시", "양주시", "안성시", "구리시", "포천시", "의왕시", "하남시", "여주시"],
  "인천": ["중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구", "강화군", "옹진군"]
};

export function FilterBar({
  selectedDateISO,
  onDateSelect,
  selectedPositions,
  onPositionsChange,
  selectedLocations,
  onLocationsChange,
  selectedPriceMax = null,
  onPriceMaxChange,
  isHideClosed = false,
  onHideClosedChange,
}: FilterBarProps) {
  // -- Scroll Detection --
  const isScrolled = useScrollDirection();

  // -- Modal Open States --
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isPositionOpen, setIsPositionOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);

  // -- Temp States for Modals --
  const [tempSelectedLocations, setTempSelectedLocations] = useState<string[]>([]);
  const [activeRegionTab, setActiveRegionTab] = useState<"서울" | "경기" | "인천">("서울");
  const [tempSelectedPositions, setTempSelectedPositions] = useState<string[]>([]);
  const [tempPriceMax, setTempPriceMax] = useState<number | null>(null);

  // -- Sync Temp State on Open --
  useEffect(() => {
    if (isLocationOpen) setTempSelectedLocations([...selectedLocations]);
  }, [isLocationOpen, selectedLocations]);

  useEffect(() => {
    if (isPositionOpen) setTempSelectedPositions([...selectedPositions]);
  }, [isPositionOpen, selectedPositions]);

  useEffect(() => {
    if (isPriceOpen) setTempPriceMax(selectedPriceMax);
  }, [isPriceOpen, selectedPriceMax]);

  const calendarDates = useMemo(() => getNext14Days(), []);

  // --- Filter Logic ---

  // 1. Location
  const toggleTempLocation = (fullLoc: string) => {
    setTempSelectedLocations(prev => prev.includes(fullLoc) ? prev.filter(l => l !== fullLoc) : [...prev, fullLoc]);
  };
  const applyLocationFilter = () => {
    onLocationsChange(tempSelectedLocations);
    setIsLocationOpen(false);
  };
  const resetLocationFilter = () => {
    setTempSelectedLocations([]);
  };

  // Count selected locations per region
  const getRegionCount = (region: string) => {
    return tempSelectedLocations.filter(loc => loc.startsWith(region)).length;
  };

  // 2. Position
  const toggleTempPosition = (pos: string) => {
    if (pos === '포지션 무관') {
      setTempSelectedPositions(prev => prev.includes('포지션 무관') ? [] : ['포지션 무관']);
    } else {
      setTempSelectedPositions(prev => {
        let next = prev.filter(p => p !== '포지션 무관');
        return next.includes(pos) ? next.filter(p => p !== pos) : [...next, pos];
      });
    }
  };
  const applyPositionFilter = () => {
    onPositionsChange(tempSelectedPositions);
    setIsPositionOpen(false);
  };

  // 3. Price
  const applyPriceFilter = () => {
    if (onPriceMaxChange) {
      onPriceMaxChange(tempPriceMax);
    }
    setIsPriceOpen(false);
  };

  return (
    // --- Sticky Header Area ---
    <div className="bg-white sticky top-0 z-20 shadow-sm border-b border-slate-100">
      {/* 1. Top Bar: Logo & Actions - Hidden on scroll */}
      <div className={cn(
        "flex items-center justify-between px-4 h-14 w-full bg-white z-20 transition-all duration-300 overflow-hidden",
        isScrolled ? "h-0 opacity-0" : "h-14 opacity-100"
      )}>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          게스트 모집
        </h1>
        <div className="flex items-center gap-4">
          <Search className="w-6 h-6 text-slate-900" />
          <Bell className="w-6 h-6 text-slate-900" />
        </div>
      </div>

      {/* 2. Date Strip */}
      <div className="py-2 px-4 bg-white border-t border-slate-50">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 pb-1">
            <button
              onClick={() => onDateSelect(null)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[72px] h-[52px] px-2 rounded-xl border transition-all active:scale-95",
                selectedDateISO === null
                  ? "bg-slate-900 border-slate-900 text-white shadow-md"
                  : "bg-white border-slate-100 text-slate-600"
              )}
            >
              <span className="text-xs font-medium mb-0.5">전체</span>
              <span className="text-sm font-bold">보기</span>
            </button>
            {calendarDates.map((d) => (
              <button
                key={d.dateISO}
                onClick={() => onDateSelect(d.dateISO)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[72px] h-[52px] rounded-xl border transition-all active:scale-95",
                  selectedDateISO === d.dateISO
                    ? "bg-slate-900 border-slate-900 text-white shadow-md"
                    : "bg-white border-slate-100 text-slate-400"
                )}
              >
                <span className={cn(
                  "text-[11px] leading-none mb-1 font-medium",
                  selectedDateISO === d.dateISO ? "opacity-100" : "opacity-60"
                )}>
                  {d.dayStr}
                </span>
                <span className="text-[19px] font-bold leading-none tracking-tight">{d.dayNum}</span>
              </button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </div>

      {/* 3. Integrated Filter Bar */}
      <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar bg-white w-full items-center">

        {/* (A) Location Filter */}
        <Dialog open={isLocationOpen} onOpenChange={setIsLocationOpen}>
          <Button
            variant="outline"
            onClick={() => setIsLocationOpen(true)}
            className={cn(
              "rounded-full h-8 text-xs font-bold px-3 border transition-all flex items-center gap-1",
              selectedLocations.length > 0
                ? "border-[#FF6600] text-[#FF6600] bg-orange-50"
                : "border-slate-200 text-slate-600"
            )}
          >
            {(() => {
              if (selectedLocations.length === 0) return "지역";
              const first = selectedLocations[0];
              // Show full location name (e.g., "서울 강남구")
              return selectedLocations.length === 1 ? first : `${first} 외 ${selectedLocations.length - 1}`;
            })()}
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
          <DialogContent className="p-0 gap-0 w-[90%] max-w-[420px] h-[75vh] rounded-2xl border-0 outline-none flex flex-col shadow-2xl overflow-hidden">
            <DialogHeader className="h-14 flex items-center justify-center border-b border-slate-100 shrink-0 relative px-4 bg-white z-10">
              <DialogTitle className="text-lg font-bold">지역 선택</DialogTitle>
              <DialogClose className="absolute right-4"><X className="w-5 h-5 text-slate-500" /></DialogClose>
            </DialogHeader>
            <div className="flex flex-1 overflow-hidden h-full">
              <div className="w-[30%] bg-slate-50 border-r border-slate-100 h-full overflow-y-auto">
                {(["서울", "경기", "인천"] as const).map(region => {
                  const count = getRegionCount(region);
                  return (
                    <button
                      key={region}
                      onClick={() => setActiveRegionTab(region)}
                      className={cn(
                        "w-full h-14 flex items-center justify-between px-3 text-sm font-medium",
                        activeRegionTab === region
                          ? "bg-white text-slate-900 font-bold"
                          : "text-slate-500"
                      )}
                    >
                      <span>{region}</span>
                      {count > 0 && (
                        <span className={cn(
                          "text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                          activeRegionTab === region
                            ? "bg-[#FF6600] text-white"
                            : "bg-slate-200 text-slate-600"
                        )}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="w-[70%] bg-white h-full overflow-y-auto pb-4">
                {/* 'All' Option for the active region */}
                <button
                  onClick={() => toggleTempLocation(`${activeRegionTab} 전체`)}
                  className="w-full h-14 flex items-center justify-between px-5 border-b border-slate-50 active:bg-orange-50 transition-colors text-left group"
                >
                  <span className={cn(
                    "text-base",
                    tempSelectedLocations.includes(`${activeRegionTab} 전체`)
                      ? "font-bold text-[#FF6600]"
                      : "text-slate-900 font-bold"
                  )}>
                    {activeRegionTab} 전체
                  </span>
                  <div className={cn(
                    "w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors",
                    tempSelectedLocations.includes(`${activeRegionTab} 전체`)
                      ? "bg-[#FF6600] border-[#FF6600]"
                      : "bg-white border-slate-300 group-hover:border-slate-400"
                  )}>
                    {tempSelectedLocations.includes(`${activeRegionTab} 전체`) && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>
                </button>

                {LOCATIONS[activeRegionTab].map(loc => {
                  const fullLoc = `${activeRegionTab} ${loc}`;
                  const isSelected = tempSelectedLocations.includes(fullLoc);
                  return (
                    <button
                      key={loc}
                      onClick={() => toggleTempLocation(fullLoc)}
                      className="w-full h-14 flex items-center justify-between px-5 border-b border-slate-50 active:bg-orange-50 transition-colors text-left group"
                    >
                      <span className={cn(
                        "text-base",
                        isSelected ? "font-bold text-[#FF6600]" : "text-slate-700"
                      )}>
                        {loc}
                      </span>
                      <div className={cn(
                        "w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors",
                        isSelected
                          ? "bg-[#FF6600] border-[#FF6600]"
                          : "bg-white border-slate-300 group-hover:border-slate-400"
                      )}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Chips Area */}
            {tempSelectedLocations.length > 0 && (
              <div className="shrink-0 bg-slate-50 border-t border-slate-100 px-4 py-3 max-h-[100px] overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  {tempSelectedLocations.map((loc) => (
                    <div
                      key={loc}
                      className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm"
                    >
                      <span className="text-slate-700">{loc}</span>
                      <button
                        onClick={() => toggleTempLocation(loc)}
                        className="hover:bg-slate-100 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="shrink-0 h-[80px] bg-white border-t border-slate-100 flex items-center px-4 gap-3 safe-area-bottom pb-4 z-20">
              <Button
                onClick={resetLocationFilter}
                variant="outline"
                className="h-12 px-6 rounded-xl text-sm font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                초기화
              </Button>
              <Button
                onClick={applyLocationFilter}
                className="flex-1 h-12 bg-[#FF6600] text-white rounded-xl text-sm font-bold hover:bg-[#FF6600]/90"
              >
                적용
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* (B) Position Filter */}
        <Dialog open={isPositionOpen} onOpenChange={setIsPositionOpen}>
          <Button
            variant="outline"
            onClick={() => setIsPositionOpen(true)}
            className={cn(
              "rounded-full h-8 text-xs font-bold px-3 border transition-all flex items-center gap-1",
              selectedPositions.length > 0
                ? "border-[#FF6600] text-[#FF6600] bg-orange-50"
                : "border-slate-200 text-slate-600"
            )}
          >
            {selectedPositions.length === 0
              ? "포지션"
              : selectedPositions.length === 1
                ? selectedPositions[0]
                : `${selectedPositions[0]} 외 ${selectedPositions.length - 1}`
            }
            <ChevronDown className="w-3.5 h-3.5" />
          </Button>
          <DialogContent className="w-[90%] max-w-[360px] rounded-2xl">
            <DialogHeader>
              <DialogTitle>포지션 선택</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3 py-4">
              {['포지션 무관', '가드', '포워드', '센터'].map(pos => {
                const isSelected = tempSelectedPositions.includes(pos);
                return (
                  <button
                    key={pos}
                    onClick={() => toggleTempPosition(pos)}
                    className={cn(
                      "h-12 rounded-xl border font-bold text-sm transition-all",
                      isSelected
                        ? "border-[#FF6600] bg-orange-50 text-[#FF6600]"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    {pos}
                  </button>
                );
              })}
            </div>
            <Button
              onClick={applyPositionFilter}
              className="w-full h-12 bg-[#FF6600] text-white rounded-xl font-bold hover:bg-[#FF6600]/90"
            >
              적용하기
            </Button>
          </DialogContent>
        </Dialog>

        {/* (C) Price Filter */}
        {onPriceMaxChange && (
          <Dialog open={isPriceOpen} onOpenChange={setIsPriceOpen}>
            <Button
              variant="outline"
              onClick={() => setIsPriceOpen(true)}
              className={cn(
                "rounded-full h-8 text-xs font-bold px-3 border transition-all flex items-center gap-1",
                selectedPriceMax !== null
                  ? "border-[#FF6600] text-[#FF6600] bg-orange-50"
                  : "border-slate-200 text-slate-600"
              )}
            >
              {selectedPriceMax === null ? "가격" : `${(selectedPriceMax/10000).toFixed(0)}만원 이하`}
              <ChevronDown className="w-3.5 h-3.5" />
            </Button>
            <DialogContent className="w-[90%] max-w-[360px] rounded-2xl">
              <DialogHeader>
                <DialogTitle>최대 가격 설정</DialogTitle>
              </DialogHeader>
              <div className="py-6 flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-2">
                  {[null, 5000, 10000, 15000, 20000, 30000].map((price) => (
                    <button
                      key={price ?? 'all'}
                      onClick={() => setTempPriceMax(price)}
                      className={cn(
                        "h-10 rounded-lg text-sm font-bold border transition-all",
                        tempPriceMax === price
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-600 border-slate-200"
                      )}
                    >
                      {price === null ? "제한없음" : `${price.toLocaleString()}원`}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={applyPriceFilter}
                className="w-full h-12 bg-[#FF6600] text-white rounded-xl font-bold hover:bg-[#FF6600]/90"
              >
                적용하기
              </Button>
            </DialogContent>
          </Dialog>
        )}

        {/* (D) Hide Closed Toggle */}
        {onHideClosedChange && (
          <button
            onClick={() => onHideClosedChange(!isHideClosed)}
            className={cn(
              "rounded-full h-8 px-3 text-xs font-bold border transition-all flex items-center gap-1 shrink-0",
              isHideClosed
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
            )}
          >
            {isHideClosed && <Check className="w-3 h-3" />}
            마감 가리기
          </button>
        )}
      </div>
    </div>
  );
}
