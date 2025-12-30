'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { RegionFilterModal } from './region-filter-modal';
import { DateStrip } from './date-strip';
import { ChevronDown, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FilterBarProps {
    selectedDateISO: string | null;
    onDateSelect: (iso: string | null) => void;
    
    // Updated: Supports multiple positions
    selectedPositions: string[]; 
    onPositionsChange: (positions: string[]) => void;
}

export function FilterBar({ selectedDateISO, onDateSelect, selectedPositions, onPositionsChange }: FilterBarProps) {
    const [showRegionModal, setShowRegionModal] = useState(false);
    const [currentRegionLabel, setCurrentRegionLabel] = useState('서울 전체');

    const handleRegionSelect = (region: string) => {
        setCurrentRegionLabel(region);
    };

    const togglePosition = (pos: string) => {
        // 1. '포지션 무관' Logic
        if (pos === '포지션 무관') {
            // If selecting 'Any', clear others and set 'Any' (or empty if it was already selected, acting as toggle off)
            // But usually 'Any' means "reset filters". Let's say it clears selection.
            onPositionsChange([]); 
            return;
        }

        // 2. Specific Position Logic
        if (selectedPositions.includes(pos)) {
            onPositionsChange(selectedPositions.filter(p => p !== pos));
        } else {
            onPositionsChange([...selectedPositions, pos]);
        }
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
                <DateStrip selectedDateISO={selectedDateISO} onSelectDate={onDateSelect} />

                {/* Filter Chips (Positions) */}
                <div className="px-4 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                     {['포지션 무관', '가드', '포워드', '센터'].map((pos) => {
                         // Active state logic
                         const isAny = pos === '포지션 무관';
                         const isActive = isAny 
                            ? selectedPositions.length === 0 
                            : selectedPositions.includes(pos);

                         return (
                            <Button
                                key={pos}
                                variant="outline"
                                onClick={() => togglePosition(pos)}
                                className={cn(
                                    "rounded-full h-8 text-xs font-bold px-4 border shadow-sm transition-all", // Reduced height to h-8
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
