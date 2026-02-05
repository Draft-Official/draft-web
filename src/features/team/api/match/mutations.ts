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
  openGuestRecruitment,
} from './api';
import type { CreateTeamMatchInput, VoteInput } from '../../model/types';
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
