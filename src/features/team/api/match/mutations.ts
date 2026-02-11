/**
 * Team Match React Query Mutations
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { teamMatchKeys } from '../keys';
import {
  createTeamMatch,
  upsertTeamVote,
  closeVoting,
  reopenVoting,
  updateMemberVote,
  updateTeamMatch,
  cancelTeamMatch,
  openGuestRecruitment,
} from './api';
import type { CreateTeamMatchInput, VoteInput } from '../../model/types';
import type { TeamVoteStatusValue } from '@/shared/config/team-constants';
import type { Match, Application } from '@/shared/types/database.types';

/**
 * 팀 매치 생성
 */
export function useCreateTeamMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      hostId,
      input,
    }: {
      hostId: string;
      input: CreateTeamMatchInput;
    }): Promise<Match> => {
      const supabase = getSupabaseBrowserClient();
      return createTeamMatch(supabase, hostId, input);
    },
    onSuccess: (data, { input }) => {
      // 팀 매치 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.byTeam(input.teamId),
      });
      // 생성된 매치 캐시에 추가
      queryClient.setQueryData(teamMatchKeys.detail(data.id), data);
    },
  });
}

/**
 * 투표 (참석/불참/미정)
 */
export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      input,
    }: {
      userId: string;
      input: VoteInput;
    }): Promise<Application> => {
      const supabase = getSupabaseBrowserClient();
      return upsertTeamVote(supabase, userId, input);
    },
    onSuccess: (data, { userId, input }) => {
      // 내 투표 캐시 갱신
      queryClient.setQueryData(
        teamMatchKeys.myVote(input.matchId, userId),
        data
      );
      // 투표 현황 갱신
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.votingStatus(input.matchId),
      });
      // 미투표 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.myPendingVotes(userId),
      });
    },
  });
}

/**
 * 투표 마감
 */
export function useCloseVoting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      teamId,
    }: {
      matchId: string;
      teamId: string;
    }): Promise<Match> => {
      const supabase = getSupabaseBrowserClient();
      return closeVoting(supabase, matchId);
    },
    onSuccess: (data, { matchId, teamId }) => {
      // 매치 상세 갱신
      queryClient.setQueryData(teamMatchKeys.detail(matchId), data);
      // 팀 매치 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.byTeam(teamId),
      });
    },
  });
}

/**
 * 게스트 모집 전환
 */
export function useOpenGuestRecruitment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      teamId,
      recruitmentSetup,
    }: {
      matchId: string;
      teamId: string;
      recruitmentSetup: {
        type: 'ANY' | 'POSITION';
        maxCount?: number;
        positions?: Record<string, { max: number; current: number }>;
      };
    }): Promise<Match> => {
      const supabase = getSupabaseBrowserClient();
      return openGuestRecruitment(supabase, matchId, recruitmentSetup);
    },
    onSuccess: (data, { matchId, teamId }) => {
      // 매치 상세 갱신
      queryClient.setQueryData(teamMatchKeys.detail(matchId), data);
      // 팀 매치 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.byTeam(teamId),
      });
    },
  });
}

/**
 * 투표 재오픈 (Leader only)
 */
export function useReopenVoting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      teamId,
    }: {
      matchId: string;
      teamId: string;
    }): Promise<Match> => {
      const supabase = getSupabaseBrowserClient();
      return reopenVoting(supabase, matchId);
    },
    onSuccess: (data, { matchId, teamId }) => {
      // 매치 상세 갱신
      queryClient.setQueryData(teamMatchKeys.detail(matchId), data);
      // 팀 매치 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.byTeam(teamId),
      });
    },
  });
}

/**
 * 관리자가 팀원 투표 변경
 */
export function useUpdateMemberVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      memberId,
      status,
      description,
    }: {
      matchId: string;
      memberId: string;
      status: TeamVoteStatusValue;
      description?: string;
    }): Promise<Application> => {
      const supabase = getSupabaseBrowserClient();
      return updateMemberVote(supabase, matchId, memberId, status, description);
    },
    onSuccess: (data, { matchId, memberId }) => {
      // 해당 멤버의 투표 캐시 갱신
      queryClient.setQueryData(
        teamMatchKeys.myVote(matchId, memberId),
        data
      );
      // 투표 현황 갱신
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.votingStatus(matchId),
      });
    },
  });
}

/**
 * 팀 매치 수정
 */
export function useUpdateTeamMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      teamId,
      input,
    }: {
      matchId: string;
      teamId: string;
      input: {
        startTime?: string;
        endTime?: string;
        gymId?: string;
        operationInfo?: Record<string, unknown>;
      };
    }): Promise<Match> => {
      const supabase = getSupabaseBrowserClient();
      return updateTeamMatch(supabase, matchId, input);
    },
    onSuccess: (data, { matchId, teamId }) => {
      // 매치 상세 갱신
      queryClient.setQueryData(teamMatchKeys.detail(matchId), data);
      // 팀 매치 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.byTeam(teamId),
      });
    },
  });
}

/**
 * 팀 매치 취소
 */
export function useCancelTeamMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      teamId,
    }: {
      matchId: string;
      teamId: string;
    }): Promise<Match> => {
      const supabase = getSupabaseBrowserClient();
      return cancelTeamMatch(supabase, matchId);
    },
    onSuccess: (data, { matchId, teamId }) => {
      // 매치 상세 갱신
      queryClient.setQueryData(teamMatchKeys.detail(matchId), data);
      // 팀 매치 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.byTeam(teamId),
      });
    },
  });
}
