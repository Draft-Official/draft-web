'use client';

import React, { useMemo } from 'react';
import { cn } from '@/shared/lib/utils';

interface DateStripProps {
  selectedDateISO: string | null;
  onDateSelect: (date: string | null) => void;
}

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

export function DateStrip({ selectedDateISO, onDateSelect }: DateStripProps) {
  const calendarDates = useMemo(() => getNext14Days(), []);

  return (
    <div className="py-2 px-4 bg-white border-t border-slate-50">
      <div className="w-full overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-1 min-w-max">
          <button
            onClick={() => onDateSelect(null)}
            className={cn(
              "flex flex-col items-center justify-center w-[58px] h-[58px] min-w-[58px] rounded-xl border transition-all active:scale-95",
              selectedDateISO === null
                ? "bg-slate-900 border-slate-900 text-white shadow-md"
                : "bg-white border-slate-100 text-slate-600"
            )}
          >
            <span className="text-[11px] font-medium mb-0.5">전체</span>
            <span className="text-[13px] font-bold">보기</span>
          </button>
          {calendarDates.map((d) => (
            <button
              key={d.dateISO}
              onClick={() => onDateSelect(d.dateISO)}
              className={cn(
                "flex flex-col items-center justify-center w-[58px] h-[58px] min-w-[58px] rounded-xl border transition-all active:scale-95",
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
      </div>
    </div>
  );
}
