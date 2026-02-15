/**
 * Application Query Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import type { ApplicationStatusValue } from '@/shared/config/application-constants';
import { toUserApplicationItemDTO, toUserTeamOptionDTO } from '../lib';
import type { UserApplicationItemDTO, UserTeamOptionDTO } from '../model/types';
import { applicationKeys } from './keys';

/**
 * 사용자의 활성 신청 목록 조회 (매치 리스트에서 신청 상태 표시용)
 * 활성 상태: PENDING, PAYMENT_PENDING, CONFIRMED
 */
export function useUserApplications(userId: string | undefined) {
  return useQuery({
    queryKey: applicationKeys.byUser(userId!),
    queryFn: async (): Promise<UserApplicationItemDTO[]> => {
      if (!userId) return [];

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('applications')
        .select('match_id, status')
        .eq('user_id', userId)
        .in('status', ['PENDING', 'PAYMENT_PENDING', 'CONFIRMED']);

      if (error) throw error;

      const rows = (data || []) as Array<{
        match_id: string;
        status: ApplicationStatusValue;
      }>;

      return rows.map(toUserApplicationItemDTO);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}

/**
 * 사용자가 속한 팀 목록 조회
 */
export function useUserTeams(userId: string | undefined) {
  return useQuery({
    queryKey: [...applicationKeys.all, 'user-teams', userId],
    queryFn: async (): Promise<UserTeamOptionDTO[]> => {
      if (!userId) return [];

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          team_id,
          team:teams!team_id (
            id,
            name,
            logo_url
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'ACTIVE');

      if (error) throw error;

      const rows = (data || []) as Array<{
        team: { id: string; name: string; logo_url: string | null } | null;
      }>;

      return rows
        .map((item) => item.team)
        .filter((team): team is { id: string; name: string; logo_url: string | null } => !!team)
        .map(toUserTeamOptionDTO);
    },
    enabled: !!userId,
  });
}
