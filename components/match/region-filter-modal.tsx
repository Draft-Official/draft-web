'use client';

import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { REGIONS, RegionKey } from '@/lib/constants/regions';

interface RegionFilterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (region: string) => void;
    selectedRegion: string;
}

export function RegionFilterModal({ open, onOpenChange, onSelect, selectedRegion }: RegionFilterModalProps) {
    const [activeRegionTab, setActiveRegionTab] = useState<RegionKey>("서울");

    const handleSubRegionSelect = (subRegion: string) => {
        onSelect(subRegion);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* Centered Modal Content to match Figma: w-[90%] max-w-[380px] h-[600px] */}
            <DialogContent className="p-0 gap-0 w-[90%] max-w-[380px] h-[600px] rounded-2xl overflow-hidden border-0 outline-none">
                <DialogHeader className="h-14 flex items-center justify-center border-b border-slate-100 shrink-0 relative px-4 bg-white z-10">
                    <DialogTitle className="text-lg font-bold text-gray-900">지역 선택</DialogTitle>
                    <DialogClose className="absolute right-4 p-2 rounded-full hover:bg-slate-100 transition-colors bg-transparent border-0">
                        <X className="w-5 h-5 text-slate-500" />
                    </DialogClose>
                </DialogHeader>
                
                {/* Split View Container */}
                <div className="flex flex-1 overflow-hidden h-full">
                    {/* Left Column (Regions) */}
                    <div className="w-[35%] bg-slate-50 border-r border-slate-100 h-full overflow-y-auto no-scrollbar">
                        {(Object.keys(REGIONS) as RegionKey[]).map(region => (
                            <button
                                key={region}
                                onClick={() => setActiveRegionTab(region)}
                                className={cn(
                                    "w-full h-14 flex items-center px-4 text-sm font-medium transition-all text-left relative outline-none select-none",
                                    activeRegionTab === region 
                                        ? "bg-white text-[#FF6600] font-bold" 
                                        : "text-slate-500 hover:bg-slate-100 bg-slate-50"
                                )}
                            >
                                {activeRegionTab === region && (
                                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#FF6600]" />
                                )}
                                {region}
                            </button>
                        ))}
                    </div>

                    {/* Right Column (Sub-Regions List) */}
                    <div className="w-[65%] bg-white h-full overflow-y-auto pb-20">
                            {/* Select All Option */}
                            <button
                            onClick={() => handleSubRegionSelect(`${activeRegionTab} 전체`)}
                            className="w-full h-14 flex items-center justify-between px-5 border-b border-slate-50 active:bg-orange-50 transition-colors text-left outline-none"
                        >
                            <span className={cn(
                                "text-base",
                                selectedRegion === `${activeRegionTab} 전체` ? "font-bold text-[#FF6600]" : "text-slate-700"
                            )}>
                                {activeRegionTab} 전체
                            </span>
                            {selectedRegion === `${activeRegionTab} 전체` && (
                                <Check className="w-5 h-5 text-[#FF6600]" />
                            )}
                        </button>

                        {/* Sub Region Items */}
                        {REGIONS[activeRegionTab].map(loc => {
                            const fullLocationName = `${activeRegionTab} ${loc}`;
                            const isSelected = selectedRegion === fullLocationName;
                            return (
                                <button
                                    key={loc}
                                    onClick={() => handleSubRegionSelect(fullLocationName)}
                                    className="w-full h-14 flex items-center justify-between px-5 border-b border-slate-50 active:bg-orange-50 transition-colors text-left outline-none"
                                >
                                    <span className={cn(
                                        "text-base",
                                        isSelected ? "font-bold text-[#FF6600]" : "text-slate-700"
                                    )}>
                                        {loc}
                                    </span>
                                    {isSelected && (
                                        <Check className="w-5 h-5 text-[#FF6600]" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
