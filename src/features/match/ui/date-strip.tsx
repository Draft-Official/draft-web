'use client';

import React from 'react';
import { cn } from '@/shared/lib/utils';
import { getDayLabel, getShortDayLabel } from '@/features/match/lib/utils'; // You might need to adjust imports

interface DateStripProps {
  selectedDateISO: string | null;
  onDateSelect: (date: string | null) => void;
}

export function DateStrip({ selectedDateISO, onDateSelect }: DateStripProps) {
  // Generate next 14 days
  const dates = React.useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const iso = d.toISOString().split('T')[0];
        // Format: Day (e.g., 2), Weekday (e.g., 금)
        const dayNum = d.getDate();
        const weekday = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
        list.push({ iso, dayNum, weekday, isToday: i === 0 });
    }
    return list;
  }, []);

  return (
    <div className="flex items-center gap-2 px-5 py-3 overflow-x-auto no-scrollbar border-b border-gray-50 bg-white">
      {/* "All" or "Any Date" Option - Optional, maybe just default to all if null */}
      <button
        onClick={() => onDateSelect(null)}
        className={cn(
            "flex flex-col items-center justify-center min-w-[50px] h-[70px] rounded-2xl border transition-all flex-shrink-0",
             !selectedDateISO
                ? "bg-[#191F28] text-white border-[#191F28]"
                : "bg-white text-gray-400 border-gray-100"
        )}
      >
        <span className="text-[13px] font-bold">전체</span>
      </button>

      {dates.map((item) => {
        const isSelected = selectedDateISO === item.iso;
        const isSunday = item.weekday === '일';
        const isSaturday = item.weekday === '토';
        
        return (
            <button
                key={item.iso}
                onClick={() => onDateSelect(item.iso)}
                className={cn(
                    "flex flex-col items-center justify-center min-w-[64px] h-[60px] rounded-xl border transition-all flex-shrink-0 gap-0.5",
                    isSelected 
                        ? "bg-[#191F28] text-white border-[#191F28] shadow-md" 
                        : "bg-white border-gray-100 hover:border-gray-200"
                )}
            >
                <span className={cn("text-[11px] font-medium", isSelected ? "text-gray-300" : isSunday ? "text-red-500" : isSaturday ? "text-blue-500" : "text-gray-400")}>
                    {item.weekday}
                </span>
                <span className={cn("text-[17px] font-bold leading-none", isSelected ? "text-white" : "text-[#191F28]")}>
                    {item.dayNum}
                </span>
                {item.isToday && (
                    <span className="text-[9px] font-medium text-primary">오늘</span>
                )}
            </button>
        );
      })}
    </div>
  );
}
