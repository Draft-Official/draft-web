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
      const existingGym = await this.getGymByKakaoPlaceId(gymData.kakaoPlaceId);

      if (existingGym) {
        // 기존 gym 발견: facilities 완전 덮어쓰기 (Latest Wins)
        // 새 데이터가 있으면 기존 데이터를 완전히 교체
        if (gymData.facilities && Object.keys(gymData.facilities).length > 0) {
          // 명시적으로 삭제할 필드 처리: 새 데이터에 없는 필드는 null로 설정하여 삭제
          const existingFacilities = (existingGym.facilities as Record<string, unknown>) || {};
          const newFacilities: Record<string, unknown> = { ...gymData.facilities };

          // 기존에 있던 필드 중 새 데이터에 없는 것은 명시적으로 null 설정
          // 이렇게 해야 DB에서 해당 필드가 제거됨
          const facilityKeys = ['parking', 'parking_fee', 'parking_location', 'court_size_type',
                               'ball', 'water_purifier', 'air_conditioner', 'shower'];

          for (const key of facilityKeys) {
            if (existingFacilities[key] !== undefined && newFacilities[key] === undefined) {
              // 기존에 있었지만 새 데이터에 없음 = 삭제 의도
              newFacilities[key] = null;
            }
          }

          const updatePayload = {
            facilities: newFacilities as unknown as Json,
            updated_at: new Date().toISOString()
          };

          console.log('[GymService] Updating gym facilities:', {
            gymId: existingGym.id,
            existingFacilities,
            newFacilities,
            updatePayload
          });

          logSupabaseQuery('gyms', 'UPDATE', updatePayload, { id: existingGym.id });

          // .maybeSingle() 사용: RLS로 인해 0개 결과일 때 에러 방지
          const { data: updatedData, error: updateError } = await this.supabase
            .from('gyms')
            .update(updatePayload)
            .eq('id', existingGym.id)
            .select()
            .maybeSingle();

          console.log('[GymService] UPDATE result:', { updatedData, updateError });
          logSupabaseResult('gyms', 'UPDATE', { id: existingGym.id, updated: !!updatedData }, updateError);

          // UPDATE 에러 처리
          if (updateError) {
            console.error('[GymService] Failed to update gym facilities:', updateError);
            throw updateError;
          }

          // RLS로 인해 UPDATE가 무시된 경우 - 경고만 출력하고 계속 진행
          // (gym id는 이미 있으므로 match 생성은 가능)
          if (!updatedData) {
            console.warn('[GymService] UPDATE returned no data - RLS policy may be blocking updates. Check gyms table UPDATE policy.');
          }
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
   * 체육관 정보 조회 (ID로)
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
   * 카카오 place_id로 체육관 조회
   */
  async getGymByKakaoPlaceId(kakaoPlaceId: string): Promise<Gym | null> {
    logRequest(this.SERVICE_NAME, 'getGymByKakaoPlaceId', { kakaoPlaceId });
    logSupabaseQuery('gyms', 'SELECT', undefined, { kakao_place_id: kakaoPlaceId });

    const { data, error } = await this.supabase
      .from('gyms')
      .select('*')
      .eq('kakao_place_id', kakaoPlaceId)
      .maybeSingle();

    logSupabaseResult('gyms', 'SELECT', data, error);

    if (error) {
      logResponse(this.SERVICE_NAME, 'getGymByKakaoPlaceId', undefined, error);
      return null;
    }

    logResponse(this.SERVICE_NAME, 'getGymByKakaoPlaceId', data);
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

