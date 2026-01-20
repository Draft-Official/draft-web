import { GymFacilities } from '@/shared/types/database.types';

export interface GymLookupResult {
  id: string;
  name: string;
  address: string;
  facilities: GymFacilities | null;
  kakao_place_id: string;
}

/**
 * 카카오 place_id로 기존 gym 조회
 * @param kakaoPlaceId - 카카오맵 장소 ID
 * @returns gym 데이터 또는 null (신규 체육관인 경우)
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
