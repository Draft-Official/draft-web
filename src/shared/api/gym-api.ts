import { SupabaseClient } from '@supabase/supabase-js';
import { Database, GymInsert, GymFacilities, Gym, Json } from '@/shared/types/database.types';
import { logRequest, logResponse, logSupabaseQuery, logSupabaseResult } from '@/shared/lib/logger';

/**
 * Gym 데이터 입력 인터페이스
 */
export interface GymData {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  kakaoPlaceId: string;
  facilities?: GymFacilities;
}

/**
 * GymService - 체육관 정보 관리
 *
 * Upsert 전략 (kakao_place_id 기준):
 * 1. kakao_place_id로 검색
 * 2. 있으면: facilities 병합 업데이트 (Latest Wins)
 * 3. 없으면: 신규 생성
 */
export class GymService {
  private readonly SERVICE_NAME = 'GymService';

  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * 체육관 Upsert (kakao_place_id 기준)
   *
   * 1. kakao_place_id로 검색
   * 2. 있으면: facilities 병합 업데이트 (Latest Wins)
   * 3. 없으면: 신규 생성
   */
  async upsertGym(gymData: GymData): Promise<string> {
    logRequest(this.SERVICE_NAME, 'upsertGym', gymData);

    try {
      // 1. kakao_place_id로 검색 (Primary Key)
      logSupabaseQuery('gyms', 'SELECT', undefined, { kakao_place_id: gymData.kakaoPlaceId });

      const { data: existingGym, error: lookupError } = await this.supabase
        .from('gyms')
        .select('id, facilities')
        .eq('kakao_place_id', gymData.kakaoPlaceId)
        .single();

      logSupabaseResult('gyms', 'SELECT', existingGym, lookupError);

      if (!lookupError && existingGym) {
        // 기존 gym 발견: facilities 병합 업데이트 (Latest Wins)
        if (gymData.facilities && Object.keys(gymData.facilities).length > 0) {
          const mergedFacilities = {
            ...(existingGym.facilities as any || {}),
            ...gymData.facilities,
          };

          const updatePayload = {
            facilities: mergedFacilities,
            updated_at: new Date().toISOString()
          };

          logSupabaseQuery('gyms', 'UPDATE', updatePayload, { id: existingGym.id });

          const { error: updateError } = await this.supabase
            .from('gyms')
            .update(updatePayload)
            .eq('id', existingGym.id);

          logSupabaseResult('gyms', 'UPDATE', { id: existingGym.id }, updateError);
        }

        logResponse(this.SERVICE_NAME, 'upsertGym', { gymId: existingGym.id, source: 'kakao_place_id' });
        return existingGym.id;
      }

      // 2. 신규 INSERT
      const insertData: GymInsert = {
        name: gymData.name,
        address: gymData.address,
        latitude: gymData.latitude,
        longitude: gymData.longitude,
        kakao_place_id: gymData.kakaoPlaceId,
        facilities: (gymData.facilities || {}) as unknown as Json,
      };

      logSupabaseQuery('gyms', 'INSERT', insertData);

      const { data: newGym, error: insertError } = await this.supabase
        .from('gyms')
        .insert(insertData)
        .select('id')
        .single();

      logSupabaseResult('gyms', 'INSERT', newGym, insertError);

      if (insertError) throw insertError;

      logResponse(this.SERVICE_NAME, 'upsertGym', { gymId: newGym.id, source: 'new' });
      return newGym.id;

    } catch (error) {
      logResponse(this.SERVICE_NAME, 'upsertGym', undefined, error);
      throw error;
    }
  }

  /**
   * 체육관 정보 조회
   */
  async getGym(gymId: string): Promise<Gym | null> {
    logRequest(this.SERVICE_NAME, 'getGym', { gymId });
    logSupabaseQuery('gyms', 'SELECT', undefined, { id: gymId });

    const { data, error } = await this.supabase
      .from('gyms')
      .select('*')
      .eq('id', gymId)
      .single();

    logSupabaseResult('gyms', 'SELECT', data, error);

    if (error) {
      logResponse(this.SERVICE_NAME, 'getGym', undefined, error);
      return null;
    }

    logResponse(this.SERVICE_NAME, 'getGym', data);
    return data;
  }

  /**
   * 체육관 시설 정보 업데이트
   */
  async updateFacilities(gymId: string, facilities: GymFacilities): Promise<Gym | null> {
    logRequest(this.SERVICE_NAME, 'updateFacilities', { gymId, facilities });
    logSupabaseQuery('gyms', 'UPDATE', { facilities }, { id: gymId });

    const { data, error } = await this.supabase
      .from('gyms')
      .update({ facilities: facilities as unknown as Json })
      .eq('id', gymId)
      .select()
      .single();

    logSupabaseResult('gyms', 'UPDATE', data, error);

    if (error) {
      logResponse(this.SERVICE_NAME, 'updateFacilities', undefined, error);
      return null;
    }

    logResponse(this.SERVICE_NAME, 'updateFacilities', data);
    return data;
  }

  /**
   * 이름으로 체육관 검색 (자동완성용)
   */
  async searchByName(query: string, limit: number = 10): Promise<Gym[]> {
    logRequest(this.SERVICE_NAME, 'searchByName', { query, limit });
    logSupabaseQuery('gyms', 'SELECT', undefined, { name: `%${query}%` });

    const { data, error } = await this.supabase
      .from('gyms')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(limit);

    logSupabaseResult('gyms', 'SELECT', data, error);

    if (error) {
      logResponse(this.SERVICE_NAME, 'searchByName', undefined, error);
      return [];
    }

    logResponse(this.SERVICE_NAME, 'searchByName', { count: data?.length ?? 0 });
    return data || [];
  }
}

export function createGymService(client: SupabaseClient<Database>) {
  return new GymService(client);
}

