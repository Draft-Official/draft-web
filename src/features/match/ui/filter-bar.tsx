'use client';

import React, { useState } from 'react';
import { ChevronDown, Search, Bell } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { RegionFilterModal } from './region-filter-modal';
import { getNext14Days, getShortDayLabel } from '../lib/utils';

// Existing DateStrip logic merged here for simplicity in this turn, or can be separate.
// Let's create a minimal integrated FilterBar that includes the DateStrip functionality to ensure sticky behavior works perfectly together.

interface FilterBarProps {
    selectedDateISO: string | null;
    onDateSelect: (iso: string | null) => void;
    
    selectedPositions: string[];
    onPositionsChange: (positions: string[]) => void;
    
    selectedLocations: string[];
    onLocationsChange: (locations: string[]) => void;
}

export function FilterBar({ 
    selectedDateISO, 
    onDateSelect, 
    selectedPositions, 
    onPositionsChange,
    selectedLocations,
    onLocationsChange 
}: FilterBarProps) {
    const [showRegionModal, setShowRegionModal] = useState(false);
    const next14Days = getNext14Days();

    const getRegionDisplayLabel = (): string => {
        if (selectedLocations.length === 0) return '전체';
        if (selectedLocations.length === 1) return selectedLocations[0];
        return `${selectedLocations[0]} 외 ${selectedLocations.length - 1}`;
    };

    const togglePosition = (pos: string) => {
        if (pos === '포지션 무관') {
            if (selectedPositions.includes('포지션 무관')) {
                onPositionsChange([]);
            } else {
                onPositionsChange(['포지션 무관']);
            }
            return;
        }

        let newPositions = selectedPositions.filter(p => p !== '포지션 무관');
        if (selectedPositions.includes(pos)) {
            newPositions = newPositions.filter(p => p !== pos);
        } else {
            newPositions = [...newPositions, pos];
        }
        onPositionsChange(newPositions);
    };

    return (
        <>
            {/* Main Sticky Header Container */}
            <div className="sticky top-0 z-40 bg-white border-b border-[#F2F4F6] shadow-sm">
                
                {/* 1. Top Bar: Logo, Region, Actions */}
                <div className="h-[52px] flex items-center justify-between px-4 bg-white relative">
                    {/* Left: Region Selector */}
                    <div className="flex items-center gap-4">
                         {/* DRAFT Logo (Text or Image placeholder) */}
                         <span className="text-[#FF6600] font-black text-lg italic hidden">DRAFT</span>

                        <button 
                            onClick={() => setShowRegionModal(true)}
                            className="flex items-center gap-1 text-[17px] font-bold text-[#191F28] active:opacity-70"
                        >
                            {getRegionDisplayLabel()}
                            <ChevronDown className="w-5 h-5 text-[#333D4B]" />
                        </button>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        <button className="p-1 rounded-full hover:bg-slate-50 relative">
                            <Search className="w-6 h-6 text-[#333D4B]" />
                        </button>
                        <button className="p-1 rounded-full hover:bg-slate-50 relative">
                            <Bell className="w-6 h-6 text-[#333D4B]" />
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#FF6600] rounded-full ring-2 ring-white" />
                        </button>
                    </div>
                </div>

                {/* 2. Date Strip (Horizontal Scroll) */}
                <div className="w-full overflow-x-auto no-scrollbar border-t border-[#F2F4F6] bg-white pt-2 pb-2">
                    <div className="flex px-4 gap-2 min-w-max">
                        <button
                            onClick={() => onDateSelect(null)}
                            className={cn(
                                "flex flex-col items-center justify-center min-w-[48px] h-[64px] rounded-[12px] border transition-all",
                                selectedDateISO === null
                                    ? "bg-[#191F28] border-[#191F28] text-white"
                                    : "bg-white border-[#E5E8EB] text-[#8B95A1]"
                            )}
                        >
                            <span className="text-[13px] font-bold mb-0.5">📅</span>
                            <span className="text-[12px] font-bold">전체</span>
                        </button>

                        {next14Days.map(date => {
                            const iso = date.toISOString().split('T')[0];
                            const isSelected = selectedDateISO === iso;
                            const dayLabel = getShortDayLabel(iso); // "2 (금)"
                            const [dayNum, dayOfWeek] = dayLabel.split(' '); // "2", "(금)"

                            return (
                                <button
                                    key={iso}
                                    onClick={() => onDateSelect(iso)}
                                    className={cn(
                                        "flex flex-col items-center justify-center min-w-[48px] h-[64px] rounded-[12px] border transition-all",
                                        isSelected
                                            ? "bg-[#FF6600] border-[#FF6600] text-white shadow-md"
                                            : "bg-white border-[#E5E8EB] hover:border-slate-300"
                                    )}
                                >
                                    <span className={cn(
                                        "text-[11px] font-medium mb-0.5",
                                        isSelected ? "text-white/80" : "text-[#8B95A1]"
                                    )}>
                                        {dayOfWeek.replace(/[()]/g, '')}
                                    </span>
                                    <span className={cn(
                                        "text-[16px] font-bold",
                                        isSelected ? "text-white" : "text-[#333D4B]"
                                    )}>
                                        {dayNum}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 3. Position Filter */}
                <div className="px-4 pb-3 flex gap-2 overflow-x-auto no-scrollbar bg-white">
                    {['포지션 무관', '가드', '포워드', '센터'].map(pos => {
                        const isActive = selectedPositions.includes(pos);
                        return (
                            <button
                                key={pos}
                                onClick={() => togglePosition(pos)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors whitespace-nowrap",
                                    isActive
                                        ? "bg-[#191F28] border-[#191F28] text-white"
                                        : "bg-white border-[#E5E8EB] text-[#4E5968]"
                                )}
                            >
                                {pos}
                            </button>
                        );
                    })}
                </div>
            </div>

            <RegionFilterModal
                open={showRegionModal}
                onOpenChange={setShowRegionModal}
                onApply={onLocationsChange}
                selectedRegions={selectedLocations}
            />
        </>
    );
}
