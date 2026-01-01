'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FilterBar } from '@/features/match/ui/filter-bar';
import { MatchListItem } from '@/features/match/ui/match-list-item';
import { useMatches } from '../src/entities/match/model/match-context';
import { filterMatches, groupMatchesByDate, getDayLabel } from '@/features/match/lib/utils';
import { cn } from '@/shared/lib/utils';

export default function GuestMatchListPage() {
  const router = useRouter();
  const { matches } = useMatches();

  // --- State ---
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedPriceMax, setSelectedPriceMax] = useState<number | null>(null);
  const [isHideClosed, setIsHideClosed] = useState(false);

  // --- Filtering Logic ---
  const filteredMatches = useMemo(() => {
    return filterMatches(matches, {
      dateISO: selectedDateISO,
      positions: selectedPositions,
      locations: selectedLocations,
      priceMax: selectedPriceMax,
      hideClosed: isHideClosed,
    });
  }, [selectedDateISO, selectedPositions, selectedLocations, selectedPriceMax, isHideClosed, matches]);

  // Group by Date
  const groupedMatches = useMemo(() => {
    return groupMatchesByDate(filteredMatches);
  }, [filteredMatches]);

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center font-sans">
      <div className="w-full max-w-[760px] bg-white min-h-screen shadow-sm relative">

        {/* --- Sticky Header & Filters --- */}
        <FilterBar
          selectedDateISO={selectedDateISO}
          onDateSelect={setSelectedDateISO}
          selectedPositions={selectedPositions}
          onPositionsChange={setSelectedPositions}
          selectedLocations={selectedLocations}
          onLocationsChange={setSelectedLocations}
          selectedPriceMax={selectedPriceMax}
          onPriceMaxChange={setSelectedPriceMax}
          isHideClosed={isHideClosed}
          onHideClosedChange={setIsHideClosed}
        />

        {/* --- Main List Content --- */}
        <div className="pb-24 min-h-[50vh] w-full">
          {Object.keys(groupedMatches).length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center pt-20 px-6 text-center animate-in fade-in zoom-in duration-300">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">조건에 맞는 경기가 없어요</h3>
              <p className="text-slate-500 text-sm mb-8">
                필터 조건을 변경해보시거나<br />직접 게스트를 모집해보는 건 어때요?
              </p>
              <div className="flex flex-col items-center gap-2 animate-bounce">
                <span className="text-xs text-[#FF6600] font-bold">직접 모집하기</span>
                <ArrowDown className="w-5 h-5 text-[#FF6600]" />
              </div>
            </div>
          ) : (
            // Match List Grouped by Date
            Object.entries(groupedMatches).map(([dateISO, groupMatches]) => (
              <div key={dateISO} className="relative">
                {/* Date Divider (Sticky) */}
                {!selectedDateISO && (
                  <div className="sticky top-[165px] z-10 bg-slate-50/95 backdrop-blur-sm py-2 px-4 border-b border-slate-100 text-xs font-bold text-slate-500 flex items-center gap-2">
                    {getDayLabel(dateISO)}
                  </div>
                )}

                <div>
                  {groupMatches.map((match) => (
                    <MatchListItem key={match.id} match={match} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* --- FAB Button --- */}
        <div className="fixed bottom-24 z-50 left-1/2 -translate-x-1/2 w-full max-w-[760px] pointer-events-none">
          <div className="absolute right-4 bottom-0 pointer-events-auto">
            <Button
              onClick={() => router.push('/match/create')}
              className={cn(
                "rounded-full bg-[#FF6600] shadow-xl shadow-orange-200 hover:bg-[#FF6600]/90 flex items-center justify-center transition-all active:scale-95",
                "w-14 h-14 md:w-auto md:h-16 md:px-8 md:rounded-2xl"
              )}
            >
              {/* Mobile: Plus Icon Only */}
              <Plus className="w-7 h-7 text-white md:hidden" />

              {/* PC: Large Bold Text */}
              <span className="hidden md:inline text-white font-extrabold text-xl tracking-tight">게스트 모집 +</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
