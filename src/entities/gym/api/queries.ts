import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { gymKeys } from './keys';
import { createGymService } from './gym-service';
import { gymRowToEntity } from './mapper';
import type { GymFacilities } from '@/shared/types/jsonb.types';
import type { Gym } from '../model/types';

/**
 * Gym lookup result from API (DB row format)
 */
export interface GymLookupResult {
  id: string;
  name: string;
  address: string;
  facilities: GymFacilities | null;
  kakao_place_id: string;
}

/**
 * 카카오 place_id로 기존 gym 조회
 */
export async function lookupGymByKakaoPlaceId(
  kakaoPlaceId: string
): Promise<GymLookupResult | null> {
  try {
    const supabase = getSupabaseBrowserClient();
    const gymService = createGymService(supabase);
    const gym = await gymService.getGymByKakaoPlaceId(kakaoPlaceId);
    if (!gym) return null;

    return {
      id: gym.id,
      name: gym.name,
      address: gym.address,
      facilities: (gym.facilities as GymFacilities) ?? null,
      kakao_place_id: gym.kakao_place_id,
    };
  } catch (error) {
    console.error('[Client] Gym lookup error:', error);
    return null;
  }
}

/**
 * 카카오 place_id로 체육관 조회 hook
 * @param kakaoPlaceId - 카카오맵 장소 ID
 * @param enabled - 쿼리 활성화 여부
 */
export function useGymByKakaoPlaceId(kakaoPlaceId: string, enabled = true) {
  return useQuery({
    queryKey: gymKeys.byKakaoPlaceId(kakaoPlaceId),
    queryFn: () => lookupGymByKakaoPlaceId(kakaoPlaceId),
    enabled: enabled && !!kakaoPlaceId,
  });
}

/**
 * ID로 체육관 조회 hook
 * 팀 홈구장 초기화 등 gymId로 직접 조회할 때 사용
 */
export function useGymById(gymId: string | null | undefined): { data: Gym | null | undefined; isLoading: boolean } {
  return useQuery({
    queryKey: gymKeys.detail(gymId ?? ''),
    queryFn: async (): Promise<Gym | null> => {
      const supabase = getSupabaseBrowserClient();
      const service = createGymService(supabase);
      const row = await service.getGym(gymId!);
      if (!row) return null;
      return gymRowToEntity(row);
    },
    enabled: !!gymId,
  });
}
