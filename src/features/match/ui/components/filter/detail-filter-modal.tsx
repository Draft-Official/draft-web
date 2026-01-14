'use client';

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from '@/shared/lib/utils';
import { GENDER_OPTIONS } from '@/features/match/create/config/constants';

interface DetailedFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Current States
  selectedPriceMax: number | null;
  selectedGenders: string[];
  selectedAges: string[];
  selectedGameFormats: string[];
  // Handlers
  onApply: (filters: {
    priceMax: number | null;
    genders: string[];
    ages: string[];
    gameFormats: string[];
  }) => void;
}

// Separate constants for filter options
const GAME_FORMAT_OPTIONS = [
  { value: '5vs5', label: '5vs5' },
  { value: '3vs3', label: '3vs3' },
];

const AGE_FILTER_OPTIONS = [
  { value: '20', label: '20대' },
  { value: '30', label: '30대' },
  { value: '40', label: '40대' },
  { value: '50', label: '50대 이상' },
];

export function DetailedFilterModal({
  open,
  onOpenChange,
  selectedPriceMax,
  selectedGenders,
  selectedAges,
  selectedGameFormats,
  onApply,
}: DetailedFilterModalProps) {
  // Temp States
  const [tempPriceMax, setTempPriceMax] = useState<number | null>(null);
  const [tempGenders, setTempGenders] = useState<string[]>([]);
  const [tempAges, setTempAges] = useState<string[]>([]);
  const [tempGameFormats, setTempGameFormats] = useState<string[]>([]);

  // Sync state when opening
  useEffect(() => {
    if (open) {
      setTempPriceMax(selectedPriceMax);
      setTempGenders([...selectedGenders]);
      setTempAges([...selectedAges]);
      setTempGameFormats([...selectedGameFormats]);
    }
  }, [open, selectedPriceMax, selectedGenders, selectedAges, selectedGameFormats]);

  const toggleSelection = (list: string[], item: string, setList: (l: string[]) => void) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const applyMyAge = () => {
    // TODO: Fetch user's actual age from profile
    const myAgeGroup = '20'; 
    setTempAges([myAgeGroup]);
  };

  const handleApply = () => {
    onApply({
      priceMax: tempPriceMax,
      genders: tempGenders,
      ages: tempAges,
      gameFormats: tempGameFormats,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setTempPriceMax(null);
    setTempGenders([]);
    setTempAges([]);
    setTempGameFormats([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-[360px] rounded-2xl">
        <DialogHeader>
          <DialogTitle>상세 조건</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="py-4 flex flex-col gap-8 px-1">
            
            {/* 1. Gender Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">성별</h3>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <Chip 
                    key={g.value} 
                    label={g.label} 
                    variant="orange"
                    isActive={tempGenders.includes(g.value)}
                    showCheckIcon={false}
                    onClick={() => toggleSelection(tempGenders, g.value, setTempGenders)}
                  />
                ))}
              </div>
            </div>

            {/* 2. Game Format Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">경기 방식</h3>
              <div className="flex flex-wrap gap-2">
                {GAME_FORMAT_OPTIONS.map((bg) => (
                  <Chip 
                    key={bg.value} 
                    label={bg.label} 
                    variant="orange"
                    isActive={tempGameFormats.includes(bg.value)}
                    showCheckIcon={false}
                    onClick={() => toggleSelection(tempGameFormats, bg.value, setTempGameFormats)}
                  />
                ))}
              </div>
            </div>

            {/* 3. Age Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">연령대</h3>
                <button onClick={applyMyAge} className="text-xs font-bold text-[#FF6600] flex items-center gap-1 active:scale-95 transition-transform">
                  <User className="w-3 h-3" />
                  내 나이 추천
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {AGE_FILTER_OPTIONS.map((age) => (
                  <Chip 
                    key={age.value} 
                    label={age.label} 
                    variant="orange"
                    isActive={tempAges.includes(age.value)}
                    showCheckIcon={false}
                    onClick={() => toggleSelection(tempAges, age.value, setTempAges)}
                  />
                ))}
              </div>
            </div>

            {/* 4. Price Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">참가비 (최대)</h3>
              <div className="grid grid-cols-3 gap-2">
                {[null, 10000, 20000].map((price) => (
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
                    {price === null ? "제한없음" : `${(price/10000).toFixed(0)}만원`}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="h-12 w-24 rounded-xl font-bold border-slate-200 text-slate-600">
            초기화
          </Button>
          <Button
            onClick={handleApply}
            className="flex-1 h-12 bg-[#FF6600] text-white rounded-xl font-bold hover:bg-[#FF6600]/90"
          >
            적용하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
