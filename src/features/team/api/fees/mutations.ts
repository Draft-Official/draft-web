/**
 * Team Fees React Query Mutations
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { teamFeeKeys } from '../keys';
import { updateFeeStatus, initializeMonthlyFees } from './api';
import { teamFeeRowToClient } from '../mapper';
import type { ClientTeamFee, UpdateFeeStatusInput } from '../../model/types';

/**
 * 회비 상태 업데이트
 */
export function useUpdateFeeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      updatedBy,
      input,
    }: {
      updatedBy: string;
      input: UpdateFeeStatusInput;
    }): Promise<ClientTeamFee> => {
      const supabase = getSupabaseBrowserClient();
      const row = await updateFeeStatus(supabase, updatedBy, input);
      return teamFeeRowToClient(row);
    },
    onSuccess: (data, { input }) => {
      // 개별 상태 캐시 갱신
      queryClient.setQueryData(
        teamFeeKeys.myStatus(input.teamId, input.userId, input.yearMonth),
        data
      );
      // 회비 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamFeeKeys.byTeamMonth(input.teamId, input.yearMonth),
      });
      // 요약 갱신
      queryClient.invalidateQueries({
        queryKey: teamFeeKeys.summary(input.teamId, input.yearMonth),
      });
    },
  });
}

/**
 * 월별 회비 레코드 초기화
 */
export function useInitializeMonthlyFees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      teamId,
      yearMonth,
    }: {
      teamId: string;
      yearMonth: string;
    }): Promise<ClientTeamFee[]> => {
      const supabase = getSupabaseBrowserClient();
      const rows = await initializeMonthlyFees(supabase, teamId, yearMonth);
      return rows.map(teamFeeRowToClient);
    },
    onSuccess: (_, { teamId, yearMonth }) => {
      // 회비 목록 갱신
      queryClient.invalidateQueries({
        queryKey: teamFeeKeys.byTeamMonth(teamId, yearMonth),
      });
      // 요약 갱신
      queryClient.invalidateQueries({
        queryKey: teamFeeKeys.summary(teamId, yearMonth),
      });
    },
  });
}
