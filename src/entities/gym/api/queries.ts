import { useQuery } from '@tanstack/react-query';
import { gymKeys } from './keys';
import type { ClientGym } from '../model/types';
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
    const response = await fetch(
      `/api/gyms?kakaoPlaceId=${encodeURIComponent(kakaoPlaceId)}`
    );

    if (!response.ok) {
      throw new Error('Failed to lookup gym');
    }

    const { gym } = await response.json();
    return gym || null;
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
