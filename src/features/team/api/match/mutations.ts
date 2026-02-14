/**
 * Team Match React Query Mutations
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { teamMatchKeys } from '../keys';
import { createTeamService } from '@/entities/team';
import { matchRowToEntity } from '@/entities/match';
import { applicationRowToEntity } from '@/entities/application';
import { toTeamVoteDTO } from '../../lib';
import type { CreateTeamMatchInput, VoteInput } from '@/entities/team/model/types';
import type { TeamVoteStatusValue } from '@/shared/config/team-constants';
import type { Match as MatchEntity } from '@/entities/match';
import type { TeamVoteDTO } from '../../model/types';

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
    }): Promise<MatchEntity> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.createTeamMatch(hostId, input);
      return matchRowToEntity(row);
    },
    onSuccess: (data, { input }) => {
      // 팀 매치 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.byTeam(input.teamId),
      });
      // 생성된 매치 상세 갱신 (DTO 쿼리와 정합성 유지)
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.detail(data.id),
      });
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
    }): Promise<TeamVoteDTO> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.upsertTeamVote(userId, input);
      return toTeamVoteDTO(applicationRowToEntity(row));
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
    }): Promise<MatchEntity> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.closeVoting(matchId);
      return matchRowToEntity(row);
    },
    onSuccess: (_, { matchId, teamId }) => {
      // DTO 상세는 재조회로 동기화
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.detail(matchId),
      });
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
    }): Promise<MatchEntity> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.openGuestRecruitment(matchId, recruitmentSetup);
      return matchRowToEntity(row);
    },
    onSuccess: (_, { matchId, teamId }) => {
      // DTO 상세는 재조회로 동기화
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.detail(matchId),
      });
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
    }): Promise<MatchEntity> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.reopenVoting(matchId);
      return matchRowToEntity(row);
    },
    onSuccess: (_, { matchId, teamId }) => {
      // DTO 상세는 재조회로 동기화
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.detail(matchId),
      });
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
    }): Promise<TeamVoteDTO> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.updateMemberVote(matchId, memberId, status, description);
      return toTeamVoteDTO(applicationRowToEntity(row));
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
    }): Promise<MatchEntity> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.updateTeamMatch(matchId, input);
      return matchRowToEntity(row);
    },
    onSuccess: (_, { matchId, teamId }) => {
      // DTO 상세는 재조회로 동기화
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.detail(matchId),
      });
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
    }): Promise<MatchEntity> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.cancelTeamMatch(matchId);
      return matchRowToEntity(row);
    },
    onSuccess: (_, { matchId, teamId }) => {
      // DTO 상세는 재조회로 동기화
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.detail(matchId),
      });
      // 팀 매치 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.byTeam(teamId),
      });
    },
  });
}
