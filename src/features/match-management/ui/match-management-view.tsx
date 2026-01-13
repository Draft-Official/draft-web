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

export function MatchManagementView() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<"all" | MatchType>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | MatchStatus>("all");
  const [showPastMatches, setShowPastMatches] = useState<"hide" | "show">(
    "hide"
  );

  // Filter matches
  const filteredMatches = useMemo(() => {
    let filtered = [...MOCK_MANAGED_MATCHES];

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((m) => m.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }

    // Past matches filter
    if (showPastMatches === "hide") {
      filtered = filtered.filter(
        (m) => !PAST_MATCH_STATUSES.includes(m.status)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
      const dateA = new Date(a.date.split(" ")[0].replace(/\./g, "-"));
      const dateB = new Date(b.date.split(" ")[0].replace(/\./g, "-"));
      return dateB.getTime() - dateA.getTime();
    });

    return filtered;
  }, [typeFilter, statusFilter, showPastMatches]);

  const handleCardClick = (matchId: string) => {
    router.push(`/match/${matchId}`);
  };

  const getTypeFilterDisplayLabel = (value: "all" | MatchType) => {
    if (value === "all") return "경기 종류";
    return MATCH_TYPE_FILTER_OPTIONS.find((opt) => opt.value === value)?.label || "";
  };

  const getStatusFilterDisplayLabel = (value: "all" | MatchStatus) => {
    if (value === "all") return "진행 상태";
    return MATCH_STATUS_FILTER_OPTIONS.find((opt) => opt.value === value)?.label || "";
  };

  const getPastFilterDisplayLabel = (value: "hide" | "show") => {
    return value === "show" ? "지난경기: 보이기" : "지난경기: 숨기기";
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Page Header + Filters */}
      <section className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="px-5 py-4 border-b border-slate-200">
          <h1 className="text-xl font-bold text-slate-900">경기 관리</h1>
        </div>
        <div className="px-5 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
          <FilterDropdown
            options={MATCH_TYPE_FILTER_OPTIONS}
            value={typeFilter}
            onChange={setTypeFilter}
            getDisplayLabel={getTypeFilterDisplayLabel}
          />

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
