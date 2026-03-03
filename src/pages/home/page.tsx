'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FilterBar } from '@/features/match/ui/filter-bar';
import { MatchListItem } from '@/features/match/ui/match-list-item';
import { MatchDetailView } from '@/features/match/ui/match-detail-view';
import { useMatch, useRecruitingMatchesInfinite } from '@/features/match/api/queries';
import { filterMatches, groupMatchesByDate } from '@/features/match/lib/utils';
import { useLocalStorage } from '@/shared/lib/hooks/use-local-storage';
import { useMediaQuery } from '@/shared/lib/hooks/use-media-query';
import { NotificationBell } from '@/features/notification/ui/notification-bell';
import { useAuth, useRequireAuth } from '@/shared/session';
import { LoginRequiredModal } from '@/features/auth';
import { useUserApplications } from '@/features/application';
import type { ApplicationStatusValue } from '@/shared/config/application-constants';
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { cn } from '@/shared/lib/utils';

const HOME_MATCH_QUERY_KEY = 'match';

export default function GuestMatchListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const selectedMatchPublicId = searchParams?.get(HOME_MATCH_QUERY_KEY) ?? null;
  const isSplitMode = isDesktop && !!selectedMatchPublicId;

  const { requireAuth, modalProps } = useRequireAuth({
    redirectTo: '/matches/create',
    description: '모집글을 작성하려면 로그인이 필요합니다.\n로그인 후 이용해 주세요.',
  });

  const handleCreateMatch = () => {
    if (requireAuth()) {
      router.push('/matches/create');
    }
  };

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRecruitingMatchesInfinite();
  const { data: userApplications } = useUserApplications(user?.id);

  const {
    data: selectedMatch,
    isLoading: isSelectedMatchLoading,
    error: selectedMatchError,
  } = useMatch(isSplitMode && selectedMatchPublicId ? selectedMatchPublicId : '');

  useEffect(() => {
    if (!isDesktop && selectedMatchPublicId) {
      router.replace(`/matches/${selectedMatchPublicId}`);
    }
  }, [isDesktop, selectedMatchPublicId, router]);

  const updateMatchQuery = (matchPublicId: string | null, useReplace = false) => {
    const nextParams = new URLSearchParams(searchParams?.toString() ?? '');

    if (matchPublicId) {
      nextParams.set(HOME_MATCH_QUERY_KEY, matchPublicId);
    } else {
      nextParams.delete(HOME_MATCH_QUERY_KEY);
    }

    const queryString = nextParams.toString();
    const nextUrl = queryString.length > 0 ? `/?${queryString}` : '/';

    if (useReplace) {
      router.replace(nextUrl, { scroll: false });
      return;
    }

    router.push(nextUrl, { scroll: false });
  };

  const handleMatchSelect = (matchPublicId: string) => {
    if (isDesktop) {
      updateMatchQuery(matchPublicId);
      return;
    }

    router.push(`/matches/${matchPublicId}`);
  };

  const handleSplitClose = () => {
    updateMatchQuery(null, true);
  };

  // Flatten pages into single array
  const matches = useMemo(() =>
    data?.pages.flatMap(page => page.matches) ?? [],
    [data?.pages]
  );

  // 사용자 신청 상태 Map (matchId → status)
  const applicationStatusMap = useMemo(() => {
    if (!userApplications) return new Map<string, ApplicationStatusValue>();
    return new Map(userApplications.map(app => [app.matchId, app.status]));
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

  const listContent = (
    <div className={cn("bg-background relative", isSplitMode ? "min-h-full" : "min-h-screen")}>
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

      <div className={cn('min-h-[50vh] w-full', isSplitMode ? 'pb-6' : 'pb-24')}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
            <Spinner className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-slate-500 text-sm">경기를 불러오는 중...</p>
          </div>
        ) : error ? (
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
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium"
            >
              새로고침
            </button>
          </div>
        ) : Object.keys(groupedMatches).length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20 px-6 text-center animate-in fade-in zoom-in duration-300">
            <h3 className="text-lg font-bold text-slate-900 mb-1">조건에 맞는 경기가 없어요</h3>
            <p className="text-slate-500 text-sm mb-8">
              필터 조건을 변경해보시거나<br />직접 게스트를 모집해보는 건 어때요?
            </p>
            <button
              onClick={handleCreateMatch}
              className="flex flex-col items-center gap-2 animate-bounce text-primary hover:text-primary/90 transition-colors"
            >
              <ArrowDown className="w-5 h-5" />
              <span className="text-xs font-bold">직접 모집하기</span>
            </button>
          </div>
        ) : (
          <>
            {Object.entries(groupedMatches).map(([dateISO, groupMatches]) => (
              <div key={dateISO}>
                {groupMatches.map((match) => (
                  <MatchListItem
                    key={match.matchId}
                    match={match}
                    applicationStatus={applicationStatusMap.get(match.matchId)}
                    onClick={handleMatchSelect}
                    isActive={isSplitMode && selectedMatchPublicId === match.publicId}
                  />
                ))}
              </div>
            ))}

            {hasNextPage && (
              <div className="flex justify-center py-6">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="flex items-center gap-2 px-6 py-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFetchingNextPage && <Spinner className="w-4 h-4 " />}
                  더 보기
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );

  const detailContent = (() => {
    if (!selectedMatchPublicId) {
      return (
        <div className="h-full flex items-center justify-center px-8 text-center text-slate-500">
          왼쪽 리스트에서 매치를 선택해 주세요.
        </div>
      );
    }

    if (isSelectedMatchLoading) {
      return (
        <div className="h-full flex items-center justify-center">
          <Spinner className="w-8 h-8 text-muted-foreground" />
        </div>
      );
    }

    if (selectedMatchError || !selectedMatch) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-4 px-8 text-center">
          <p className="text-slate-700 font-semibold">상세 정보를 불러오지 못했습니다.</p>
          <button
            onClick={handleSplitClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            닫기
          </button>
        </div>
      );
    }

    return (
      <MatchDetailView
        match={selectedMatch}
        layoutMode="split"
        onClose={handleSplitClose}
        onOpenFullPage={() => router.push(`/matches/${selectedMatch.publicId}`)}
      />
    );
  })();

  return (
    <>
      <div className="min-h-screen bg-background font-sans">
        {isSplitMode ? (
          <div className="grid h-[100dvh] min-h-screen w-full grid-cols-2 gap-4 bg-background animate-in fade-in duration-300">
            <section className="h-full overflow-y-auto bg-white animate-in slide-in-from-left-2 duration-300">
              {listContent}
            </section>
            <section className="h-full overflow-hidden bg-slate-50 px-2 animate-in slide-in-from-right-4 duration-300">
              <div className="my-3 h-[calc(100%-1.5rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-[0_6px_24px_rgba(15,23,42,0.06)]">
                {detailContent}
              </div>
            </section>
          </div>
        ) : (
          listContent
        )}
      </div>

      <LoginRequiredModal {...modalProps} />
    </>
  );
}
