'use client';

import React, { useState, useMemo } from 'react';
import { Search, ArrowDown, Loader2 } from 'lucide-react';
import { FilterBar } from '@/features/match/ui/filter-bar';
import { MatchListItem } from '@/features/match/ui/match-list-item';
import { useRecruitingMatchesInfinite } from '@/features/match/api/queries';
import { filterMatches, groupMatchesByDate } from '@/features/match/lib/utils';
import { useLocalStorage } from '@/shared/lib/hooks/use-local-storage';
import { NotificationBell } from '@/features/notification/ui/notification-bell';
import { useAuth } from '@/shared/session';
import { useUserApplications } from '@/features/application';
import type { ApplicationStatusValue } from "../shared/config/application-constants";

export default function GuestMatchListPage() {
  const { user } = useAuth();
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRecruitingMatchesInfinite();
  const { data: userApplications } = useUserApplications(user?.id);

  // Flatten pages into single array
  const matches = useMemo(() =>
    data?.pages.flatMap(page => page.matches) ?? [],
    [data?.pages]
  );

  // 사용자 신청 상태 Map (matchId → status)
  const applicationStatusMap = useMemo(() => {
    if (!userApplications) return new Map<string, ApplicationStatusValue>();
    return new Map(userApplications.map(app => [app.match_id, app.status]));
  }, [userApplications]);

  // --- State (Persisted) ---
  const [selectedPositions, setSelectedPositions] = useLocalStorage<string[]>('filter_positions', []);
  const [selectedLocations, setSelectedLocations] = useLocalStorage<string[]>('filter_locations', []);
  const [selectedPriceMax, setSelectedPriceMax] = useLocalStorage<number | null>('filter_price_max', null);
  const [minVacancy, setMinVacancy] = useLocalStorage<number | null>('filter_min_vacancy', null);
  
  // New Filters (Persisted)
  const [selectedGenders, setSelectedGenders] = useLocalStorage<string[]>('filter_genders', []);
  const [selectedAges, setSelectedAges] = useLocalStorage<string[]>('filter_ages', []);
  const [selectedGameFormats, setSelectedGameFormats] = useLocalStorage<string[]>('filter_game_formats', []);
  const [startTimeRange, setStartTimeRange] = useLocalStorage<[number, number] | null>('filter_start_time', null);
  const [hideClosed, setHideClosed] = useLocalStorage<boolean>('filter_hide_closed', true);

  // --- State (Transient) ---
  const [selectedDateISO, setSelectedDateISO] = useState<string | null>(null);

  // --- Filtering Logic ---
  const filteredMatches = useMemo(() => {
    return filterMatches(matches, {
      dateISO: selectedDateISO,
      positions: selectedPositions,
      locations: selectedLocations,
      startTimeRange: startTimeRange,
      priceMax: selectedPriceMax,
      minVacancy: minVacancy,
      genders: selectedGenders,
      ages: selectedAges,
      gameFormats: selectedGameFormats,
      hideClosed: hideClosed,
    });
  }, [
      matches,
      selectedDateISO, selectedPositions, selectedLocations, startTimeRange,
      selectedPriceMax, minVacancy, selectedGenders, selectedAges, selectedGameFormats,
      hideClosed
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
          startTimeRange={startTimeRange}
          onStartTimeRangeChange={setStartTimeRange}
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
          hideClosed={hideClosed}
          onHideClosedChange={setHideClosed}
          notificationSlot={<NotificationBell />}
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
            // Match List (각 카드에 날짜가 포함되어 있으므로 sticky header 불필요)
            <>
              {Object.entries(groupedMatches).map(([dateISO, groupMatches]) => (
                <div key={dateISO}>
                  {groupMatches.map((match) => (
                    <MatchListItem
                      key={match.id}
                      match={match}
                      applicationStatus={applicationStatusMap.get(match.id)}
                    />
                  ))}
                </div>
              ))}
              {/* 더 보기 버튼 */}
              {hasNextPage && (
                <div className="flex justify-center py-6">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isFetchingNextPage && <Loader2 className="w-4 h-4 animate-spin" />}
                    더 보기
                  </button>
                </div>
              )}
            </>
          )}
        </div>


      </div>
    </div>
  );
}
