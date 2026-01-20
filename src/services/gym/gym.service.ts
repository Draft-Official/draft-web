import { SupabaseClient } from '@supabase/supabase-js';
import { Database, GymInsert, GymFacilities, Gym } from '@/shared/types/database.types';

/**
 * Gym 데이터 입력 인터페이스
 */
export interface GymData {
  name: string;
  address: string; // Required in Schema V3
  latitude?: number | null;
  longitude?: number | null;
  kakaoPlaceId?: string | null;
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
  /**
   * 체육관 Upsert (Latest Wins Strategy)
   * 
   * 1. kakao_place_id로 검색
   * 2. 있으면: facilities 병합 업데이트 (Latest Wins)
   * 3. 없으면: name + address로 검색 (fallback)
   * 4. 있으면: facilities 병합 업데이트 & kakao_place_id 업데이트
   * 5. 없으면: 신규 생성
   */
  async upsertGym(gymData: GymData): Promise<string> {
    console.log('[GymService.upsertGym] Starting with:', gymData);

    try {
      // 1. kakao_place_id로 검색
      if (gymData.kakaoPlaceId) {
        const { data: existingGym, error: lookupError } = await this.supabase
          .from('gyms')
          .select('id, facilities')
          .eq('kakao_place_id', gymData.kakaoPlaceId)
          .single();

        if (!lookupError && existingGym) {
          console.log('[GymService] Found existing gym:', existingGym.id);

          // Latest Wins: facilities 병합 (빈 필드는 기존 값 유지)
          if (gymData.facilities && Object.keys(gymData.facilities).length > 0) {
            const mergedFacilities = {
              ...(existingGym.facilities as any || {}),
              ...gymData.facilities,
            };

            await this.supabase
              .from('gyms')
              .update({
                facilities: mergedFacilities,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingGym.id);

            console.log('[GymService] Facilities updated');
          }

          return existingGym.id;
        }
      }

      // 2. name + address fallback
      const { data: existingByName } = await this.supabase
        .from('gyms')
        .select('id, facilities')
        .eq('name', gymData.name)
        .eq('address', gymData.address)
        .maybeSingle();

      if (existingByName) {
        console.log('[GymService] Found by name+address:', existingByName.id);

        const updateData: any = { updated_at: new Date().toISOString() };

        if (gymData.facilities && Object.keys(gymData.facilities).length > 0) {
          updateData.facilities = {
            ...(existingByName.facilities as any || {}),
            ...gymData.facilities,
          };
        }

        if (gymData.kakaoPlaceId) {
          updateData.kakao_place_id = gymData.kakaoPlaceId;
        }

        await this.supabase
          .from('gyms')
          .update(updateData)
          .eq('id', existingByName.id);

        return existingByName.id;
      }

      // 3. INSERT
      console.log('[GymService] Creating new gym...');
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

      if (insertError) throw insertError;

      console.log('[GymService] Created new gym:', newGym.id);
      return newGym.id;

    } catch (error) {
      console.error('[GymService] Error:', error);
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

export function createGymService(client: SupabaseClient<Database>) {
  return new GymService(client);
}

