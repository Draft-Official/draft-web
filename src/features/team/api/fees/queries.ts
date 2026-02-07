/**
 * Team Fees React Query Hooks
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { teamFeeKeys } from '../keys';
import { getTeamFees, getMyFeeStatus, getFeeSummary } from './api';
import { teamFeeRowToClient } from '../mapper';
import type { ClientTeamFee } from '../../model/types';

/**
 * 팀 회비 목록 조회 (특정 월)
 */
export function useTeamFees(
  teamId: string | null | undefined,
  yearMonth: string | null | undefined
) {
  return useQuery({
    queryKey: teamFeeKeys.byTeamMonth(teamId || '', yearMonth || ''),
    queryFn: async (): Promise<ClientTeamFee[]> => {
      if (!teamId || !yearMonth) return [];
      const supabase = getSupabaseBrowserClient();
      const rows = await getTeamFees(supabase, teamId, yearMonth);
      return rows.map(teamFeeRowToClient);
    },
    enabled: !!teamId && !!yearMonth,
  });
}

/**
 * 현재 사용자의 회비 상태 조회
 */
export function useMyFeeStatus(
  teamId: string | null | undefined,
  userId: string | null | undefined,
  yearMonth: string | null | undefined
) {
  return useQuery({
    queryKey: teamFeeKeys.myStatus(teamId || '', userId || '', yearMonth || ''),
    queryFn: async (): Promise<ClientTeamFee | null> => {
      if (!teamId || !userId || !yearMonth) return null;
      const supabase = getSupabaseBrowserClient();
      const row = await getMyFeeStatus(supabase, teamId, userId, yearMonth);
      return row ? teamFeeRowToClient(row) : null;
    },
    enabled: !!teamId && !!userId && !!yearMonth,
  });
}

/**
 * 팀 회비 요약 조회
 */
export function useFeeSummary(
  teamId: string | null | undefined,
  yearMonth: string | null | undefined
) {
  return useQuery({
    queryKey: teamFeeKeys.summary(teamId || '', yearMonth || ''),
    queryFn: async (): Promise<{ total: number; paid: number; unpaid: number } | null> => {
      if (!teamId || !yearMonth) return null;
      const supabase = getSupabaseBrowserClient();
      return getFeeSummary(supabase, teamId, yearMonth);
    },
    enabled: !!teamId && !!yearMonth,
  });
}
