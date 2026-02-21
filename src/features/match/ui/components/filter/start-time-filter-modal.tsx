'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/shadcn/dialog";
import { Slider } from '@/shared/ui/shadcn/slider';

interface StartTimeFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  startTimeRange: [number, number] | null; // [시작시간, 종료시간] in 24h format
  onApply: (range: [number, number] | null) => void;
}

const formatTime = (hour: number): string => {
  if (hour === 24) return '24:00';
  return `${hour.toString().padStart(2, '0')}:00`;
};

export function StartTimeFilterModal({
  open,
  onOpenChange,
  startTimeRange,
  onApply
}: StartTimeFilterModalProps) {
  const [tempRange, setTempRange] = useState<[number, number]>([0, 24]);

  // Sync state when opening
  useEffect(() => {
    if (open) {
      setTempRange(startTimeRange || [0, 24]);
    }
  }, [open, startTimeRange]);

  const handleApply = () => {
    // 전체 범위 선택 시 null로 처리 (필터 미적용)
    if (tempRange[0] === 0 && tempRange[1] === 24) {
      onApply(null);
    } else {
      onApply(tempRange);
    }
    onOpenChange(false);
  };

  const handleReset = () => {
    setTempRange([0, 24]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xs" className="rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">시작 시간</DialogTitle>
        </DialogHeader>
        <div className="py-6 flex flex-col gap-6">
          {/* 선택된 시간 범위 표시 */}
          <div className="text-center">
            <span className="text-2xl font-bold text-slate-900">
              {formatTime(tempRange[0])} - {formatTime(tempRange[1])}
            </span>
            {tempRange[0] === 0 && tempRange[1] === 24 && (
              <p className="text-sm text-slate-500 mt-1">전체 시간</p>
            )}
          </div>

          {/* 슬라이더 */}
          <div className="px-2">
            <Slider
              value={tempRange}
              onValueChange={(value) => setTempRange(value as [number, number])}
              min={0}
              max={24}
              step={1}
              className="w-full"
            />
            {/* 시간 라벨 */}
            <div className="flex justify-between mt-2 text-xs text-slate-400">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>24:00</span>
            </div>
          </div>

          <p className="text-sm text-slate-500 text-center">
            {tempRange[0] === 0 && tempRange[1] === 24
              ? '모든 시간대의 경기를 표시합니다'
              : `${formatTime(tempRange[0])} ~ ${formatTime(tempRange[1])} 사이에 시작하는 경기`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 h-12 rounded-xl font-bold"
          >
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
