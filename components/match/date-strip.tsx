'use client';

import React, { useMemo } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface DateItem {
    dateISO: string;
    label: string;
    dayNum: number;
    dayStr: string; // '월', '화' ...
    isToday: boolean;
    isTomorrow: boolean;
}

export const getNext14Days = (): DateItem[] => {
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
            dateISO: d.toISOString().split('T')[0], // 2024-01-24
            label: `${month}월 ${date}일 (${day})`, // 1월 24일 (금)
            dayNum: date,
            dayStr: day,
            isToday: i === 0,
            isTomorrow: i === 1
        });
    }
    return dates;
};

interface DateStripProps {
    selectedDateISO: string | null;
    onSelectDate: (iso: string | null) => void;
}

export function DateStrip({ selectedDateISO, onSelectDate }: DateStripProps) {
    const calendarDates = useMemo(() => getNext14Days(), []);

    return (
        <div className="pt-2 pb-3 px-4">
             <ScrollArea className="w-full whitespace-nowrap">
                <div className="flex gap-2 min-w-max">
                     <Button 
                        variant="outline" 
                        onClick={() => onSelectDate(null)}
                        className={cn(
                            "rounded-xl border-slate-200 text-slate-600 bg-white h-[52px] px-3 flex items-center gap-1 shadow-sm transition-all active:scale-95",
                            selectedDateISO === null && "bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-slate-200 hover:bg-slate-800 hover:text-white"
                        )}
                     >
                        <CalendarIcon className="w-4 h-4" />
                        <span className="text-xs">전체</span>
                     </Button>
                     {calendarDates.map((d) => (
                         <button 
                            key={d.dateISO}
                            onClick={() => onSelectDate(d.dateISO)}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[48px] h-[52px] rounded-xl border transition-all active:scale-95 shadow-sm outline-none",
                                selectedDateISO === d.dateISO
                                    ? "bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-slate-200" 
                                    : "bg-white border-slate-200 text-slate-500"
                            )}
                         >
                            <span className={cn(
                                "text-[10px] leading-none mb-1",
                                selectedDateISO === d.dateISO ? "opacity-100" : "opacity-70"
                            )}>
                                {d.dayStr}
                            </span>
                            <span className="text-lg font-bold leading-none">{d.dayNum}</span>
                         </button>
                     ))}
                </div>
                <ScrollBar orientation="horizontal" className="hidden" />
             </ScrollArea>
        </div>
    );
}
