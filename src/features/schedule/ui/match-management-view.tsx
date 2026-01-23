"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar, X, Loader2 } from "lucide-react";
import { FilterDropdown } from "./components/filter-dropdown";
import { MatchCard } from "./components/match-card";
import { useHostedMatches, useParticipatingMatches } from "../api";
import type { MatchType, ManagedMatch } from "../model/types";
import {
  MATCH_TYPE_FILTER_OPTIONS,
  MATCH_STATUS_FILTER_OPTIONS,
  PAST_MATCH_FILTER_OPTIONS,
  PAST_MATCH_STATUSES,
} from "../config/constants";
import { cn } from "@/shared/lib/utils";

type ViewMode = "guest" | "host";
type TypeFilterValue = Exclude<MatchType, "host">;
type StatusFilterValue = "waiting" | "confirmed" | "ongoing" | "ended";

export function MatchManagementView() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("guest");
  const [typeFilter, setTypeFilter] = useState<TypeFilterValue[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue[]>([]);
  const [showPastMatches, setShowPastMatches] = useState<"hide" | "show">("hide");

  // Fetch data from Supabase
  const { data: hostedMatches = [], isLoading: isLoadingHosted } = useHostedMatches();
  const { data: participatingMatches = [], isLoading: isLoadingParticipating } = useParticipatingMatches();

  const isLoading = viewMode === "host" ? isLoadingHosted : isLoadingParticipating;
  const allMatches: ManagedMatch[] = viewMode === "host" ? hostedMatches : participatingMatches;

  // Filter matches
  const filteredMatches = useMemo(() => {
    let filtered = [...allMatches];

    // Type filter (only applicable in guest mode) - Multi-select
    if (viewMode === "guest" && typeFilter.length > 0) {
      filtered = filtered.filter((m) => typeFilter.includes(m.type as TypeFilterValue));
    }

    // Status filter - Multi-select
    if (statusFilter.length > 0) {
      filtered = filtered.filter((m) => {
        // 대기 중: waiting, payment_waiting, voting, pending
        if (statusFilter.includes("waiting") && (m.status === "waiting" || m.status === "payment_waiting" || m.status === "voting" || m.status === "pending")) {
          return true;
        }
        // 경기 확정: confirmed
        if (statusFilter.includes("confirmed") && m.status === "confirmed") {
          return true;
        }
        // 경기 중: ongoing
        if (statusFilter.includes("ongoing") && m.status === "ongoing") {
          return true;
        }
        // 종료/취소: ended, cancelled, rejected
        if (statusFilter.includes("ended") && (m.status === "ended" || m.status === "cancelled" || m.status === "rejected")) {
          return true;
        }
        return false;
      });
    }

    // Past matches filter
    if (showPastMatches === "hide") {
      filtered = filtered.filter((m) => !PAST_MATCH_STATUSES.includes(m.status));
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date.split(" ")[0].replace(/\./g, "-"));
      const dateB = new Date(b.date.split(" ")[0].replace(/\./g, "-"));
      return dateB.getTime() - dateA.getTime();
    });

    return filtered;
  }, [allMatches, viewMode, typeFilter, statusFilter, showPastMatches]);

  const handleCardClick = (matchId: string) => {
    // Find the match to determine its type
    const match = allMatches.find((m) => m.id === matchId);
    if (!match) return;

    // Navigate based on match type and view mode
    if (match.type === "tournament") {
      // 대회는 별도 라우트
      if (viewMode === "host") {
        router.push(`/tournaments/${matchId}/manage`);
      } else {
        router.push(`/tournaments/${matchId}`);
      }
    } else {
      // host, team, guest 모두 matches로 통합
      if (viewMode === "host" || match.type === "host") {
        router.push(`/matches/${matchId}/manage`);
      } else {
        // 참여 탭에서 들어가는 경우 from=schedule 파라미터 추가
        router.push(`/matches/${matchId}?from=schedule`);
      }
    }
  };

  const getTypeFilterDisplayLabel = (value: TypeFilterValue[]) => {
    if (value.length === 0) return "종류";
    if (value.length === 1) {
      return MATCH_TYPE_FILTER_OPTIONS.find((opt) => opt.value === value[0])?.label || "";
    }
    return `${MATCH_TYPE_FILTER_OPTIONS.find((opt) => opt.value === value[0])?.label} 외 ${value.length - 1}`;
  };

  const getStatusFilterDisplayLabel = (value: StatusFilterValue[]) => {
    if (value.length === 0) return "진행상태";
    if (value.length === 1) {
      return MATCH_STATUS_FILTER_OPTIONS.find((opt) => opt.value === value[0])?.label || "";
    }
    return `${MATCH_STATUS_FILTER_OPTIONS.find((opt) => opt.value === value[0])?.label} 외 ${value.length - 1}`;
  };

  const getPastFilterDisplayLabel = (value: "hide" | "show") => {
    return value === "show" ? "지난경기: 보이기" : "지난경기: 숨기기";
  };

  // Check if any filter is active
  const isFilterActive = typeFilter.length > 0 || statusFilter.length > 0 || showPastMatches === "show";

  // Reset all filters
  const handleResetFilters = () => {
    setTypeFilter([]);
    setStatusFilter([]);
    setShowPastMatches("hide");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-5 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">경기 관리</h1>

          {/* Guest/Host Toggle - Slide Animation */}
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
        </div>
      </header>

      {/* Filters - Single Row */}
      <section className="bg-white border-b border-slate-100 px-5 py-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar items-center">
          {/* Type Filter - Only show in guest mode (Multi-select) */}
          {viewMode === "guest" && (
            <FilterDropdown
              options={MATCH_TYPE_FILTER_OPTIONS}
              value={typeFilter}
              onChange={setTypeFilter}
              getDisplayLabel={getTypeFilterDisplayLabel}
              multiSelect
            />
          )}

          {/* Status Filter (Multi-select) */}
          <FilterDropdown
            options={MATCH_STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            getDisplayLabel={getStatusFilterDisplayLabel}
            multiSelect
          />

          {/* Past Matches Filter (Single-select) */}
          <FilterDropdown
            options={PAST_MATCH_FILTER_OPTIONS}
            value={showPastMatches}
            onChange={setShowPastMatches}
            getDisplayLabel={getPastFilterDisplayLabel}
          />

          {/* Reset Filter Button */}
          {isFilterActive && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors px-2 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
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
            <MatchCard key={match.id} match={match} onClick={handleCardClick} />
          ))
        )}
      </section>
    </div>
  );
}
