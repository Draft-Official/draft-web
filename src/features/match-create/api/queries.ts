/**
 * Match Create Query Hooks
 * 경기 생성 관련 조회용 React Query hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { matchKeys } from '@/entities/match';
import { useAuth } from '@/shared/session';

/**
 * 내가 주최한 최근 경기 목록 (최대 5개)
 * "최근 경기 불러오기" 기능에서 사용
 * @returns gym, team 정보가 포함된 매치 목록 (raw DB row)
 */
export function useMyRecentMatches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: matchKeys.byHost(user?.id ?? ''),
    queryFn: async () => {
      if (!user?.id) return [];

      const supabase = getSupabaseBrowserClient();

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          gym:gyms!gym_id (*),
          team:teams!team_id (name)
        `)
        .eq('host_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Failed to fetch recent matches:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user?.id,
  });
}
