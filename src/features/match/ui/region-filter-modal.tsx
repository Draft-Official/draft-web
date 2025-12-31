'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/shared/lib/utils";
import { REGIONS, RegionKey } from '@/shared/lib/constants/regions';

interface RegionFilterModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApply: (regions: string[]) => void;
    selectedRegions: string[];
}

export function RegionFilterModal({ open, onOpenChange, onApply, selectedRegions }: RegionFilterModalProps) {
    const [activeRegionTab, setActiveRegionTab] = useState<RegionKey>("서울");
    // Temporary selection state (confirmed on Apply button click)
    const [tempSelected, setTempSelected] = useState<string[]>(selectedRegions);

    // Sync tempSelected when modal opens
    useEffect(() => {
        if (open) {
            setTempSelected(selectedRegions);
        }
    }, [open, selectedRegions]);

    // Calculate count for each region tab
    const getRegionCount = (regionKey: RegionKey): number => {
        return tempSelected.filter(r => r.startsWith(regionKey)).length;
    };

    // Toggle individual sub-region
    const toggleSubRegion = (subRegion: string) => {
        setTempSelected(prev => 
            prev.includes(subRegion) 
                ? prev.filter(r => r !== subRegion)
                : [...prev, subRegion]
        );
    };

    // Remove region from selected chips
    const removeRegion = (region: string) => {
        setTempSelected(prev => prev.filter(r => r !== region));
    };

    // Apply selections and close modal
    const handleApply = () => {
        onApply(tempSelected);
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
                <div className="flex flex-1 overflow-hidden relative">
                    {/* Left Column (Regions with Counts) */}
                    <div className="w-[35%] bg-slate-50 border-r border-slate-100 h-full overflow-y-auto no-scrollbar">
                        {(Object.keys(REGIONS) as RegionKey[]).map(region => {
                            const count = getRegionCount(region);
                            return (
                                <button
                                    key={region}
                                    onClick={() => setActiveRegionTab(region)}
                                    className={cn(
                                        "w-full h-14 flex items-center justify-between px-4 text-sm font-medium transition-all text-left relative outline-none select-none",
                                        activeRegionTab === region 
                                            ? "bg-white text-[#FF6600] font-bold" 
                                            : "text-slate-500 hover:bg-slate-100 bg-slate-50"
                                    )}
                                >
                                    {activeRegionTab === region && (
                                        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#FF6600]" />
                                    )}
                                    <span>{region}</span>
                                    {count > 0 && (
                                        <span className={cn(
                                            "text-xs ml-1",
                                            activeRegionTab === region ? "text-[#FF6600]" : "text-slate-400"
                                        )}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Column (Sub-Regions List with Checkboxes) */}
                    <div className="w-[65%] bg-white h-full overflow-y-auto pb-[180px]">
                        {/* Select All Option */}
                        <button
                            onClick={() => toggleSubRegion(`${activeRegionTab} 전체`)}
                            className="w-full h-14 flex items-center justify-between px-5 border-b border-slate-50 active:bg-orange-50 transition-colors text-left outline-none"
                        >
                            <span className={cn(
                                "text-base",
                                tempSelected.includes(`${activeRegionTab} 전체`) ? "font-bold text-[#FF6600]" : "text-slate-700"
                            )}>
                                {activeRegionTab} 전체
                            </span>
                            <Checkbox 
                                checked={tempSelected.includes(`${activeRegionTab} 전체`)}
                                onCheckedChange={() => toggleSubRegion(`${activeRegionTab} 전체`)}
                                className={cn(
                                    "data-[state=checked]:bg-[#FF6600] data-[state=checked]:border-[#FF6600]"
                                )}
                            />
                        </button>

                        {/* Sub Region Items */}
                        {REGIONS[activeRegionTab].map(loc => {
                            const fullLocationName = `${activeRegionTab} ${loc}`;
                            const isSelected = tempSelected.includes(fullLocationName);
                            return (
                                <button
                                    key={loc}
                                    onClick={() => toggleSubRegion(fullLocationName)}
                                    className="w-full h-14 flex items-center justify-between px-5 border-b border-slate-50 active:bg-orange-50 transition-colors text-left outline-none"
                                >
                                    <span className={cn(
                                        "text-base",
                                        isSelected ? "font-bold text-[#FF6600]" : "text-slate-700"
                                    )}>
                                        {loc}
                                    </span>
                                    <Checkbox 
                                        checked={isSelected}
                                        onCheckedChange={() => toggleSubRegion(fullLocationName)}
                                        className={cn(
                                            "data-[state=checked]:bg-[#FF6600] data-[state=checked]:border-[#FF6600]"
                                        )}
                                    />
                                </button>
                            );
                        })}
                    </div>

                    {/* Bottom Selection Chips Area + Apply Button */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 space-y-3">
                        {/* Selected Chips */}
                        {tempSelected.length > 0 && (
                            <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto">
                                {tempSelected.map(region => (
                                    <Badge 
                                        key={region}
                                        variant="secondary"
                                        className="px-3 py-1 bg-orange-50 text-[#FF6600] hover:bg-orange-100 border border-orange-200 gap-1"
                                    >
                                        {region}
                                        <X 
                                            className="w-3 h-3 cursor-pointer hover:text-[#FF8833]" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeRegion(region);
                                            }}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                        
                        {/* Apply Button */}
                        <Button 
                            onClick={handleApply} 
                            className="w-full bg-[#FF6600] hover:bg-[#FF7722] text-white font-semibold"
                        >
                            적용하기
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
