'use client';

import React, { useState, useMemo } from 'react';
import { FilterBar } from '@/features/match/ui/filter-bar';
import { MatchListItem } from '@/features/match/ui/match-list-item';
import { RecruitFAB } from '@/features/match/ui/recruit-fab';
import { useMatches } from '../src/entities/match/model/match-context';
import { filterMatches, groupMatchesByDate, getDayLabel, getShortDayLabel } from '@/features/match/lib/utils';

export default function GuestMatchListPage() {
  // --- Global State ---
  const { matches } = useMatches(); 

  // --- State ---
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  // --- Filtering Logic ---
  const filteredMatches = useMemo(() => {
    return filterMatches(matches, {
      dateISO: selectedDateISO,
      positions: selectedPositions,
      locations: selectedLocations,
    });
  }, [selectedDateISO, selectedPositions, selectedLocations]);

  // Group by Date
  const groupedMatches = useMemo(() => {
    return groupMatchesByDate(filteredMatches);
  }, [filteredMatches]);

  return (
    <div className="bg-white min-h-screen pb-[100px] font-sans">
      {/* 
        Sticky Filter Bar 
        Index: 1 (Top Bar) + 2 (Date Strip) + 3 (Position Filter)
        Total height approx 160px
      */}
      <FilterBar
        selectedDateISO={selectedDateISO}
        onDateSelect={setSelectedDateISO}
        selectedPositions={selectedPositions}
        onPositionsChange={setSelectedPositions}
        selectedLocations={selectedLocations}
        onLocationsChange={setSelectedLocations}
      />

      {/* Main Content Area */}
      <div className="relative">
        {Object.keys(groupedMatches).length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-4xl mb-4">🏀</span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">조건에 맞는 경기가 없어요</h3>
            <p className="text-slate-500 text-sm">
              다른 날짜나 지역을 선택해보세요.<br />
              직접 게스트를 모집할 수도 있어요!
            </p>
          </div>
        ) : (
          // Match List Grouped by Date
          Object.entries(groupedMatches).map(([dateISO, matches]) => (
            <div key={dateISO}>
              {/* 
                Date Header (Sticky)
                Top offset needs to be calculated based on FilterBar height.
                Let's approximate 158px (52+64+42) based on FilterBar layout.
              */}
              {!selectedDateISO && (
                <div className="sticky top-[158px] z-30 bg-white/95 backdrop-blur-sm px-5 py-3 border-b border-[#F2F4F6]">
                  <h2 className="text-[15px] font-bold text-[#191F28] flex items-center gap-2">
                    📅 {getDayLabel(dateISO)}
                  </h2>
                </div>
              )}

              {/* Matches for this date */}
              <div>
                {matches.map((match) => (
                  <MatchListItem
                    key={match.id}
                    match={match}
                    showDate={!!selectedDateISO} // Show date in item if single date selected (or specific design choice)
                    getShortDayLabel={getShortDayLabel}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <RecruitFAB />
    </div>
  );
}