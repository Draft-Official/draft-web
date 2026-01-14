"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import { FilterDropdown } from "./components/FilterDropdown";
import { MatchCard } from "./components/MatchCard";
import { MOCK_MANAGED_MATCHES } from "../model/mock-data";
import type { MatchType, MatchStatus } from "../model/types";
import {
  MATCH_TYPE_FILTER_OPTIONS,
  MATCH_STATUS_FILTER_OPTIONS,
  PAST_MATCH_FILTER_OPTIONS,
  PAST_MATCH_STATUSES,
} from "../config/constants";
import { cn } from "@/shared/lib/utils";

type ViewMode = "guest" | "host";
type TypeFilterValue = "all" | Exclude<MatchType, "host">;
type StatusFilterValue = "all" | "scheduled" | "ongoing" | "ended" | "cancelled";

export function MatchManagementView() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("guest");
  const [typeFilter, setTypeFilter] = useState<TypeFilterValue>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [showPastMatches, setShowPastMatches] = useState<"hide" | "show">("hide");

  // Filter matches
  const filteredMatches = useMemo(() => {
    let filtered = [...MOCK_MANAGED_MATCHES];

    // View mode filter
    if (viewMode === "guest") {
      // Guest mode shows: guest, team, tournament (not host)
      filtered = filtered.filter(
        (m) => m.type === "guest" || m.type === "team" || m.type === "tournament"
      );
    } else {
      // Host mode shows only host matches
      filtered = filtered.filter((m) => m.type === "host");
    }

    // Type filter (only applicable in guest mode)
    if (viewMode === "guest" && typeFilter !== "all") {
      filtered = filtered.filter((m) => m.type === typeFilter);
    }

    // Status filter with pending/rejected mapping
    if (statusFilter !== "all") {
      if (statusFilter === "scheduled") {
        // Include both 'scheduled' and 'pending'
        filtered = filtered.filter(
          (m) => m.status === "scheduled" || m.status === "pending" || m.status === "confirmed"
        );
      } else if (statusFilter === "cancelled") {
        // Include both 'cancelled' and 'rejected'
        filtered = filtered.filter(
          (m) => m.status === "cancelled" || m.status === "rejected"
        );
      } else {
        filtered = filtered.filter((m) => m.status === statusFilter);
      }
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
  }, [viewMode, typeFilter, statusFilter, showPastMatches]);

  const handleCardClick = (matchId: string) => {
    router.push(`/match/${matchId}`);
  };

  const getTypeFilterDisplayLabel = (value: TypeFilterValue) => {
    if (value === "all") return "종류";
    return MATCH_TYPE_FILTER_OPTIONS.find((opt) => opt.value === value)?.label || "";
  };

  const getStatusFilterDisplayLabel = (value: StatusFilterValue) => {
    if (value === "all") return "진행상태";
    return MATCH_STATUS_FILTER_OPTIONS.find((opt) => opt.value === value)?.label || "";
  };

  const getPastFilterDisplayLabel = (value: "hide" | "show") => {
    return value === "show" ? "지난경기: 보이기" : "지난경기: 숨기기";
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-5 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">경기 관리</h1>

          {/* Guest/Host Toggle - Rounded Pill Style */}
          <div className="flex items-center bg-slate-100 rounded-full p-1 gap-1">
            <button
              onClick={() => setViewMode("guest")}
              className={cn(
                "px-4 py-1.5 text-sm font-bold rounded-full transition-all",
                viewMode === "guest"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600"
              )}
            >
              게스트
            </button>
            <button
              onClick={() => setViewMode("host")}
              className={cn(
                "px-4 py-1.5 text-sm font-bold rounded-full transition-all",
                viewMode === "host"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600"
              )}
            >
              호스트
            </button>
          </div>
        </div>
      </header>

      {/* Filters - Single Row */}
      <section className="bg-white border-b border-slate-100 px-5 py-3">
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {/* Type Filter - Only show in guest mode */}
          {viewMode === "guest" && (
            <FilterDropdown
              options={MATCH_TYPE_FILTER_OPTIONS}
              value={typeFilter}
              onChange={setTypeFilter}
              getDisplayLabel={getTypeFilterDisplayLabel}
            />
          )}

          <FilterDropdown
            options={MATCH_STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            getDisplayLabel={getStatusFilterDisplayLabel}
          />

          <FilterDropdown
            options={PAST_MATCH_FILTER_OPTIONS}
            value={showPastMatches}
            onChange={setShowPastMatches}
            getDisplayLabel={getPastFilterDisplayLabel}
          />
        </div>
      </section>

      {/* Match List */}
      <section className="px-5 py-4 space-y-3">
        {filteredMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500 text-center">
              참여한 경기가 없습니다.
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
