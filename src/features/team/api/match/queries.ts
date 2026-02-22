/**
 * Team Match React Query Hooks
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createTeamService, teamRowToEntity } from '@/entities/team';
import { matchRowToEntity } from '@/entities/match';
import { gymRowToEntity } from '@/entities/gym';
import { applicationRowToEntity } from '@/entities/application';
import { userRowToEntity } from '@/entities/user';
import { teamMatchKeys } from '../keys';
import {
  toMyPendingTeamVoteMatchDTO,
  toTeamMatchDetailDTO,
  toTeamScheduleMatchItemDTO,
  toTeamVoteDTO,
} from '../../lib';
import type {
  MyPendingTeamVoteMatchDTO,
  TeamMatchDetailDTO,
  TeamScheduleMatchItemDTO,
  TeamVoteDTO,
  VotingSummary,
} from '../../model/types';
import type {
  Application as ApplicationRow,
  Gym as GymRow,
  Match as MatchRow,
  Team as TeamRow,
  User as UserRow,
} from '@/shared/types/database.types';

type MatchWithGymRow = MatchRow & { gyms?: GymRow | null };
type MatchWithGymTeamRow = MatchRow & { gyms?: GymRow | null; teams?: TeamRow | null };
type VoteWithUserRow = ApplicationRow & { users?: UserRow | null };

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
    queryFn: async (): Promise<TeamScheduleMatchItemDTO[]> => {
      if (!teamId) return [];
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const rows = await service.getTeamMatches(teamId, options);
      return rows.map((row) => {
        const typed = row as MatchWithGymRow;
        const match = matchRowToEntity(typed);
        const gym = typed.gyms ? gymRowToEntity(typed.gyms) : null;
        return toTeamScheduleMatchItemDTO(match, { gym });
      });
    },
    enabled: !!teamId,
  });
}

/**
 * 팀 매치 상세 조회
 */
export function useTeamMatch(
  matchIdentifier: string | null | undefined,
  teamId: string | null | undefined
) {
  return useQuery({
    queryKey: [...teamMatchKeys.detail(matchIdentifier || ''), teamId || ''],
    queryFn: async (): Promise<TeamMatchDetailDTO | null> => {
      if (!matchIdentifier || !teamId) return null;
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.getTeamMatch(matchIdentifier, teamId);
      if (!row) return null;
      const typed = row as MatchWithGymTeamRow;
      const match = matchRowToEntity(typed);
      const gym = typed.gyms ? gymRowToEntity(typed.gyms) : null;
      const team = typed.teams ? teamRowToEntity(typed.teams) : null;
      return toTeamMatchDetailDTO(match, { gym, team });
    },
    enabled: !!matchIdentifier && !!teamId,
  });
}

/**
 * 투표 목록 조회
 */
export function useTeamVotes(matchId: string | null | undefined) {
  return useQuery({
    queryKey: teamMatchKeys.votingStatus(matchId || ''),
    queryFn: async (): Promise<TeamVoteDTO[]> => {
      if (!matchId) return [];
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const rows = await service.getTeamVotes(matchId);
      return rows.map((row) => {
        const typed = row as VoteWithUserRow;
        const application = applicationRowToEntity(typed);
        const user = typed.users ? userRowToEntity(typed.users) : null;
        return toTeamVoteDTO(application, user);
      });
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
      const service = createTeamService(supabase);
      return service.getVotingSummary(matchId);
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
    queryFn: async (): Promise<TeamVoteDTO | null> => {
      if (!matchId || !userId) return null;
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.getMyVote(matchId, userId);
      if (!row) return null;
      return toTeamVoteDTO(applicationRowToEntity(row));
    },
    enabled: !!matchId && !!userId,
  });
}

/**
 * 내 미투표/미래 매치 목록 조회
 * - 여러 팀의 매치를 한 번에 조회
 * - guestRecruitmentOnly: true면 게스트 모집 중인 매치만 필터
 */
export function useMyPendingVoteMatches(
  teamIds: string[],
  userId: string | null | undefined,
  options?: { guestRecruitmentOnly?: boolean }
) {
  return useQuery({
    queryKey: [...teamMatchKeys.myPendingVotes(userId || ''), options?.guestRecruitmentOnly ?? false],
    queryFn: async (): Promise<MyPendingTeamVoteMatchDTO[]> => {
      if (!userId || teamIds.length === 0) return [];
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const rows = await service.getMyPendingVoteMatches(teamIds, userId, options);
      return rows.map((item) => {
        const matchWithGym = item.match as MatchWithGymRow;
        const match = matchRowToEntity(matchWithGym);
        const team = teamRowToEntity(item.team);
        const myVote = item.myVote ? applicationRowToEntity(item.myVote) : null;
        const gym = matchWithGym.gyms ? gymRowToEntity(matchWithGym.gyms) : null;

        return toMyPendingTeamVoteMatchDTO(
          match,
          team,
          myVote,
          item.votingSummary,
          gym
        );
      });
    },
    enabled: !!userId && teamIds.length > 0,
  });
}
