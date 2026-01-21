/**
 * Match Query Hooks
 * 매치 데이터 조회용 React Query hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { createMatchService } from '@/services/match/match.service';
import { matchRowToGuestListMatch } from '@/services/match/match.mapper';
import { matchKeys } from './keys';
import { useAuth } from '@/features/auth';

/**
 * 모집중 매치 목록 조회
 * @returns GuestListMatch[] 형태로 변환된 매치 목록
 */
export function useRecruitingMatches() {
  return useQuery({
    queryKey: matchKeys.lists(),
    queryFn: async () => {
      console.log('[useRecruitingMatches] Fetching matches...');
      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);

      const rows = await matchService.getRecruitingMatches();
      console.log('[useRecruitingMatches] Raw rows:', rows);

      // DB Row -> 클라이언트 타입 변환
      const mapped = rows.map(matchRowToGuestListMatch);
      console.log('[useRecruitingMatches] Mapped matches:', mapped);
      return mapped;
    },
  });
}

/**
 * 단일 매치 상세 조회
 * @param matchId 매치 ID
 * @returns GuestListMatch 형태로 변환된 매치 상세
 */
export function useMatch(matchId: string) {
  return useQuery({
    queryKey: matchKeys.detail(matchId),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);
      const row = await matchService.getMatchDetail(matchId);

      // DB Row -> 클라이언트 타입 변환
      return matchRowToGuestListMatch(row);
    },
    enabled: !!matchId,
  });
}

/**
 * 내가 주최한 최근 경기 목록 (최대 5개)
 * @returns gym, team 정보가 포함된 매치 목록 (raw DB row)
 */
export function useMyRecentMatches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: matchKeys.byHost(user?.id ?? ''),
    queryFn: async () => {
      if (!user?.id) return [];

      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);
      return await matchService.getMyHostedMatches(user.id, 5);
    },
    enabled: !!user?.id,
  });
}
