/**
 * Team Match React Query Hooks
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { teamMatchKeys } from '../keys';
import {
  getTeamMatches,
  getTeamMatch,
  getTeamVotes,
  getVotingSummary,
  getMyVote,
} from './api';
import type { VotingSummary } from '../../model/types';
import type { Match, Application } from '@/shared/types/database.types';

/**
 * 팀 매치 목록 조회
 */
export function useTeamMatches(
  teamId: string | null | undefined,
  options?: { upcoming?: boolean; limit?: number }
) {
  return useQuery({
    queryKey: options?.upcoming
      ? teamMatchKeys.upcoming(teamId || '')
      : teamMatchKeys.byTeam(teamId || ''),
    queryFn: async (): Promise<Match[]> => {
      if (!teamId) return [];
      const supabase = getSupabaseBrowserClient();
      return getTeamMatches(supabase, teamId, options);
    },
    enabled: !!teamId,
  });
}

/**
 * 팀 매치 상세 조회
 */
export function useTeamMatch(matchId: string | null | undefined) {
  return useQuery({
    queryKey: teamMatchKeys.detail(matchId || ''),
    queryFn: async (): Promise<Match | null> => {
      if (!matchId) return null;
      const supabase = getSupabaseBrowserClient();
      return getTeamMatch(supabase, matchId);
    },
    enabled: !!matchId,
  });
}

/**
 * 투표 목록 조회
 */
export function useTeamVotes(matchId: string | null | undefined) {
  return useQuery({
    queryKey: teamMatchKeys.votingStatus(matchId || ''),
    queryFn: async (): Promise<Application[]> => {
      if (!matchId) return [];
      const supabase = getSupabaseBrowserClient();
      return getTeamVotes(supabase, matchId);
    },
    enabled: !!matchId,
  });
}

/**
 * 투표 현황 요약 조회
 */
export function useVotingSummary(
  matchId: string | null | undefined,
  teamId: string | null | undefined
) {
  return useQuery({
    queryKey: [...teamMatchKeys.votingStatus(matchId || ''), 'summary'],
    queryFn: async (): Promise<VotingSummary | null> => {
      if (!matchId || !teamId) return null;
      const supabase = getSupabaseBrowserClient();
      return getVotingSummary(supabase, matchId, teamId);
    },
    enabled: !!matchId && !!teamId,
  });
}

/**
 * 현재 사용자의 투표 조회
 */
export function useMyVote(
  matchId: string | null | undefined,
  userId: string | null | undefined
) {
  return useQuery({
    queryKey: teamMatchKeys.myVote(matchId || '', userId || ''),
    queryFn: async (): Promise<Application | null> => {
      if (!matchId || !userId) return null;
      const supabase = getSupabaseBrowserClient();
      return getMyVote(supabase, matchId, userId);
    },
    enabled: !!matchId && !!userId,
  });
}
