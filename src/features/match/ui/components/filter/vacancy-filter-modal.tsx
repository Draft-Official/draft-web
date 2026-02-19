'use client';

import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/shadcn/dialog";

interface VacancyFilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  minVacancy: number | null;
  onApply: (vacancy: number | null) => void;
}

export function VacancyFilterModal({ 
  open, 
  onOpenChange, 
  minVacancy, 
  onApply 
}: VacancyFilterModalProps) {
  const [tempMinVacancy, setTempMinVacancy] = useState<number>(1);

  // Sync state when opening
  useEffect(() => {
    if (open) {
      setTempMinVacancy(minVacancy || 1);
    }
  }, [open, minVacancy]);

  const handleIncrement = () => {
    setTempMinVacancy(prev => Math.min(prev + 1, 7));
  };
  
  const handleDecrement = () => {
    setTempMinVacancy(prev => Math.max(prev - 1, 1));
  };

  const handleApply = () => {
    onApply(tempMinVacancy);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-[320px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-center">몇 분이서 가시나요?</DialogTitle>
        </DialogHeader>
        <div className="py-6 flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-6">
            <Button 
              size="icon" 
              variant="outline" 
              className="h-12 w-12 rounded-full border-slate-200"
              onClick={handleDecrement}
              disabled={tempMinVacancy <= 1}
            >
              <Minus className="w-5 h-5 text-slate-600" />
            </Button>
            <span className="text-3xl font-bold text-slate-900 min-w-[60px] text-center">
              {`${tempMinVacancy}명`}
            </span>
            <Button 
              size="icon" 
              variant="outline" 
              className="h-12 w-12 rounded-full border-slate-200"
              onClick={handleIncrement}
              disabled={tempMinVacancy >= 7}
            >
              <Plus className="w-5 h-5 text-slate-600" />
            </Button>
          </div>
          <p className="text-sm text-slate-500 text-center">
            {`${tempMinVacancy}명 이상 지원 가능한 경기를 찾습니다`}
          </p>
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
