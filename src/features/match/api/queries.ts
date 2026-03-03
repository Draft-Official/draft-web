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
import { toGuestMatchListItemDTO, toGuestMatchDetailDTO } from '@/features/match/lib/mappers';
import { GuestMatchDetailDTO, GuestMatchListItemDTO } from '@/features/match/model/types';

/**
 * 모집중 매치 목록 조회
 * @returns GuestMatchListItemDTO[] 형태로 변환된 매치 목록
 */
export function useRecruitingMatches() {
  return useQuery({
    queryKey: matchKeys.lists(),
    queryFn: async (): Promise<GuestMatchListItemDTO[]> => {
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
          return toGuestMatchListItemDTO(match, gym, host, team);
        });

      console.log('[useRecruitingMatches] Mapped DTOs:', dtos);
      return dtos;
    },
  });
}

/**
 * 단일 매치 상세 조회
 * @param matchIdentifier 매치 식별자(UUID 또는 short_id)
 * @returns GuestMatchDetailDTO 형태로 변환된 매치 상세
 *
 * 최적화: 리스트 캐시에서 initialData를 가져와 즉시 렌더링 후 백그라운드에서 최신 데이터 fetch
 */
export function useMatch(matchIdentifier: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: matchKeys.detail(matchIdentifier),
    queryFn: async (): Promise<GuestMatchDetailDTO> => {
      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);
      const row = (await matchService.getMatchDetail(matchIdentifier)) as MatchWithRelations;

      if (!row.gym || !row.host) {
        throw new Error('매치 상세의 관계 데이터가 누락되었습니다.');
      }

      // Entity mappers -> DTO mapper
      const match = matchRowToEntity(row);
      const gym = gymRowToEntity(row.gym);
      const host = userRowToEntity(row.host);
      const team = row.team ? teamRowToEntity(row.team) : null;

      return toGuestMatchDetailDTO(match, gym, host, team);
    },
    enabled: !!matchIdentifier,
    // 리스트 캐시에서 초기값 제공 → 즉시 렌더링
    initialData: () => {
      const listCache = queryClient.getQueryData<GuestMatchListItemDTO[]>(matchKeys.lists());
      if (!listCache) return undefined;
      const listItem = listCache.find((m) => m.matchId === matchIdentifier || m.publicId === matchIdentifier);
      if (!listItem) return undefined;

      return {
        ...listItem,
        id: listItem.matchId,
        title: listItem.gymName,
        location: listItem.gymName,
        address: listItem.gymAddress,
        price: listItem.priceDisplay,
        priceNum: 0,
        gender: listItem.genderRule,
        level: listItem.levelDisplay,
        levelMin: null,
        levelMax: null,
        ageRange: listItem.ageDisplay,
        facilities: null,
        positions: listItem.positions,
        rule: null,
        hostName: listItem.hostNickname,
        hostImage: listItem.hostAvatar,
        manualTeamName: listItem.teamName,
        hostMessage: null,
        contactInfo: null,
        latitude: listItem.gymLatitude,
        longitude: listItem.gymLongitude,
        requirements: null,
        providesBeverage: null,
        recruitmentStatus: { total: 0, current: 0, isFull: false },
        matchRuleDisplay: null,
        contactType: null,
        contactValue: null,
      };
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
          return toGuestMatchListItemDTO(match, gym, host, team);
        });

      console.log('[useRecruitingMatchesInfinite] Mapped DTO matches:', matches.length);

      return {
        matches,
        nextCursor: result.nextCursor,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 0,
    refetchInterval: 60 * 1000,
  });
}
