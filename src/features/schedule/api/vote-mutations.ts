'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createTeamService } from '@/entities/team';
import type { TeamVoteStatusValue } from '@/shared/config/application-constants';
import { matchManagementKeys } from './keys';

interface VoteParams {
  userId: string;
  matchId: string;
  status: TeamVoteStatusValue;
  description?: string;
}

/**
 * 경기 관리에서 팀 투표 (참석/불참/미정)
 */
export function useScheduleVote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, matchId, status, description }: VoteParams) => {
      const supabase = getSupabaseBrowserClient();
      const service = createTeamService(supabase);
      return service.upsertTeamVote(userId, { matchId, status, description });
    },
    onSuccess: (_data, { userId }) => {
      // 참여 경기 목록 갱신 (투표 현황 반영)
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.participatingMatches(userId),
      });
      // 호스트 경기 목록도 갱신
      queryClient.invalidateQueries({
        queryKey: matchManagementKeys.hostedMatches(userId),
      });
    },
  });
}
