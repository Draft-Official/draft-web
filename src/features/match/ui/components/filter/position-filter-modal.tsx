'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/base/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/base/dialog";
import { cn } from '@/shared/lib/utils';

interface PositionFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPositions: string[];
  onApply: (positions: string[]) => void;
}

export function PositionFilterModal({ 
  open, 
  onOpenChange, 
  selectedPositions, 
  onApply 
}: PositionFilterModalProps) {
  const [tempSelectedPositions, setTempSelectedPositions] = useState<string[]>([]);

  // Sync state when opening
  useEffect(() => {
    if (open) {
      setTempSelectedPositions([...selectedPositions]);
    }
  }, [open, selectedPositions]);

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

  const handleApply = () => {
    onApply(tempSelectedPositions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          onClick={handleApply}
          className="w-full h-12 bg-[#FF6600] text-white rounded-xl font-bold hover:bg-[#FF6600]/90"
        >
          적용하기
        </Button>
      </DialogContent>
    </Dialog>
  );
}
