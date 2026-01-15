'use client';

import React from 'react';
import ScrollContainer from 'react-indiana-drag-scroll';
import { cn } from '@/shared/lib/utils';

export interface DateOption {
  dateISO: string;
  dayStr: string; // '월', '화'
  dayNum: number | string; // 1, 31
  label?: string; // Full label if needed
}

interface DateStripProps {
  dates: DateOption[];
  selectedDate: string | null;
  onSelect: (date: string | null) => void;
  showAllOption?: boolean;
  className?: string;
  listClassName?: string;
}

export function DateStrip({ 
  dates, 
  selectedDate, 
  onSelect, 
  showAllOption = false,
  className,
  listClassName = "px-4"
}: DateStripProps) {
  return (
    <div className={cn("w-full", className)}>
      <ScrollContainer className="w-full overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing">
        <div className={cn("flex gap-2 pb-1 min-w-max", listClassName)}>
          {showAllOption && (
            <button
              onClick={() => onSelect(null)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] h-[64px] rounded-xl border transition-all active:scale-95 flex-shrink-0",
                selectedDate === null
                  ? "bg-slate-900 border-slate-900 text-white shadow-md"
                  : "bg-white border-slate-100 text-slate-600 hover:bg-slate-50"
              )}
            >
              <span className="text-[11px] font-medium mb-0.5">전체</span>
              <span className="text-[13px] font-bold">보기</span>
            </button>
          )}

          {dates.map((d) => (
            <button
              key={d.dateISO}
              onClick={() => onSelect(d.dateISO)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[64px] h-[64px] rounded-xl border transition-all active:scale-95 flex-shrink-0",
                selectedDate === d.dateISO
                  ? "bg-slate-900 border-slate-900 text-white shadow-md"
                  : "bg-white border-slate-100 text-slate-400 hover:bg-slate-50"
              )}
            >
              <span className={cn(
                "text-[11px] mb-1 font-medium", 
                selectedDate === d.dateISO ? "text-slate-300" : "text-slate-500"
              )}>
                {d.dayStr}
              </span>
              <span className="text-lg font-bold leading-none">{d.dayNum}</span>
            </button>
          ))}
        </div>
      </ScrollContainer>
    </div>
  );
}
