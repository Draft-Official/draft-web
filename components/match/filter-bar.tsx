'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { RegionFilterModal } from './region-filter-modal';
import { ChevronDown, Bell, Search, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Mock Dates Data (from Figma code)
const DATES = [
    { day: "22", week: "수", active: true },
    { day: "23", week: "목", active: false },
    { day: "24", week: "금", active: false },
    { day: "25", week: "토", active: false },
    { day: "26", week: "일", active: false },
    { day: "27", week: "월", active: false },
    { day: "28", week: "화", active: false },
];

export function FilterBar() {
    const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
    const [showRegionModal, setShowRegionModal] = useState(false);
    const [currentRegionLabel, setCurrentRegionLabel] = useState('서울 전체');

    const handleRegionSelect = (region: string) => {
        setCurrentRegionLabel(region);
    };

    return (
        <>
            <div className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm transition-all pb-2">
                {/* Row 1: Header (Region + Actions) */}
                <div className="flex items-center justify-between px-4 h-14">
                    {/* Region Trigger (Karrot Style) */}
                    <button 
                        onClick={() => setShowRegionModal(true)}
                        className="flex items-center gap-1 active:opacity-70 transition-opacity outline-none"
                    >
                        <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                            {currentRegionLabel}
                        </span>
                        <ChevronDown className="w-5 h-5 text-slate-900 stroke-[3]" />
                    </button>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        <Search className="w-6 h-6 text-slate-900" />
                        <Bell className="w-6 h-6 text-slate-900" />
                    </div>
                </div>

                {/* Date Strip */}
                <div className="pt-2 pb-3 px-4">
                     <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex gap-2">
                             <Button 
                                variant="outline" 
                                className="rounded-xl border-slate-200 text-slate-600 bg-white h-12 px-3 flex items-center gap-1 shadow-sm"
                             >
                                <CalendarIcon className="w-4 h-4" />
                                <span className="text-xs">전체</span>
                             </Button>
                             {DATES.map((d, i) => (
                                 <button 
                                    key={i}
                                    className={cn(
                                        "flex flex-col items-center justify-center min-w-[48px] h-[52px] rounded-xl border transition-all active:scale-95 shadow-sm outline-none",
                                        d.active 
                                            ? "bg-slate-900 border-slate-900 text-white shadow-md ring-2 ring-slate-200" 
                                            : "bg-white border-slate-200 text-slate-500"
                                    )}
                                 >
                                    <span className="text-[10px] leading-none mb-1 opacity-80">{d.week}</span>
                                    <span className="text-lg font-bold leading-none">{d.day}</span>
                                 </button>
                             ))}
                        </div>
                        <ScrollBar orientation="horizontal" className="hidden" />
                     </ScrollArea>
                </div>

                {/* Filter Chips (Positions) */}
                <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                     {['포지션 무관', '가드', '포워드', '센터'].map((pos) => {
                         // Logic: If 'pos_all' (or null) is active, highlight '포지션 무관'
                         // Simplified logic for UI demo purposes as per Figma code
                         const isActive = selectedPosition === pos || (pos === '포지션 무관' && !selectedPosition);
                         return (
                            <Button
                                key={pos}
                                variant="outline"
                                onClick={() => setSelectedPosition(pos === '포지션 무관' ? null : pos)}
                                className={cn(
                                    "rounded-full h-9 text-xs font-bold px-4 border shadow-sm transition-all",
                                    isActive 
                                        ? "bg-[#FF6600] border-[#FF6600] text-white hover:bg-[#FF6600] hover:text-white" 
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                {pos}
                            </Button>
                         );
                     })}
                </div>
            </div>

            <RegionFilterModal 
                open={showRegionModal} 
                onOpenChange={setShowRegionModal} 
                onSelect={handleRegionSelect}
                selectedRegion={currentRegionLabel}
            />
        </>
    );
}
