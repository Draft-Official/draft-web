'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/shadcn/dialog";
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
        const next = prev.filter(p => p !== '포지션 무관');
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
      <DialogContent size="md" className="rounded-2xl">
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
                    ? "border-primary bg-brand-weak text-primary"
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
          className="w-full h-12 bg-primary text-white rounded-xl font-bold hover:bg-primary/90"
        >
          적용하기
        </Button>
      </DialogContent>
    </Dialog>
  );
}
