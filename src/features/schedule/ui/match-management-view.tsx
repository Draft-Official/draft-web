"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, RotateCcw } from "lucide-react";
import { useLocalStorage } from "@/shared/lib/hooks/use-local-storage";
import { useMediaQuery } from '@/shared/lib/hooks/use-media-query';
import { useAuth } from "@/shared/session";
import { useUnreadNotifications, useMarkNotificationsAsReadByMatch } from "@/features/notification";
import type { UnreadMatchNotificationDTO } from "@/features/notification";
import type { NotificationTypeValue } from "@/shared/config/match-constants";
import { FilterDropdown } from "./components/filter-dropdown";
import { MatchCard } from "./components/match-card";
import { ApplicationInfoDialog } from "./components/application-info-dialog";
import { Toggle } from "@/shared/ui/shadcn/toggle";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/shadcn/tabs";
import { useHostedMatches, useParticipatingMatches, useConfirmPaymentByGuest, useCancelApplicationByGuest } from "@/features/schedule";
import { useScheduleVote } from "../api/vote-mutations";
import type { TeamVoteStatusValue } from "@/shared/config/application-constants";
import type { MatchType, ScheduleMatchListItemDTO } from "../model/types";
import {
  MATCH_TYPE_FILTER_OPTIONS,
  HOST_TYPE_FILTER_OPTIONS,
  GUEST_STATUS_FILTER_OPTIONS,
  HOST_STATUS_FILTER_OPTIONS,
  PAST_MATCH_STATUSES,
} from "../config/constants";
import { cn } from "@/shared/lib/utils";
import { Spinner } from '@/shared/ui/shadcn/spinner';
import { DESKTOP_DETAIL_QUERY_KEY, decodeDesktopDetailRoute, encodeDesktopDetailRoute } from '@/shared/lib/desktop-detail-route';
import { DesktopSplitView } from '@/shared/ui/layout';
import { ScheduleRouteDetailPanel } from './detail/schedule-route-detail-panel';

type ViewMode = "guest" | "host";
type GuestTypeFilterValue = Exclude<MatchType, "host">;
type HostTypeFilterValue = Exclude<MatchType, "guest">;
type GuestStatusFilterValue = "pending" | "payment_waiting" | "voting" | "confirmed" | "ended" | "cancelled";
type HostStatusFilterValue = "recruiting" | "closed" | "voting" | "confirmed" | "ended" | "cancelled";

interface MatchManagementViewProps {
  notificationSlot?: React.ReactNode;
}

export function MatchManagementView({ notificationSlot }: MatchManagementViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { user } = useAuth();
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>("schedule_view_mode", "guest");
  const [guestTypeFilter, setGuestTypeFilter] = useLocalStorage<GuestTypeFilterValue[]>("schedule_guest_type_filter", []);
  const [hostTypeFilter, setHostTypeFilter] = useLocalStorage<HostTypeFilterValue[]>("schedule_host_type_filter", []);
  const [guestStatusFilter, setGuestStatusFilter] = useLocalStorage<GuestStatusFilterValue[]>("schedule_guest_status_filter", []);
  const [hostStatusFilter, setHostStatusFilter] = useLocalStorage<HostStatusFilterValue[]>("schedule_host_status_filter", []);
  const [showPastMatches, setShowPastMatches] = useLocalStorage<"hide" | "show">("schedule_past_matches", "hide");

  // Bottom sheet state for guest application info
  const [selectedMatch, setSelectedMatch] = useState<ScheduleMatchListItemDTO | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const selectedDetailPath = decodeDesktopDetailRoute(
    searchParams?.get(DESKTOP_DETAIL_QUERY_KEY) ?? null
  );
  const isSplitMode = isDesktop && !!selectedDetailPath;

  useEffect(() => {
    if (!selectedDetailPath || typeof window === 'undefined') {
      return;
    }

    const isDesktopViewport = window.matchMedia('(min-width: 1024px)').matches;

    if (!isDesktopViewport) {
      router.replace(selectedDetailPath);
    }
  }, [selectedDetailPath, router]);

  const updateDetailQuery = (detailPath: string | null, useReplace = false) => {
    const nextParams = new URLSearchParams(searchParams?.toString() ?? '');

    if (detailPath) {
      nextParams.set(DESKTOP_DETAIL_QUERY_KEY, encodeDesktopDetailRoute(detailPath));
    } else {
      nextParams.delete(DESKTOP_DETAIL_QUERY_KEY);
    }

    const queryString = nextParams.toString();
    const nextUrl = queryString.length > 0 ? `/schedule?${queryString}` : '/schedule';

    if (useReplace) {
      router.replace(nextUrl, { scroll: false });
      return;
    }

    router.push(nextUrl, { scroll: false });
  };

  const handleSplitClose = () => {
    updateDetailQuery(null, true);
  };

  // Fetch data from Supabase (infinite query)
  const {
    data: hostedData,
    isLoading: isLoadingHosted,
    fetchNextPage: fetchNextHosted,
    hasNextPage: hasNextHosted,
    isFetchingNextPage: isFetchingNextHosted,
  } = useHostedMatches();
  const {
    data: participatingData,
    isLoading: isLoadingParticipating,
    fetchNextPage: fetchNextParticipating,
    hasNextPage: hasNextParticipating,
    isFetchingNextPage: isFetchingNextParticipating,
  } = useParticipatingMatches();

  const hostedMatches = useMemo(() => hostedData?.pages.flatMap((page) => page.matches) ?? [], [hostedData]);
  const participatingMatches = useMemo(() => participatingData?.pages.flatMap((page) => page.matches) ?? [], [participatingData]);

  // Fetch unread notifications & group by matchId
  const { data: unreadNotifications = [] } = useUnreadNotifications(user?.id);
  const markReadByMatch = useMarkNotificationsAsReadByMatch();

  const notificationsByMatchId = useMemo(() => {
    const GUEST_TYPES: NotificationTypeValue[] = [
      'APPLICATION_APPROVED',
      'APPLICATION_REJECTED',
      'APPLICATION_CANCELED_USER_REQUEST',
      'APPLICATION_CANCELED_PAYMENT_TIMEOUT',
      'APPLICATION_CANCELED_FRAUDULENT_PAYMENT',
      'MATCH_CANCELED',
    ];
    const HOST_TYPES: NotificationTypeValue[] = [
      'NEW_APPLICATION',
      'GUEST_CANCELED',
      'GUEST_PAYMENT_CONFIRMED',
    ];
    const allowedTypes = viewMode === 'guest' ? GUEST_TYPES : HOST_TYPES;

    const map = new Map<string, UnreadMatchNotificationDTO[]>();
    for (const n of unreadNotifications) {
      if (!n.matchId) continue;
      if (!allowedTypes.includes(n.type)) continue;
      const list = map.get(n.matchId);
      if (list) {
        list.push(n);
      } else {
        map.set(n.matchId, [n]);
      }
    }
    return map;
  }, [unreadNotifications, viewMode]);

  // Mutations for guest actions
  const confirmPaymentMutation = useConfirmPaymentByGuest();
  const cancelApplicationMutation = useCancelApplicationByGuest();
  const voteMutation = useScheduleVote();

  const handleConfirmPayment = (applicationId: string, matchId: string) => {
    confirmPaymentMutation.mutate({ applicationId, matchId });
  };

  const handleCancelApplication = (applicationId: string, matchId: string) => {
    cancelApplicationMutation.mutate({ applicationId, matchId });
  };

  const handleVote = (matchId: string, vote: TeamVoteStatusValue, reason: string) => {
    if (!user?.id) return;
    voteMutation.mutate({
      userId: user.id,
      matchId,
      status: vote,
      description: reason || undefined,
    });
  };

  const isLoading = viewMode === "host" ? isLoadingHosted : isLoadingParticipating;
  const allMatches: ScheduleMatchListItemDTO[] = viewMode === "host" ? hostedMatches : participatingMatches;

  // Filter matches
  const filteredMatches = useMemo(() => {
    let filtered = [...allMatches];

    // Type filter - Multi-select (different options per mode)
    if (viewMode === "guest" && guestTypeFilter.length > 0) {
      filtered = filtered.filter((m) => guestTypeFilter.includes(m.matchType as GuestTypeFilterValue));
    }
    if (viewMode === "host" && hostTypeFilter.length > 0) {
      filtered = filtered.filter((m) => hostTypeFilter.includes(m.matchType as HostTypeFilterValue));
    }

    // Status filter - Multi-select (탭별 분리)
    if (viewMode === "guest" && guestStatusFilter.length > 0) {
      filtered = filtered.filter((m) => {
        if (guestStatusFilter.includes("pending") && (m.status === "waiting" || m.status === "pending")) return true;
        if (guestStatusFilter.includes("payment_waiting") && m.status === "payment_waiting") return true;
        if (guestStatusFilter.includes("voting") && m.status === "voting") return true;
        if (guestStatusFilter.includes("confirmed") && (m.status === "confirmed" || m.status === "scheduled" || m.status === "ongoing")) return true;
        if (guestStatusFilter.includes("ended") && m.status === "ended") return true;
        if (guestStatusFilter.includes("cancelled") && (m.status === "cancelled" || m.status === "rejected")) return true;
        return false;
      });
    }
    if (viewMode === "host" && hostStatusFilter.length > 0) {
      filtered = filtered.filter((m) => {
        if (hostStatusFilter.includes("recruiting") && m.status === "recruiting") return true;
        if (hostStatusFilter.includes("closed") && m.status === "closed") return true;
        if (hostStatusFilter.includes("voting") && m.status === "voting") return true;
        if (hostStatusFilter.includes("confirmed") && (m.status === "confirmed" || m.status === "scheduled" || m.status === "ongoing")) return true;
        if (hostStatusFilter.includes("ended") && m.status === "ended") return true;
        if (hostStatusFilter.includes("cancelled") && m.status === "cancelled") return true;
        return false;
      });
    }

    // Past matches filter
    if (showPastMatches === "hide") {
      filtered = filtered.filter((m) => !PAST_MATCH_STATUSES.includes(m.status));
    }

    // 진행 중/예정 → 종료/취소 순, 각 그룹 내에서 가까운 시간순
    const getTime = (m: ScheduleMatchListItemDTO) => new Date(m.startTimeISO).getTime();

    const active = filtered.filter((m) => !PAST_MATCH_STATUSES.includes(m.status));
    const past = filtered.filter((m) => PAST_MATCH_STATUSES.includes(m.status));

    active.sort((a, b) => getTime(a) - getTime(b));
    past.sort((a, b) => getTime(b) - getTime(a));

    filtered = [...active, ...past];

    return filtered;
  }, [allMatches, viewMode, guestTypeFilter, hostTypeFilter, guestStatusFilter, hostStatusFilter, showPastMatches]);

  const handleCardClick = (matchId: string) => {
    // Mark unread notifications for this match as read
    if (user?.id && notificationsByMatchId.has(matchId)) {
      markReadByMatch.mutate({ userId: user.id, matchId });
    }

    // Find the match to determine its type
    const match = allMatches.find((m) => m.id === matchId);
    if (!match) return;

    // 참여 탭에서 게스트 모집 타입 클릭 시 바텀시트 표시
    if (viewMode === "guest" && match.managementType === "guest_recruitment" && !isDesktop) {
      setSelectedMatch(match);
      setIsSheetOpen(true);
      return;
    }

    const detailPath = getMatchDetailPath(match);

    if (isDesktop) {
      updateDetailQuery(detailPath);
      return;
    }

    router.push(detailPath);
  };

  const getMatchDetailPath = (match: ScheduleMatchListItemDTO) => {
    if (match.managementType === "tournament") {
      // 대회는 별도 라우트
      if (viewMode === "host") {
        return `/tournaments/${match.id}/manage`;
      }

      return `/tournaments/${match.id}`;
    }

    if (match.managementType === "team_exercise" && match.teamCode) {
      if (viewMode === "host") {
        return `/team/${match.teamCode}/matches/${match.publicId}/manage`;
      }

      return `/team/${match.teamCode}/matches/${match.publicId}`;
    }

    // 게스트 모집은 matches 라우트 사용
    if (viewMode === "host") {
      return `/matches/${match.publicId}/manage`;
    }

    return `/matches/${match.publicId}?from=schedule`;
  };

  const getGuestTypeFilterDisplayLabel = (value: GuestTypeFilterValue[]) => {
    if (value.length === 0) return "종류";
    if (value.length === 1) {
      return MATCH_TYPE_FILTER_OPTIONS.find((opt) => opt.value === value[0])?.label || "";
    }
    return `${MATCH_TYPE_FILTER_OPTIONS.find((opt) => opt.value === value[0])?.label} 외 ${value.length - 1}`;
  };

  const getHostTypeFilterDisplayLabel = (value: HostTypeFilterValue[]) => {
    if (value.length === 0) return "종류";
    if (value.length === 1) {
      return HOST_TYPE_FILTER_OPTIONS.find((opt) => opt.value === value[0])?.label || "";
    }
    return `${HOST_TYPE_FILTER_OPTIONS.find((opt) => opt.value === value[0])?.label} 외 ${value.length - 1}`;
  };

  const getGuestStatusFilterDisplayLabel = (value: GuestStatusFilterValue[]) => {
    if (value.length === 0) return "진행상태";
    if (value.length === 1) {
      return GUEST_STATUS_FILTER_OPTIONS.find((opt) => opt.value === value[0])?.label || "";
    }
    return `${GUEST_STATUS_FILTER_OPTIONS.find((opt) => opt.value === value[0])?.label} 외 ${value.length - 1}`;
  };

  const getHostStatusFilterDisplayLabel = (value: HostStatusFilterValue[]) => {
    if (value.length === 0) return "진행상태";
    if (value.length === 1) {
      return HOST_STATUS_FILTER_OPTIONS.find((opt) => opt.value === value[0])?.label || "";
    }
    return `${HOST_STATUS_FILTER_OPTIONS.find((opt) => opt.value === value[0])?.label} 외 ${value.length - 1}`;
  };

  const showPast = showPastMatches === "show";

  // Check if any filter is active
  const isFilterActive = guestTypeFilter.length > 0 || hostTypeFilter.length > 0 || guestStatusFilter.length > 0 || hostStatusFilter.length > 0 || showPast;

  // Reset all filters
  const handleResetFilters = () => {
    setGuestTypeFilter([]);
    setHostTypeFilter([]);
    setGuestStatusFilter([]);
    setHostStatusFilter([]);
    setShowPastMatches("hide");
  };

  const listContent = (
    <div className="min-h-screen bg-background pb-(--dimension-spacing-y-screen-bottom)">
      {/* Header */}
      <header className="bg-white border-b border-slate-100">
        <div className="flex items-center justify-between px-(--dimension-spacing-x-global-gutter) h-(--dimension-x14)">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">경기 관리</h1>

          {/* Guest/Host Toggle */}
          <div className="flex items-center gap-3">
            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as "guest" | "host")}
              className="w-auto gap-0"
            >
              <TabsList
                variant="default"
                className="relative h-auto rounded-full border border-slate-200 bg-neutral-100 p-0.5"
              >
                <div
                  className="pointer-events-none absolute top-0.5 bottom-0.5 left-0.5 rounded-full border border-slate-200 bg-white shadow-sm"
                  style={{
                    width: "calc(50% - 2px)",
                    transform: viewMode === "host" ? "translateX(100%)" : "translateX(0)",
                  }}
                />
                <TabsTrigger
                  value="guest"
                  className="relative z-10 rounded-full px-4 py-1.5 text-base font-semibold text-slate-500 hover:text-slate-700 data-active:bg-transparent data-active:shadow-none data-active:text-slate-900"
                >
                  참여
                </TabsTrigger>
                <TabsTrigger
                  value="host"
                  className="relative z-10 rounded-full px-4 py-1.5 text-base font-semibold text-slate-500 hover:text-slate-700 data-active:bg-transparent data-active:shadow-none data-active:text-slate-900"
                >
                  관리
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {notificationSlot}
          </div>
        </div>
      </header>

      {/* Filters - Single Row */}
      <section className="bg-white border-b border-slate-100 px-(--dimension-spacing-x-global-gutter) py-(--dimension-spacing-y-component-default)">
        <div className="flex gap-(--dimension-spacing-x-between-chips) overflow-x-auto hide-scrollbar items-center">
          {/* Type Filter (Multi-select) - Different options per mode */}
          {viewMode === "guest" ? (
            <FilterDropdown
              options={MATCH_TYPE_FILTER_OPTIONS}
              value={guestTypeFilter}
              onChange={setGuestTypeFilter}
              getDisplayLabel={getGuestTypeFilterDisplayLabel}
              multiSelect
            />
          ) : (
            <FilterDropdown
              options={HOST_TYPE_FILTER_OPTIONS}
              value={hostTypeFilter}
              onChange={setHostTypeFilter}
              getDisplayLabel={getHostTypeFilterDisplayLabel}
              multiSelect
            />
          )}

          {/* Status Filter (Multi-select) - 탭별 분리 */}
          {viewMode === "guest" ? (
            <FilterDropdown
              options={GUEST_STATUS_FILTER_OPTIONS}
              value={guestStatusFilter}
              onChange={setGuestStatusFilter}
              getDisplayLabel={getGuestStatusFilterDisplayLabel}
              multiSelect
            />
          ) : (
            <FilterDropdown
              options={HOST_STATUS_FILTER_OPTIONS}
              value={hostStatusFilter}
              onChange={setHostStatusFilter}
              getDisplayLabel={getHostStatusFilterDisplayLabel}
              multiSelect
            />
          )}

          {/* Past Matches Toggle */}
          <Toggle
            variant="outline"
            pressed={showPast}
            onPressedChange={(pressed) => setShowPastMatches(pressed ? "show" : "hide")}
            className={cn(
              "h-auto min-w-0 rounded-full px-(--dimension-x4) py-(--dimension-x2) text-sm font-medium border transition-all",
              showPast
                ? "border-primary text-muted-foreground bg-brand-weak data-[state=on]:bg-brand-weak data-[state=on]:text-muted-foreground"
                : "border-slate-200 text-muted-foreground"
            )}
          >
            지난 경기
          </Toggle>

          {/* Reset Filter Button - Right aligned */}
          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-(--dimension-x1) text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors px-(--dimension-x2) shrink-0 ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>초기화</span>
            </button>
          )}
        </div>
      </section>

      {/* Match List */}
      <section className="px-(--dimension-spacing-x-global-gutter) py-(--dimension-spacing-y-component-default) space-y-(--dimension-spacing-y-component-default)">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner className="w-8 h-8 text-muted-foreground  mb-4" />
            <p className="text-slate-500 text-center">
              경기 목록을 불러오는 중...
            </p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-slate-500 text-center">
              {viewMode === "guest" ? "참여한 경기가 없습니다." : "주최한 경기가 없습니다."}
            </p>
          </div>
        ) : (
          <>
            {filteredMatches.map((match) => {
              const detailPath = getMatchDetailPath(match);
              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  notifications={notificationsByMatchId.get(match.id)}
                  onClick={handleCardClick}
                  onConfirmPayment={handleConfirmPayment}
                  onVote={handleVote}
                  isVoting={voteMutation.isPending}
                  isActive={isSplitMode && selectedDetailPath === detailPath}
                />
              );
            })}
            {(viewMode === "host" ? hasNextHosted : hasNextParticipating) && (
              <div className="flex justify-center py-2">
                <button
                  onClick={() => viewMode === "host" ? fetchNextHosted() : fetchNextParticipating()}
                  disabled={viewMode === "host" ? isFetchingNextHosted : isFetchingNextParticipating}
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  {(viewMode === "host" ? isFetchingNextHosted : isFetchingNextParticipating) && (
                    <Spinner className="w-3.5 h-3.5" />
                  )}
                  더 보기
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );

  return (
    <>
      <DesktopSplitView
        enabled={isSplitMode}
        listContent={listContent}
        detailContent={
          <ScheduleRouteDetailPanel
            routePath={selectedDetailPath}
            onClose={handleSplitClose}
            emptyMessage="왼쪽 목록에서 경기를 선택해 주세요."
          />
        }
      />

      {/* Guest Application Info Dialog */}
      <ApplicationInfoDialog
        match={selectedMatch}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onViewDetail={(matchId) => {
          const match = allMatches.find((m) => m.id === matchId);
          if (!match) {
            return;
          }

          const detailPath = getMatchDetailPath(match);

          if (isDesktop) {
            updateDetailQuery(detailPath);
            setIsSheetOpen(false);
            return;
          }

          router.push(detailPath);
        }}
        onConfirmPayment={handleConfirmPayment}
        onCancelApplication={handleCancelApplication}
      />
    </>
  );
}
