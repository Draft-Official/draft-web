import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { gymKeys } from './keys';
import { createGymService } from './gym-service';
import type { GymFacilities } from '@/shared/types/jsonb.types';

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
