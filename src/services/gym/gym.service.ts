import { SupabaseClient } from '@supabase/supabase-js';
import { Database, GymInsert, GymFacilities, Gym } from '@/shared/types/database.types';

/**
 * Gym 데이터 입력 인터페이스
 */
export interface GymData {
  name: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  kakaoPlaceId?: string;
  facilities?: GymFacilities;
}

/**
 * GymService - 체육관 정보 관리
 *
 * Upsert 전략:
 * 1. 카카오 place_id로 먼저 검색 (가장 정확)
 * 2. 이름 + 주소로 검색 (fallback)
 * 3. 없으면 새로 생성
 */
export class GymService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * 체육관 찾기 또는 생성 (Upsert)
   *
   * @param gymData - 체육관 정보
   * @returns gym_id
   */
  async findOrCreateGym(gymData: GymData): Promise<string> {
    try {
      // 1. 카카오 place_id로 먼저 검색 (가장 정확)
      if (gymData.kakaoPlaceId) {
        const { data: existingByKakao, error: kakaoError } = await this.supabase
          .from('gyms')
          .select('id')
          .eq('kakao_place_id', gymData.kakaoPlaceId)
          .single();

        if (!kakaoError && existingByKakao) {
          return existingByKakao.id;
        }
      }

      // 2. 이름 + 주소로 검색 (fallback)
      let query = this.supabase
        .from('gyms')
        .select('id')
        .eq('name', gymData.name);

      if (gymData.address) {
        query = query.eq('address', gymData.address);
      }

      const { data: existingByName, error: nameError } = await query.maybeSingle();

      if (!nameError && existingByName) {
        return existingByName.id;
      }

      // 3. 없으면 새로 생성
      const insertData: GymInsert = {
        name: gymData.name,
        address: gymData.address,
        latitude: gymData.latitude,
        longitude: gymData.longitude,
        kakao_place_id: gymData.kakaoPlaceId,
        facilities: gymData.facilities || {},
      };

      const { data: newGym, error: insertError } = await this.supabase
        .from('gyms')
        .insert(insertData)
        .select('id')
        .single();

      if (insertError) {
        throw insertError;
      }

      return newGym.id;
    } catch (error) {
      console.error('[GymService] Unexpected error:', error);
      throw error;
    }
  }

  /**
   * 체육관 정보 조회
   */
  async getGym(gymId: string): Promise<Gym | null> {
    const { data, error } = await this.supabase
      .from('gyms')
      .select('*')
      .eq('id', gymId)
      .single();

    if (error) {
      console.error('[GymService] Get gym error:', error);
      return null;
    }

    return data;
  }

  /**
   * 체육관 시설 정보 업데이트
   */
  async updateFacilities(gymId: string, facilities: GymFacilities): Promise<Gym | null> {
    const { data, error } = await this.supabase
      .from('gyms')
      .update({ facilities })
      .eq('id', gymId)
      .select()
      .single();

    if (error) {
      console.error('[GymService] Update facilities error:', error);
      return null;
    }

    return data;
  }

  /**
   * 이름으로 체육관 검색 (자동완성용)
   */
  async searchByName(query: string, limit: number = 10): Promise<Gym[]> {
    const { data, error } = await this.supabase
      .from('gyms')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(limit);

    if (error) {
      console.error('[GymService] Search error:', error);
      return [];
    }

    return data || [];
  }
}

export const createGymService = (client: SupabaseClient<Database>) => new GymService(client);

/**
 * Standalone helper function for findOrCreateGym
 * MatchService 등에서 간편하게 사용
 */
export async function findOrCreateGym(
  supabase: SupabaseClient<Database>,
  gymData: GymData
): Promise<string> {
  const service = new GymService(supabase);
  return service.findOrCreateGym(gymData);
}
