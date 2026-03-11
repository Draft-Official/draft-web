/**
 * Team Match React Query Mutations
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { teamMatchKeys } from '../keys';
import { createTeamService } from '@/entities/team';
import { matchRowToEntity } from '@/entities/match';
import { applicationRowToEntity } from '@/entities/application';
import { toTeamVoteDTO } from '../../lib';
import { rollbackSnapshot } from '@/shared/lib/query-cache-rollback';
import {
  beginOptimisticOperation,
  buildOptimisticResourceKey,
  finishOptimisticOperation,
  isLatestOptimisticOperation,
} from '@/shared/lib/optimistic/operation-tracker';
import type { CreateTeamMatchInput, VoteInput } from '@/entities/team/model/types';
import type { TeamVoteStatusValue } from '@/shared/config/team-constants';
import type { PositionValue } from '@/shared/config/match-constants';
import type { Match as MatchEntity } from '@/entities/match';
import type { MyPendingTeamVoteMatchDTO, TeamVoteDTO, VotingSummary } from '../../model/types';
import {
  applyCompactVotingSummaryDelta,
  applyTeamVotingSummaryDelta,
  applyTeamVotingSummaryTransition,
  createOptimisticTeamVote,
  participantCountFromVote,
  patchPendingVoteItem,
  upsertVoteForUser,
} from './optimistic-vote-helpers';

function invalidateTeamMatchDetailAndList(queryClient: QueryClient, teamId: string) {
  queryClient.invalidateQueries({
    queryKey: teamMatchKeys.details(),
  });
  queryClient.invalidateQueries({
    queryKey: teamMatchKeys.byTeam(teamId),
  });
}

function setMemberVoteCache(
  queryClient: QueryClient,
  matchId: string,
  memberId: string,
  vote: TeamVoteDTO
) {
  queryClient.setQueryData(teamMatchKeys.myVote(matchId, memberId), vote);
  queryClient.setQueryData<TeamVoteDTO[]>(
    teamMatchKeys.votingStatus(matchId),
    (old) => upsertVoteForUser(old, vote)
  );
}

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
    onSuccess: (_data, { input }) => {
      invalidateTeamMatchDetailAndList(queryClient, input.teamId);
    },
  });
}

/**
 * 투표 (참석/불참/미정)
 */
export function useVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['team-vote'],
    onMutate: async ({ userId, input }) => {
      const optimisticToken = beginOptimisticOperation(
        buildOptimisticResourceKey('team-vote-match', input.matchId)
      );
      const myVoteKey = teamMatchKeys.myVote(input.matchId, userId);
      const votingStatusKey = teamMatchKeys.votingStatus(input.matchId);
      const votingSummaryKey = [...votingStatusKey, 'summary'] as const;
      const pendingVotesKey = teamMatchKeys.myPendingVotes(userId);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: myVoteKey }),
        queryClient.cancelQueries({ queryKey: votingStatusKey }),
        queryClient.cancelQueries({ queryKey: pendingVotesKey }),
      ]);

      const previousMyVote = queryClient.getQueryData<TeamVoteDTO | null>(myVoteKey);
      const previousVotingStatus = queryClient.getQueryData<TeamVoteDTO[]>(votingStatusKey);
      const previousVotingSummary = queryClient.getQueryData<VotingSummary | null>(votingSummaryKey);
      const previousPendingVotes = queryClient.getQueryData<MyPendingTeamVoteMatchDTO[]>(pendingVotesKey);

      const baseVote =
        previousMyVote ??
        previousVotingStatus?.find((vote) => vote.userId === userId) ??
        null;

      const optimisticVote = createOptimisticTeamVote({
        matchId: input.matchId,
        userId,
        status: input.status,
        description: input.description,
        baseVote,
      });

      const participantCount = participantCountFromVote(baseVote);
      const previousStatus = baseVote?.status ?? 'PENDING';

      queryClient.setQueryData(myVoteKey, optimisticVote);
      queryClient.setQueryData<TeamVoteDTO[]>(votingStatusKey, (old) =>
        upsertVoteForUser(old, optimisticVote)
      );
      queryClient.setQueryData<VotingSummary | null>(votingSummaryKey, (old) =>
        applyTeamVotingSummaryTransition(old, previousStatus, input.status, participantCount) ?? old
      );
      queryClient.setQueryData<MyPendingTeamVoteMatchDTO[]>(pendingVotesKey, (old) =>
        old?.map((item) =>
          item.matchId === input.matchId
            ? patchPendingVoteItem(
                item,
                input.status,
                input.description ?? null,
                participantCount,
                previousStatus
              )
            : item
        )
      );

      return {
        optimisticToken,
        myVoteKey,
        votingStatusKey,
        votingSummaryKey,
        pendingVotesKey,
        previousMyVote,
        previousVotingStatus,
        previousVotingSummary,
        previousPendingVotes,
      };
    },
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
    onError: (_error, _variables, context) => {
      if (!context) return;
      if (!isLatestOptimisticOperation(context.optimisticToken)) return;

      rollbackSnapshot(queryClient, context.myVoteKey, context.previousMyVote);
      rollbackSnapshot(queryClient, context.votingStatusKey, context.previousVotingStatus);
      rollbackSnapshot(queryClient, context.votingSummaryKey, context.previousVotingSummary);
      rollbackSnapshot(queryClient, context.pendingVotesKey, context.previousPendingVotes);
    },
    onSuccess: (data, { userId, input }) => {
      // 내 투표 캐시 갱신
      queryClient.setQueryData(
        teamMatchKeys.myVote(input.matchId, userId),
        data
      );
      queryClient.setQueryData<TeamVoteDTO[]>(
        teamMatchKeys.votingStatus(input.matchId),
        (old) => upsertVoteForUser(old, data)
      );
      queryClient.setQueryData<MyPendingTeamVoteMatchDTO[]>(
        teamMatchKeys.myPendingVotes(userId),
        (old) =>
          old?.map((item) =>
            item.matchId === input.matchId
              ? { ...item, myVote: data.status, myVoteReason: data.description }
              : item
          )
      );
    },
    onSettled: (_data, _error, { userId, input }, context) => {
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.myVote(input.matchId, userId),
      });
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.votingStatus(input.matchId),
      });
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.myPendingVotes(userId),
      });
      finishOptimisticOperation(context?.optimisticToken);
    },
  });
}

/**
 * 팀 투표 참여자에 게스트 추가
 */
export function useAddTeamVoteGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['team-vote'],
    onMutate: async ({ matchId, ownerUserId, guestName, guestPosition }) => {
      const optimisticToken = beginOptimisticOperation(
        buildOptimisticResourceKey('team-vote-match', matchId)
      );
      const myVoteKey = teamMatchKeys.myVote(matchId, ownerUserId);
      const votingStatusKey = teamMatchKeys.votingStatus(matchId);
      const votingSummaryKey = [...votingStatusKey, 'summary'] as const;
      const pendingVotesKey = teamMatchKeys.myPendingVotes(ownerUserId);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: myVoteKey }),
        queryClient.cancelQueries({ queryKey: votingStatusKey }),
        queryClient.cancelQueries({ queryKey: pendingVotesKey }),
      ]);

      const previousMyVote = queryClient.getQueryData<TeamVoteDTO | null>(myVoteKey);
      const previousVotingStatus = queryClient.getQueryData<TeamVoteDTO[]>(votingStatusKey);
      const previousVotingSummary = queryClient.getQueryData<VotingSummary | null>(votingSummaryKey);
      const previousPendingVotes = queryClient.getQueryData<MyPendingTeamVoteMatchDTO[]>(pendingVotesKey);

      const baseVote =
        previousMyVote ??
        previousVotingStatus?.find((vote) => vote.userId === ownerUserId) ??
        createOptimisticTeamVote({
          matchId,
          userId: ownerUserId,
          status: 'PENDING',
        });

      const optimisticVote: TeamVoteDTO = {
        ...baseVote,
        guestParticipants: [
          ...baseVote.guestParticipants,
          { name: guestName, position: guestPosition },
        ],
        updatedAt: new Date().toISOString(),
      };

      queryClient.setQueryData(myVoteKey, optimisticVote);
      queryClient.setQueryData<TeamVoteDTO[]>(votingStatusKey, (old) =>
        upsertVoteForUser(old, optimisticVote)
      );
      queryClient.setQueryData<VotingSummary | null>(votingSummaryKey, (old) =>
        applyTeamVotingSummaryDelta(old, optimisticVote.status, 1) ?? old
      );
      queryClient.setQueryData<MyPendingTeamVoteMatchDTO[]>(pendingVotesKey, (old) =>
        old?.map((item) =>
          item.matchId === matchId
            ? {
                ...item,
                votingSummary:
                  applyCompactVotingSummaryDelta(item.votingSummary, item.myVote, 1) ??
                  item.votingSummary,
              }
            : item
        )
      );

      return {
        optimisticToken,
        myVoteKey,
        votingStatusKey,
        votingSummaryKey,
        pendingVotesKey,
        previousMyVote,
        previousVotingStatus,
        previousVotingSummary,
        previousPendingVotes,
      };
    },
    mutationFn: async ({
      matchId,
      ownerUserId,
      guestName,
      guestPosition,
    }: {
      matchId: string;
      ownerUserId: string;
      guestName: string;
      guestPosition: PositionValue;
    }): Promise<TeamVoteDTO> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.addGuestToTeamVote(matchId, ownerUserId, {
        name: guestName,
        position: guestPosition,
      });
      return toTeamVoteDTO(applicationRowToEntity(row));
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      if (!isLatestOptimisticOperation(context.optimisticToken)) return;

      rollbackSnapshot(queryClient, context.myVoteKey, context.previousMyVote);
      rollbackSnapshot(queryClient, context.votingStatusKey, context.previousVotingStatus);
      rollbackSnapshot(queryClient, context.votingSummaryKey, context.previousVotingSummary);
      rollbackSnapshot(queryClient, context.pendingVotesKey, context.previousPendingVotes);
    },
    onSuccess: (data, { matchId, ownerUserId }) => {
      setMemberVoteCache(queryClient, matchId, ownerUserId, data);
    },
    onSettled: (_data, _error, { matchId, ownerUserId }, context) => {
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.votingStatus(matchId),
      });
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.myVote(matchId, ownerUserId),
      });
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.myPendingVotes(ownerUserId),
      });
      finishOptimisticOperation(context?.optimisticToken);
    },
  });
}

/**
 * 팀 투표 참여자에서 게스트 제외 (관리자)
 */
export function useRemoveTeamVoteGuest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['team-vote'],
    onMutate: async ({ matchId, ownerUserId, guestIndex }) => {
      const optimisticToken = beginOptimisticOperation(
        buildOptimisticResourceKey('team-vote-match', matchId)
      );
      const myVoteKey = teamMatchKeys.myVote(matchId, ownerUserId);
      const votingStatusKey = teamMatchKeys.votingStatus(matchId);
      const votingSummaryKey = [...votingStatusKey, 'summary'] as const;
      const pendingVotesKey = teamMatchKeys.myPendingVotes(ownerUserId);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: myVoteKey }),
        queryClient.cancelQueries({ queryKey: votingStatusKey }),
        queryClient.cancelQueries({ queryKey: pendingVotesKey }),
      ]);

      const previousMyVote = queryClient.getQueryData<TeamVoteDTO | null>(myVoteKey);
      const previousVotingStatus = queryClient.getQueryData<TeamVoteDTO[]>(votingStatusKey);
      const previousVotingSummary = queryClient.getQueryData<VotingSummary | null>(votingSummaryKey);
      const previousPendingVotes = queryClient.getQueryData<MyPendingTeamVoteMatchDTO[]>(pendingVotesKey);

      const baseVote =
        previousMyVote ?? previousVotingStatus?.find((vote) => vote.userId === ownerUserId);
      const hasTargetGuest =
        !!baseVote &&
        guestIndex >= 0 &&
        guestIndex < baseVote.guestParticipants.length;

      if (hasTargetGuest && baseVote) {
        const optimisticVote: TeamVoteDTO = {
          ...baseVote,
          guestParticipants: baseVote.guestParticipants.filter((_, index) => index !== guestIndex),
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData(myVoteKey, optimisticVote);
        queryClient.setQueryData<TeamVoteDTO[]>(votingStatusKey, (old) =>
          upsertVoteForUser(old, optimisticVote)
        );
        queryClient.setQueryData<VotingSummary | null>(votingSummaryKey, (old) =>
          applyTeamVotingSummaryDelta(old, optimisticVote.status, -1) ?? old
        );
        queryClient.setQueryData<MyPendingTeamVoteMatchDTO[]>(pendingVotesKey, (old) =>
          old?.map((item) =>
            item.matchId === matchId
              ? {
                  ...item,
                  votingSummary:
                    applyCompactVotingSummaryDelta(item.votingSummary, item.myVote, -1) ??
                    item.votingSummary,
                }
              : item
          )
        );
      }

      return {
        optimisticToken,
        myVoteKey,
        votingStatusKey,
        votingSummaryKey,
        pendingVotesKey,
        previousMyVote,
        previousVotingStatus,
        previousVotingSummary,
        previousPendingVotes,
      };
    },
    mutationFn: async ({
      matchId,
      ownerUserId,
      guestIndex,
    }: {
      matchId: string;
      ownerUserId: string;
      guestIndex: number;
    }): Promise<TeamVoteDTO> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.removeGuestFromTeamVote(matchId, ownerUserId, guestIndex);
      return toTeamVoteDTO(applicationRowToEntity(row));
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      if (!isLatestOptimisticOperation(context.optimisticToken)) return;

      rollbackSnapshot(queryClient, context.myVoteKey, context.previousMyVote);
      rollbackSnapshot(queryClient, context.votingStatusKey, context.previousVotingStatus);
      rollbackSnapshot(queryClient, context.votingSummaryKey, context.previousVotingSummary);
      rollbackSnapshot(queryClient, context.pendingVotesKey, context.previousPendingVotes);
    },
    onSuccess: (data, { matchId, ownerUserId }) => {
      setMemberVoteCache(queryClient, matchId, ownerUserId, data);
    },
    onSettled: (_data, _error, { matchId, ownerUserId }, context) => {
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.votingStatus(matchId),
      });
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.myVote(matchId, ownerUserId),
      });
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.myPendingVotes(ownerUserId),
      });
      finishOptimisticOperation(context?.optimisticToken);
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
    }: {
      matchId: string;
      teamId: string;
    }): Promise<MatchEntity> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.closeVoting(matchId);
      return matchRowToEntity(row);
    },
    onSuccess: (_, { teamId }) => {
      invalidateTeamMatchDetailAndList(queryClient, teamId);
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
    onSuccess: (_, { teamId }) => {
      invalidateTeamMatchDetailAndList(queryClient, teamId);
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
    }: {
      matchId: string;
      teamId: string;
    }): Promise<MatchEntity> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.reopenVoting(matchId);
      return matchRowToEntity(row);
    },
    onSuccess: (_, { teamId }) => {
      invalidateTeamMatchDetailAndList(queryClient, teamId);
    },
  });
}

/**
 * 관리자가 팀원 투표 변경
 */
export function useUpdateMemberVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['team-vote'],
    onMutate: async ({ matchId, memberId, status, description }) => {
      const optimisticToken = beginOptimisticOperation(
        buildOptimisticResourceKey('team-vote-match', matchId)
      );
      const memberVoteKey = teamMatchKeys.myVote(matchId, memberId);
      const votingStatusKey = teamMatchKeys.votingStatus(matchId);
      const votingSummaryKey = [...votingStatusKey, 'summary'] as const;

      await Promise.all([
        queryClient.cancelQueries({ queryKey: memberVoteKey }),
        queryClient.cancelQueries({ queryKey: votingStatusKey }),
      ]);

      const previousMemberVote = queryClient.getQueryData<TeamVoteDTO | null>(memberVoteKey);
      const previousVotingStatus = queryClient.getQueryData<TeamVoteDTO[]>(votingStatusKey);
      const previousVotingSummary = queryClient.getQueryData<VotingSummary | null>(votingSummaryKey);

      const baseVote =
        previousMemberVote ??
        previousVotingStatus?.find((vote) => vote.userId === memberId) ??
        createOptimisticTeamVote({
          matchId,
          userId: memberId,
          status: 'PENDING',
        });

      const optimisticVote = createOptimisticTeamVote({
        matchId,
        userId: memberId,
        status,
        description,
        baseVote,
      });

      const participantCount = participantCountFromVote(baseVote);
      const previousStatus = baseVote.status;

      queryClient.setQueryData(memberVoteKey, optimisticVote);
      queryClient.setQueryData<TeamVoteDTO[]>(votingStatusKey, (old) =>
        upsertVoteForUser(old, optimisticVote)
      );
      queryClient.setQueryData<VotingSummary | null>(votingSummaryKey, (old) =>
        applyTeamVotingSummaryTransition(old, previousStatus, status, participantCount) ?? old
      );

      return {
        optimisticToken,
        memberVoteKey,
        votingStatusKey,
        votingSummaryKey,
        previousMemberVote,
        previousVotingStatus,
        previousVotingSummary,
      };
    },
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
    onError: (_error, _variables, context) => {
      if (!context) return;
      if (!isLatestOptimisticOperation(context.optimisticToken)) return;

      rollbackSnapshot(queryClient, context.memberVoteKey, context.previousMemberVote);
      rollbackSnapshot(queryClient, context.votingStatusKey, context.previousVotingStatus);
      rollbackSnapshot(queryClient, context.votingSummaryKey, context.previousVotingSummary);
    },
    onSuccess: (data, { matchId, memberId }) => {
      setMemberVoteCache(queryClient, matchId, memberId, data);
    },
    onSettled: (_data, _error, { matchId, memberId }, context) => {
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.myVote(matchId, memberId),
      });
      queryClient.invalidateQueries({
        queryKey: teamMatchKeys.votingStatus(matchId),
      });
      finishOptimisticOperation(context?.optimisticToken);
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
    onSuccess: (_, { teamId }) => {
      invalidateTeamMatchDetailAndList(queryClient, teamId);
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
    }: {
      matchId: string;
      teamId: string;
    }): Promise<MatchEntity> => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      const row = await service.cancelTeamMatch(matchId);
      return matchRowToEntity(row);
    },
    onSuccess: (_, { teamId }) => {
      invalidateTeamMatchDetailAndList(queryClient, teamId);
    },
  });
}
