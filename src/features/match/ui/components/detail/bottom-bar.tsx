'use client';

import React from 'react';
import { Match } from '@/features/match/model/types';
import { Button } from '@/shared/ui/base/button';

import { cn } from '@/shared/lib/utils';

interface BottomBarProps {
  match: Match;
  onApply: () => void;
}

export function MatchDetailBottomBar({ match, onApply }: BottomBarProps) {
  const isClosed = match.isClosed || match.positions.all?.status === 'closed';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none md:pl-[240px]">
        <div className="max-w-[760px] mx-auto bg-white border-t border-slate-100 px-5 pt-4 pb-8 pointer-events-auto shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between gap-4">
                 {/* Price should be hidden or integrated? User said 'matched to content size'. 
                     Actually the image shows FULL WIDTH button saying 'Create Match' (or 'Apply Match').
                     And user said 'Apply button should be sticky... matched to white background'.
                     And 'centered relative to content'.
                     So it should be a single large button.
                 */}
                <Button 
                    size="lg"
                    className={cn(
                        "w-full text-lg font-bold h-12 rounded-xl",
                        isClosed ? "bg-slate-200 text-slate-500 hover:bg-slate-200" : "bg-[#FF6600] hover:bg-[#FF6600]/90 text-white"
                    )}
                    disabled={isClosed}
                    onClick={onApply}
                >
                    {isClosed ? "모집 마감" : "경기 신청하기"}
                </Button>
            </div>
        </div>
    </div>
  );
}
