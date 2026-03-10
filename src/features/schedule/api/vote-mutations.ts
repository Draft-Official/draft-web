'use client';

import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createTeamService } from '@/entities/team';
import type { TeamVoteStatusValue } from '@/shared/config/application-constants';
import { matchManagementKeys } from './keys';
import { applyScheduleVoteOptimisticUpdate } from './optimistic-vote-helpers';
import { rollbackSnapshots } from '@/shared/lib/query-cache-rollback';
import {
  beginOptimisticOperation,
  buildOptimisticResourceKey,
  finishOptimisticOperation,
  isLatestOptimisticOperation,
} from '@/shared/lib/optimistic/operation-tracker';
import type { ScheduleMatchListItemDTO } from '../model/types';

interface VoteParams {
  userId: string;
  matchId: string;
  status: TeamVoteStatusValue;
  description?: string;
}

type SchedulePage = {
  matches: ScheduleMatchListItemDTO[];
  nextCursor: number | undefined;
};

type ScheduleInfiniteData = InfiniteData<SchedulePage>;

interface ScheduleVoteMutationContext {
  optimisticToken: ReturnType<typeof beginOptimisticOperation>;
  previousParticipating: Array<[readonly unknown[], ScheduleInfiniteData | undefined]>;
  previousHosted: Array<[readonly unknown[], ScheduleInfiniteData | undefined]>;
}

/**
 * 경기 관리에서 팀 투표 (참석/불참/미정)
 */
export function useScheduleVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['schedule-vote'],
    onMutate: async ({ userId, matchId, status, description }): Promise<ScheduleVoteMutationContext> => {
      const optimisticToken = beginOptimisticOperation(
        buildOptimisticResourceKey('schedule-vote-user', userId)
      );
      const participatingKey = matchManagementKeys.participatingMatches(userId);
      const hostedKey = matchManagementKeys.hostedMatches(userId);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: participatingKey }),
        queryClient.cancelQueries({ queryKey: hostedKey }),
      ]);

      const previousParticipating = queryClient.getQueriesData<ScheduleInfiniteData>({
        queryKey: participatingKey,
      });
      const previousHosted = queryClient.getQueriesData<ScheduleInfiniteData>({
        queryKey: hostedKey,
      });

      queryClient.setQueriesData<ScheduleInfiniteData>(
        { queryKey: participatingKey },
        (old) => (old ? applyScheduleVoteOptimisticUpdate(old, matchId, status, description) : old)
      );
      queryClient.setQueriesData<ScheduleInfiniteData>(
        { queryKey: hostedKey },
        (old) => (old ? applyScheduleVoteOptimisticUpdate(old, matchId, status, description) : old)
      );

      return {
        optimisticToken,
        previousParticipating,
        previousHosted,
      };
    },
    mutationFn: async ({ userId, matchId, status, description }: VoteParams) => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      return service.upsertTeamVote(userId, { matchId, status, description });
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      if (!isLatestOptimisticOperation(context.optimisticToken)) return;

      rollbackSnapshots(queryClient, context.previousParticipating);
      rollbackSnapshots(queryClient, context.previousHosted);
    },
    onSettled: (_data, _error, { userId }, context) => {
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.participatingMatches(userId),
      });
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.hostedMatches(userId),
      });
      finishOptimisticOperation(context?.optimisticToken);
    },
  });
}
