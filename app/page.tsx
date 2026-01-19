'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowDown } from 'lucide-react';
import { FilterBar } from '@/features/match/ui/filter-bar';
import { MatchListItem } from '@/features/match/ui/match-list-item';
import { useRecruitingMatches } from '@/features/match/api/queries';
import { filterMatches, groupMatchesByDate, getDayLabel } from '@/features/match/lib/utils';
import { cn } from '@/shared/lib/utils';
import { useLocalStorage } from '@/shared/lib/hooks/use-local-storage';
import { GuestListMatch } from '@/shared/types/match';

// DB 대문자 → UI 소문자 변환
const genderMap: Record<string, 'men' | 'women' | 'mixed'> = {
  MALE: 'men', FEMALE: 'women', MIXED: 'mixed',
  men: 'men', women: 'women', mixed: 'mixed',
};

// Adapter to convert GuestListMatch to MatchListItem props
function adaptMatch(match: GuestListMatch) {
  // 새 스키마: amount 사용, 하위 호환: final
  const priceAmount = match.price.amount ?? match.price.final ?? 0;

  return {
    id: match.id,
    dateISO: match.dateISO,
    startTime: match.startTime,
    endTime: match.endTime,
    price: `${priceAmount.toLocaleString()}원`,
    priceNum: priceAmount,
    title: match.title,
    location: match.location.name,
    address: match.location.address,
    gender: genderMap[match.gender] || 'mixed',
    gameFormat: match.gameFormat ?? '',
    ageRange: match.ageMin && match.ageMax ? `${match.ageMin}대 ~ ${match.ageMax}대` : undefined,
    positions: {
      g: match.positions.G && { 
        status: match.positions.G.open > 0 ? 'open' as const : 'closed' as const, 
        max: match.positions.G.closed + match.positions.G.open 
      },
      f: match.positions.F && { 
        status: match.positions.F.open > 0 ? 'open' as const : 'closed' as const, 
        max: match.positions.F.closed + match.positions.F.open 
      },
      c: match.positions.C && { 
        status: match.positions.C.open > 0 ? 'open' as const : 'closed' as const, 
        max: match.positions.C.closed + match.positions.C.open 
      },
      // Handle 'any' type recruitment? Current mapper assumes G/F/C.
      // If mapper supports 'any', it might put it in 'all'? 
      // Current mapper hardcodes G/F/C.
    }
  };
}

// Hook to detect scroll with hysteresis to prevent flickering
const useScrollDirection = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const SCROLL_DOWN_THRESHOLD = 60; // Hide header when scrolling down past this
    const SCROLL_UP_THRESHOLD = 20;   // Show header when scrolling up below this

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      if (!isScrolled && scrollY > SCROLL_DOWN_THRESHOLD) {
        // Scrolled down past threshold - hide header
        setIsScrolled(true);
      } else if (isScrolled && scrollY < SCROLL_UP_THRESHOLD) {
        // Scrolled up below threshold - show header
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", updateScrollDirection, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollDirection);
  }, [isScrolled]);

  return isScrolled;
};

export default function GuestMatchListPage() {
  const router = useRouter();
  const { data: rawMatches = [], isLoading, error, status } = useRecruitingMatches();



  const matches = useMemo(() => rawMatches.map(adaptMatch), [rawMatches]);
  
  const isScrolled = useScrollDirection();

  // --- State (Persisted) ---
  const [selectedPositions, setSelectedPositions] = useLocalStorage<string[]>('filter_positions', []);
  const [selectedLocations, setSelectedLocations] = useLocalStorage<string[]>('filter_locations', []);
  const [selectedPriceMax, setSelectedPriceMax] = useLocalStorage<number | null>('filter_price_max', null);
  const [minVacancy, setMinVacancy] = useLocalStorage<number | null>('filter_min_vacancy', null);
  
  // New Filters (Persisted)
  const [selectedGenders, setSelectedGenders] = useLocalStorage<string[]>('filter_genders', []);
  const [selectedAges, setSelectedAges] = useLocalStorage<string[]>('filter_ages', []);
  const [selectedGameFormats, setSelectedGameFormats] = useLocalStorage<string[]>('filter_game_formats', []);

  // --- State (Transient) ---
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);

  // --- Filtering Logic ---
  const filteredMatches = useMemo(() => {
    return filterMatches(matches, {
      dateISO: selectedDateISO,
      positions: selectedPositions,
      locations: selectedLocations,
      priceMax: selectedPriceMax,
      minVacancy: minVacancy,
      genders: selectedGenders,
      ages: selectedAges,
      gameFormats: selectedGameFormats,
    });
  }, [
      matches, 
      selectedDateISO, selectedPositions, selectedLocations, selectedPriceMax, 
      minVacancy, selectedGenders, selectedAges, selectedGameFormats
  ]);

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
          minVacancy={minVacancy}
          onMinVacancyChange={setMinVacancy}
          selectedGenders={selectedGenders}
          onGendersChange={setSelectedGenders}
          selectedAges={selectedAges}
          onAgesChange={setSelectedAges}
          selectedGameFormats={selectedGameFormats}
          onGameFormatsChange={setSelectedGameFormats}
        />

        {/* --- Main List Content --- */}
        <div className="pb-24 min-h-[50vh] w-full">
          {isLoading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-[#FF6600] rounded-full animate-spin mb-4" />
              <p className="text-slate-500 text-sm">경기를 불러오는 중...</p>
            </div>
          ) : error ? (
            // Error State
            <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">경기를 불러오지 못했어요</h3>
              <p className="text-slate-500 text-sm mb-4">
                잠시 후 다시 시도해주세요
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#FF6600] text-white rounded-lg text-sm font-medium"
              >
                새로고침
              </button>
            </div>
          ) : Object.keys(groupedMatches).length === 0 ? (
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
                  <div className={cn(
                    "sticky z-10 bg-slate-50/95 backdrop-blur-sm py-2 px-4 border-b border-slate-100 text-xs font-bold text-slate-500 flex items-center gap-2 transition-all duration-300",
                    isScrolled ? "top-[110px]" : "top-[165px]"
                  )}>
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


      </div>
    </div>
  );
}
