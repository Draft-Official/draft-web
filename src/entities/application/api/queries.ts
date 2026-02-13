/**
 * Application Query Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createApplicationService } from './application-service';
import { applicationKeys } from './keys';
import type { ApplicationStatusValue } from '@/shared/config/application-constants';

/**
 * 사용자의 활성 신청 목록 조회 (매치 리스트에서 신청 상태 표시용)
 * 활성 상태: PENDING, PAYMENT_PENDING, CONFIRMED
 */
export function useUserApplications(userId: string | undefined) {
  return useQuery({
    queryKey: applicationKeys.byUser(userId!),
    queryFn: async () => {
      if (!userId) return [];

      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('applications')
        .select('match_id, status')
        .eq('user_id', userId)
        .in('status', ['PENDING', 'PAYMENT_PENDING', 'CONFIRMED']);

      if (error) throw error;

      return (data || []) as Array<{ match_id: string; status: ApplicationStatusValue }>;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분간 캐시 유지
  });
}

/**
 * 매치의 신청 목록 조회 (호스트용)
 */
export function useMatchApplications(matchId: string) {
  return useQuery({
    queryKey: applicationKeys.byMatch(matchId),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const service = createApplicationService(supabase);
      return service.getApplicationsByMatch(matchId);
    },
    enabled: !!matchId,
  });
}

/**
 * 사용자의 신청 내역 조회
 */
export function useMyApplications(userId: string | undefined) {
  return useQuery({
    queryKey: applicationKeys.byUser(userId!),
    queryFn: async () => {
      if (!userId) return [];

      const supabase = getSupabaseBrowserClient();
      const service = createApplicationService(supabase);
      return service.getApplicationsByUser(userId);
    },
    enabled: !!userId,
  });
}

/**
 * 단일 신청 조회
 */
export function useApplication(applicationId: string) {
  return useQuery({
    queryKey: applicationKeys.detail(applicationId),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const service = createApplicationService(supabase);
      return service.getApplicationById(applicationId);
    },
    enabled: !!applicationId,
  });
}

/**
 * 사용자가 속한 팀 목록 조회
 */
export function useUserTeams(userId: string | undefined) {
  return useQuery({
    queryKey: [...applicationKeys.all, 'user-teams', userId],
    queryFn: async () => {
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

      // team 정보만 추출
      return data?.map((item) => item.team).filter(Boolean) || [];
    },
    enabled: !!userId,
  });
}
