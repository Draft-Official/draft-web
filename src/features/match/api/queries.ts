/**
 * Match Query Hooks
 * 매치 데이터 조회용 React Query hooks
 */
import { useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createMatchService, matchKeys, matchRowToEntity } from '@/entities/match';
import { gymRowToEntity } from '@/entities/gym';
import { userRowToEntity } from '@/entities/user';
import { teamRowToEntity } from '@/entities/team';
import type { MatchWithRelations } from '@/shared/types/database.types';
import { matchRowToGuestListMatch } from '@/features/match/api/match-mapper';
import { toMatchListItemDTO } from '@/features/match/lib/mappers';
import { GuestListMatch, MatchListItemDTO } from '@/features/match/model/types';

/**
 * 모집중 매치 목록 조회
 * @returns MatchListItemDTO[] 형태로 변환된 매치 목록
 */
export function useRecruitingMatches() {
  return useQuery({
    queryKey: matchKeys.lists(),
    queryFn: async (): Promise<MatchListItemDTO[]> => {
      console.log('[useRecruitingMatches] Fetching matches...');
      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);

      const rows = (await matchService.getRecruitingMatches()) as MatchWithRelations[];
      console.log('[useRecruitingMatches] Raw rows:', rows);

      const dtos = rows
        .filter((row) => row.gym && row.host)
        .map((row) => {
          const match = matchRowToEntity(row);
          const gym = gymRowToEntity(row.gym!);
          const host = userRowToEntity(row.host!);
          const team = row.team ? teamRowToEntity(row.team) : null;
          return toMatchListItemDTO(match, gym, host, team);
        });

      console.log('[useRecruitingMatches] Mapped DTOs:', dtos);
      return dtos;
    },
  });
}

/**
 * 단일 매치 상세 조회
 * @param matchId 매치 ID
 * @returns GuestListMatch 형태로 변환된 매치 상세
 *
 * 최적화: 리스트 캐시에서 initialData를 가져와 즉시 렌더링 후 백그라운드에서 최신 데이터 fetch
 */
export function useMatch(matchId: string) {
  const queryClient = useQueryClient();

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
    // 리스트 캐시에서 초기값 제공 → 즉시 렌더링
    initialData: () => {
      const listCache = queryClient.getQueryData<(GuestListMatch | MatchListItemDTO)[]>(matchKeys.lists());
      if (!listCache) return undefined;
      return listCache.find((m): m is GuestListMatch => 'id' in m && m.id === matchId);
    },
    // 초기값은 즉시 stale 처리 → 백그라운드 refetch 트리거
    initialDataUpdatedAt: 0,
  });
}

/**
 * 모집중 매치 목록 조회 (무한 스크롤/페이지네이션)
 * @returns 페이지네이션 지원 매치 목록
 */
export function useRecruitingMatchesInfinite() {
  return useInfiniteQuery({
    queryKey: matchKeys.listInfinite(),
    queryFn: async ({ pageParam = 0 }) => {
      console.log('[useRecruitingMatchesInfinite] Fetching page:', pageParam);
      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);

      const result = await matchService.getRecruitingMatchesPaginated(pageParam);
      const rows = result.matches as MatchWithRelations[];

      const matches = rows
        .filter((row) => row.gym && row.host)
        .map((row) => {
          const match = matchRowToEntity(row);
          const gym = gymRowToEntity(row.gym!);
          const host = userRowToEntity(row.host!);
          const team = row.team ? teamRowToEntity(row.team) : null;
          return toMatchListItemDTO(match, gym, host, team);
        });

      console.log('[useRecruitingMatchesInfinite] Mapped DTO matches:', matches.length);

      return {
        matches,
        nextCursor: result.nextCursor,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
  });
}
