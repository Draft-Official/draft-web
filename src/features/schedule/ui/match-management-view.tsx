"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, RotateCcw, Loader2 } from "lucide-react";
import { useLocalStorage } from "@/shared/lib/hooks/use-local-storage";
import { useAuth } from "@/shared/session";
import { useUnreadNotifications, useMarkNotificationsAsReadByMatch } from "@/features/notification";
import type { UnreadMatchNotificationDTO } from "@/features/notification";
import type { NotificationTypeValue } from "@/shared/config/match-constants";
import { FilterDropdown } from "./components/filter-dropdown";
import { MatchCard } from "./components/match-card";
import { ApplicationInfoDialog } from "./components/application-info-dialog";
import { Toggle } from "@/shared/ui/shadcn/toggle";
import { useHostedMatches, useParticipatingMatches, useConfirmPaymentByGuest, useCancelApplicationByGuest } from "@/features/schedule";
import type { MatchType, ScheduleMatchListItemDTO } from "../model/types";
import {
  MATCH_TYPE_FILTER_OPTIONS,
  HOST_TYPE_FILTER_OPTIONS,
  GUEST_STATUS_FILTER_OPTIONS,
  HOST_STATUS_FILTER_OPTIONS,
  PAST_MATCH_STATUSES,
} from "../config/constants";
import { cn } from "@/shared/lib/utils";

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

  // Fetch data from Supabase
  const { data: hostedMatches = [], isLoading: isLoadingHosted } = useHostedMatches();
  const { data: participatingMatches = [], isLoading: isLoadingParticipating } = useParticipatingMatches();

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

  const handleConfirmPayment = (applicationId: string, matchId: string) => {
    confirmPaymentMutation.mutate({ applicationId, matchId });
  };

  const handleCancelApplication = (applicationId: string, matchId: string) => {
    cancelApplicationMutation.mutate({ applicationId, matchId });
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

    // 참여 탭에서 guest 타입 클릭 시 바텀시트 표시
    if (viewMode === "guest" && match.matchType === "guest") {
      setSelectedMatch(match);
      setIsSheetOpen(true);
      return;
    }

    // Navigate based on match type and view mode
    navigateToMatchDetail(match);
  };

  const navigateToMatchDetail = (match: ScheduleMatchListItemDTO) => {
    if (match.matchType === "tournament") {
      // 대회는 별도 라우트
      if (viewMode === "host") {
        router.push(`/tournaments/${match.id}/manage`);
      } else {
        router.push(`/tournaments/${match.id}`);
      }
    } else {
      // host, team, guest 모두 matches로 통합
      if (viewMode === "host" || match.matchType === "host") {
        router.push(`/matches/${match.id}/manage`);
      } else {
        // 참여 탭에서 들어가는 경우 from=schedule 파라미터 추가
        router.push(`/matches/${match.id}?from=schedule`);
      }
    }
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

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">경기 관리</h1>

          {/* Guest/Host Toggle - Slide Animation */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center bg-slate-100 rounded-full p-1">
              {/* Sliding Indicator */}
              <div
                className={cn(
                  "absolute h-[calc(100%-8px)] w-[calc(50%-2px)] bg-slate-900 rounded-full transition-transform duration-300 ease-in-out",
                  viewMode === "host" ? "translate-x-full" : "translate-x-0"
                )}
              />
              <button
                onClick={() => setViewMode("guest")}
                className={cn(
                  "relative z-10 px-4 py-1.5 text-sm font-bold rounded-full transition-colors duration-300",
                  viewMode === "guest" ? "text-white" : "text-slate-600"
                )}
              >
                참여
              </button>
              <button
                onClick={() => setViewMode("host")}
                className={cn(
                  "relative z-10 px-4 py-1.5 text-sm font-bold rounded-full transition-colors duration-300",
                  viewMode === "host" ? "text-white" : "text-slate-600"
                )}
              >
                관리
              </button>
            </div>
            {notificationSlot}
          </div>
        </div>
      </header>

      {/* Filters - Single Row */}
      <section className="bg-white border-b border-slate-100 px-5 py-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar items-center">
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
              "rounded-full h-8 px-3 text-xs font-bold border transition-all",
              showPast
                ? "border-primary text-primary bg-brand-weak data-[state=on]:bg-brand-weak data-[state=on]:text-primary"
                : "border-slate-200 text-slate-600"
            )}
          >
            지난 경기
          </Toggle>

          {/* Reset Filter Button - Right aligned */}
          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors px-2 shrink-0 ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>초기화</span>
            </button>
          )}
        </div>
      </section>

      {/* Match List */}
      <section className="px-5 py-4 space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin mb-4" />
            <p className="text-slate-500 text-center">
              경기 목록을 불러오는 중...
            </p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-center">
              {viewMode === "guest" ? "참여한 경기가 없습니다." : "주최한 경기가 없습니다."}
            </p>
          </div>
        ) : (
          filteredMatches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              notifications={notificationsByMatchId.get(match.id)}
              onClick={handleCardClick}
              onConfirmPayment={handleConfirmPayment}
            />
          ))
        )}
      </section>

      {/* Guest Application Info Dialog */}
      <ApplicationInfoDialog
        match={selectedMatch}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onViewDetail={(matchId) => {
          const match = allMatches.find((m) => m.id === matchId);
          if (match) navigateToMatchDetail(match);
        }}
        onConfirmPayment={handleConfirmPayment}
        onCancelApplication={handleCancelApplication}
      />
    </div>
  );
}
