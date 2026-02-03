'use client';

import React, { useState, useEffect } from 'react';
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { REGIONS, RegionKey } from '@/shared/config/region-constants';

interface RegionFilterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApply: (regions: string[]) => void;
    selectedRegions: string[];
}

export function RegionFilterModal({ open, onOpenChange, onApply, selectedRegions }: RegionFilterModalProps) {
    const [activeRegionTab, setActiveRegionTab] = useState<RegionKey>("서울");
    const [tempSelected, setTempSelected] = useState<string[]>(selectedRegions);

    useEffect(() => {
        if (open) {
            setTempSelected(selectedRegions);
        }
    }, [open, selectedRegions]);

    const getRegionCount = (regionKey: RegionKey): number => {
        return tempSelected.filter(r => r.startsWith(regionKey)).length;
    };

    const toggleSubRegion = (subRegion: string) => {
        const isAll = subRegion.endsWith('전체');
        const regionPrefix = subRegion.split(' ')[0]; // e.g., "서울"

        setTempSelected(prev => {
            // 1. If removing an existing selection, just filter it out
            if (prev.includes(subRegion)) {
                return prev.filter(r => r !== subRegion);
            }

            // 2. If adding "XX 전체" (All)
            if (isAll) {
                // Remove any existing specific districts of this region (e.g. remove "서울 강남구" if adding "서울 전체")
                const withoutSpecifics = prev.filter(r => !r.startsWith(regionPrefix));
                return [...withoutSpecifics, subRegion];
            }

            // 3. If adding a specific district (e.g. "서울 강남구")
            // Remove "XX 전체" if it exists (e.g. remove "서울 전체" if adding "서울 강남구")
            const allKey = `${regionPrefix} 전체`;
            const withoutAll = prev.filter(r => r !== allKey);
            return [...withoutAll, subRegion];
        });
    };

    const clearTempLocations = () => {
        setTempSelected([]);
    };

    const removeRegion = (region: string) => {
        setTempSelected(prev => prev.filter(r => r !== region));
    };

    const handleApply = () => {
        onApply(tempSelected);
        onOpenChange(false);
    };

    return (
        <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
            <DialogPrimitive.Portal>
                {/* 1. Overlay (Dark Background) - Ensure High Z-Index & Opacity */}
                <DialogPrimitive.Overlay className="fixed inset-0 z-[999] bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 backdrop-blur-[2px]" />
                
                {/* 2. Content (Centered Modal) */}
                <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-[1000] w-[90%] max-w-[420px] translate-x-[-50%] translate-y-[-50%] rounded-2xl bg-white shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 overflow-hidden outline-none flex flex-col h-[80vh] max-h-[600px]">
                    
                    {/* Header */}
                    <div className="h-14 flex items-center justify-center border-b border-slate-100 shrink-0 relative bg-white z-10 w-full">
                        <DialogPrimitive.Title className="text-lg font-bold text-gray-900">
                            지역 선택
                        </DialogPrimitive.Title>
                        <DialogPrimitive.Close className="absolute right-4 p-2 rounded-full hover:bg-slate-100 transition-colors outline-none cursor-pointer">
                            <X className="w-5 h-5 text-slate-500" />
                        </DialogPrimitive.Close>
                    </div>

                    {/* Body (Split View) */}
                    <div className="flex flex-1 overflow-hidden relative bg-white w-full">
                        {/* Left Sidebar (Regions) */}
                        <div className="w-[30%] bg-slate-50 border-r border-slate-100 h-full overflow-y-auto no-scrollbar">
                            {(Object.keys(REGIONS) as RegionKey[]).map(region => {
                                const count = getRegionCount(region);
                                const isActive = activeRegionTab === region;
                                return (
                                    <button
                                        key={region}
                                        onClick={() => setActiveRegionTab(region)}
                                        className={cn(
                                            "w-full h-14 flex items-center justify-between px-3 text-sm transition-all text-left outline-none select-none relative",
                                            isActive 
                                                ? "bg-white text-slate-900 font-bold" 
                                                : "text-slate-500 hover:bg-slate-100 bg-slate-50 font-medium"
                                        )}
                                    >
                                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#FF6600]" />}
                                        <span className="truncate">{region}</span>
                                        {count > 0 && (
                                            <span className="text-[#FF6600] font-bold text-xs ml-1">{count}</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right Content (Districts) */}
                        <div className="w-[70%] h-full overflow-y-auto pb-4 bg-white">
                            {/* Select All */}
                            <button
                                onClick={() => toggleSubRegion(`${activeRegionTab} 전체`)}
                                className="w-full h-14 flex items-center justify-between px-5 border-b border-slate-50 active:bg-orange-50 transition-colors text-left outline-none cursor-pointer group"
                            >
                                <span className={cn(
                                    "text-base", 
                                    tempSelected.includes(`${activeRegionTab} 전체`) ? "font-bold text-[#FF6600]" : "text-slate-700"
                                )}>
                                    {activeRegionTab} 전체
                                </span>
                                <div className={cn(
                                    "w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors",
                                    tempSelected.includes(`${activeRegionTab} 전체`) 
                                        ? "bg-[#FF6600] border-[#FF6600]" 
                                        : "bg-white border-slate-300 group-hover:border-slate-400"
                                )}>
                                    {tempSelected.includes(`${activeRegionTab} 전체`) && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                </div>
                            </button>

                            {/* Sub Regions */}
                            {REGIONS[activeRegionTab].map(loc => {
                                const fullLoc = `${activeRegionTab} ${loc}`;
                                const isSelected = tempSelected.includes(fullLoc);
                                return (
                                    <button
                                        key={loc}
                                        onClick={() => toggleSubRegion(fullLoc)}
                                        className="w-full h-14 flex items-center justify-between px-5 border-b border-slate-50 active:bg-orange-50 transition-colors text-left outline-none cursor-pointer group"
                                    >
                                        <span className={cn("text-base", isSelected ? "font-bold text-[#FF6600]" : "text-slate-700")}>
                                            {loc}
                                        </span>
                                        <div className={cn(
                                            "w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors",
                                            isSelected 
                                                ? "bg-[#FF6600] border-[#FF6600]" 
                                                : "bg-white border-slate-300 group-hover:border-slate-400"
                                        )}>
                                            {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Footer Area */}
                    <div className="shrink-0 bg-white border-t border-slate-100 flex flex-col z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                        {/* Selected Chips */}
                        {tempSelected.length > 0 && (
                            <div className="w-full overflow-x-auto no-scrollbar px-4 py-3 border-b border-slate-50">
                                <div className="flex gap-2">
                                    {tempSelected.map(loc => (
                                        <div key={loc} className="flex items-center gap-1 bg-slate-100 text-[#FF6600] border border-orange-100 pl-3 pr-2 py-1.5 rounded-lg text-xs font-bold animate-in fade-in zoom-in duration-200 whitespace-nowrap">
                                            {loc.endsWith('전체') ? loc : (loc.split(' ')[1] || loc)}
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); removeRegion(loc); }} 
                                                className="p-0.5 hover:bg-black/5 rounded-full text-slate-400 hover:text-slate-600 outline-none"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="h-[80px] flex items-center px-4 gap-3 pb-safe">
                            <button 
                                onClick={clearTempLocations}
                                className="flex items-center gap-1.5 px-3 py-2 text-slate-500 font-medium text-sm hover:text-slate-800 transition-colors outline-none"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>초기화</span>
                            </button>
                            <button 
                                onClick={handleApply}
                                className="flex-1 h-12 bg-[#FF6600] hover:bg-[#FF6600]/90 text-white rounded-xl text-base font-bold shadow-md shadow-orange-100 transition-transform active:scale-[0.98] outline-none flex items-center justify-center gap-1.5"
                            >
                                <span>적용하기</span>
                                {tempSelected.length > 0 && (
                                    <span className="bg-white/20 text-white px-1.5 rounded text-xs py-0.5 min-w-[20px] text-center">
                                        {tempSelected.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
}
