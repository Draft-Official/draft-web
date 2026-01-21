/**
 * Application Query Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { applicationKeys } from './keys';

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
