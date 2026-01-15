/**
 * Match Query Hooks
 * 매치 데이터 조회용 React Query hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { createMatchService, matchRowToGuestListMatch, matchRowToHostDashboardMatch } from '@/services/match';
import { matchKeys } from './keys';

/**
 * 모집중 매치 목록 조회
 * @returns GuestListMatch[] 형태로 변환된 매치 목록
 */
export function useRecruitingMatches() {
  return useQuery({
    queryKey: matchKeys.lists(),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);
      const rows = await matchService.getRecruitingMatches();

      // DB Row -> 클라이언트 타입 변환
      return rows.map(matchRowToGuestListMatch);
    },
  });
}

/**
 * 단일 매치 상세 조회
 * @param matchId 매치 ID
 */
export function useMatch(matchId: string) {
  return useQuery({
    queryKey: matchKeys.detail(matchId),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);
      return matchService.getMatchById(matchId);
    },
    enabled: !!matchId,
  });
}

/**
 * 호스트의 매치 목록 조회
 * @param hostId 호스트 ID
 */
export function useHostMatches(hostId: string | undefined) {
  return useQuery({
    queryKey: matchKeys.byHost(hostId!),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);
      const rows = await matchService.getMatchesByHost(hostId!);

      // DB Row -> Host Dashboard 타입 변환
      return rows.map(matchRowToHostDashboardMatch);
    },
    enabled: !!hostId,
  });
}
