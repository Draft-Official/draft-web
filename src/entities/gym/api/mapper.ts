/**
 * Gym Mapper
 * DB row를 entity 타입으로 변환
 */

import type { Gym as GymRow } from '@/shared/types/database.types';
import type { GymFacilities } from '@/shared/types/jsonb.types';
import type { Gym as GymEntity } from '../model/types';

/**
 * Gym DB row를 entity 타입으로 변환
 */
export function gymRowToEntity(row: GymRow): GymEntity {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    kakaoPlaceId: row.kakao_place_id,
    latitude: row.latitude,
    longitude: row.longitude,
    facilities: (row.facilities as GymFacilities) ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
