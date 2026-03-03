'use client';

import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';
import { Toggle } from '@/shared/ui/shadcn/toggle';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/shadcn/dialog";
import { ScrollArea } from "@/shared/ui/shadcn/scroll-area";
import { GENDER_OPTIONS, MATCH_FORMAT_OPTIONS } from '@/shared/config/match-constants';
import { cn } from '@/shared/lib/utils';

interface DetailedFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Current States
  selectedPositions?: string[];
  onPositionsChange?: (positions: string[]) => void;
  minVacancy?: number | null;
  onMinVacancyChange?: (vacancy: number | null) => void;
  selectedGenders: string[];
  selectedAges: string[];
  selectedGameFormats: string[];
  hideClosed?: boolean;
  onHideClosedChange?: (hide: boolean) => void;
  // Handlers
  onApply: (filters: {
    positions?: string[];
    minVacancy?: number | null;
    genders: string[];
    ages: string[];
    gameFormats: string[];
    hideClosed?: boolean;
  }) => void;
}

const POSITION_OPTIONS = ['포지션 무관', '가드', '포워드', '센터'];

export function DetailedFilterModal({
  open,
  onOpenChange,
  selectedPositions = [],
  onPositionsChange,
  minVacancy = null,
  onMinVacancyChange,
  selectedGenders,
  selectedAges,
  selectedGameFormats,
  hideClosed = true,
  onHideClosedChange,
  onApply,
}: DetailedFilterModalProps) {
  // Temp States
  const [tempPositions, setTempPositions] = useState<string[]>([]);
  const [tempMinVacancy, setTempMinVacancy] = useState<number>(1);
  const [tempGenders, setTempGenders] = useState<string[]>([]);
  const [tempAges, setTempAges] = useState<string[]>([]);
  const [tempGameFormats, setTempGameFormats] = useState<string[]>([]);
  const [tempHideClosed, setTempHideClosed] = useState<boolean>(true);

  // Sync state when opening
  useEffect(() => {
    if (open) {
      setTempPositions([...selectedPositions]);
      setTempMinVacancy(minVacancy || 1);
      setTempGenders([...selectedGenders]);
      setTempAges([...selectedAges]);
      setTempGameFormats([...selectedGameFormats]);
      setTempHideClosed(hideClosed);
    }
  }, [open, selectedPositions, minVacancy, selectedGenders, selectedAges, selectedGameFormats, hideClosed]);

  const toggleSelection = (list: string[], item: string, setList: (l: string[]) => void) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const toggleTempPosition = (pos: string) => {
    if (pos === '포지션 무관') {
      setTempPositions(prev => prev.includes('포지션 무관') ? [] : ['포지션 무관']);
    } else {
      setTempPositions(prev => {
        const next = prev.filter(p => p !== '포지션 무관');
        return next.includes(pos) ? next.filter(p => p !== pos) : [...next, pos];
      });
    }
  };

  const handleVacancyIncrement = () => {
    setTempMinVacancy(prev => Math.min(prev + 1, 7));
  };
  
  const handleVacancyDecrement = () => {
    setTempMinVacancy(prev => Math.max(prev - 1, 1));
  };

  const handleApply = () => {
    onApply({
      positions: onPositionsChange ? tempPositions : undefined,
      // 1명은 사실상 필터 미적용 (모든 경기가 해당) → null 처리
      minVacancy: onMinVacancyChange ? (tempMinVacancy <= 1 ? null : tempMinVacancy) : undefined,
      genders: tempGenders,
      ages: tempAges,
      gameFormats: tempGameFormats,
      hideClosed: onHideClosedChange ? tempHideClosed : undefined,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setTempPositions([]);
    setTempMinVacancy(1);
    setTempGenders([]);
    setTempAges([]);
    setTempGameFormats([]);
    setTempHideClosed(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="rounded-2xl">
        <DialogHeader>
          <DialogTitle>상세 조건</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="py-4 flex flex-col gap-8 px-1">
            
            {/* 1. Position Filter (if enabled) */}
            {onPositionsChange && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">포지션</h3>
                <div className="grid grid-cols-2 gap-3">
                  {POSITION_OPTIONS.map(pos => (
                    <Toggle
                      key={pos}
                      variant="outline"
                      pressed={tempPositions.includes(pos)}
                      onPressedChange={() => toggleTempPosition(pos)}
                      className="h-12 rounded-xl text-sm font-bold"
                    >
                      {pos}
                    </Toggle>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Vacancy Filter (if enabled) */}
            {onMinVacancyChange && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-900">인원 수</h3>
                <div className="py-2 flex flex-col items-center justify-center gap-3">
                  <div className="flex items-center gap-4">
                    <Button 
                      size="icon" 
                      type="button"
                      variant="outline" 
                      className="h-10 w-10 rounded-full border-slate-200"
                      onClick={handleVacancyDecrement}
                      disabled={tempMinVacancy <= 1}
                    >
                      <Minus className="w-4 h-4 text-slate-600" />
                    </Button>
                    <span className="text-2xl font-bold text-slate-900 min-w-[50px] text-center">
                      {`${tempMinVacancy}명`}
                    </span>
                    <Button 
                      size="icon" 
                      type="button"
                      variant="outline" 
                      className="h-10 w-10 rounded-full border-slate-200"
                      onClick={handleVacancyIncrement}
                      disabled={tempMinVacancy >= 7}
                    >
                      <Plus className="w-4 h-4 text-slate-600" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    {`${tempMinVacancy}명 이상 지원 가능한 경기를 찾습니다`}
                  </p>
                </div>
              </div>
            )}

            {/* 3. Gender Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">성별</h3>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <Toggle
                    key={g.value}
                    variant="outline"
                    pressed={tempGenders.includes(g.value)}
                    onPressedChange={() => toggleSelection(tempGenders, g.value, setTempGenders)}
                    className="h-9 rounded-lg px-4 text-sm font-medium"
                  >
                    {g.label}
                  </Toggle>
                ))}
              </div>
            </div>

            {/* 4. Game Format Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">경기 방식</h3>
              <div className="flex flex-wrap gap-2">
                {MATCH_FORMAT_OPTIONS.map((bg) => (
                  <Toggle
                    key={bg.value}
                    variant="outline"
                    pressed={tempGameFormats.includes(bg.value)}
                    onPressedChange={() => toggleSelection(tempGameFormats, bg.value, setTempGameFormats)}
                    className="h-9 rounded-lg px-4 text-sm font-medium"
                  >
                    {bg.label}
                  </Toggle>
                ))}
              </div>
            </div>

            {/* 5. Hide Closed Toggle (if enabled) */}
            {onHideClosedChange && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">마감된 경기 가리기</h3>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={tempHideClosed}
                    onClick={() => setTempHideClosed(!tempHideClosed)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      tempHideClosed ? "bg-primary" : "bg-slate-200"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform",
                        tempHideClosed ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
                <p className="text-xs text-slate-500">
                  모집이 마감된 경기를 목록에서 숨깁니다
                </p>
              </div>
            )}

          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="w-24 h-12 rounded-xl font-bold">
            초기화
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 h-12 bg-primary text-white rounded-xl font-bold hover:bg-primary/90"
          >
            적용하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
