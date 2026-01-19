import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/shared/types/database.types';
import {
  toMatchInsertDataV3,
  extractGymDataV3,
} from './match.mapper';
import { MatchCreateFormData } from '@/features/match/create/model/schema';
import { createGymService } from '../gym/gym.service';

export class MatchService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * 경기 생성 (V3: Gym 생성/조회 후 Match 생성)
   *
   * Transaction Flow:
   * 1. Extract Gym Data from Form
   * 2. Find or Create Gym -> get gym_id
   * 3. Extract Match Data (with gym_id)
   * 4. Insert Match
   */
  async createMatchV3(hostId: string, form: MatchCreateFormData) {
    console.log('[createMatchV3] Starting with hostId:', hostId);

    // 1. Gym 처리
    const gymService = createGymService(this.supabase);
    const gymData = extractGymDataV3(form);
    console.log('[createMatchV3] gymData:', gymData);

    // Gym 생성 또는 조회 (이름/위치 기반)
    // GymService.findOrCreateGym 반환값은 gym_id (string) 입니다.
    console.log('[createMatchV3] Calling findOrCreateGym...');
    const gymId = await gymService.findOrCreateGym(gymData);
    console.log('[createMatchV3] gymId:', gymId);

    // 2. Match Data 매핑 (gymId 전달)
    const matchInsertData = toMatchInsertDataV3(hostId, form, gymId);
    console.log('[createMatchV3] matchInsertData:', matchInsertData);

    // 3. Team Name 보정 (Manual Team Name)
    if (matchInsertData.manual_team_name === '' && matchInsertData.team_id) {
       // 팀 ID가 있는데 이름이 비어있다면, 팀 테이블에서 이름 조회
       const { data: team } = await this.supabase
         .from('teams')
         .select('name')
         .eq('id', matchInsertData.team_id)
         .single();

       if (team) {
         matchInsertData.manual_team_name = team.name;
       } else {
         matchInsertData.manual_team_name = 'Unknown Team';
       }
    } else if (matchInsertData.manual_team_name === '') {
        matchInsertData.manual_team_name = '개인 주최';
    }

    // 4. Match Insert
    console.log('[createMatchV3] Inserting match...');
    const { data: match, error } = await this.supabase
      .from('matches')
      .insert(matchInsertData)
      .select()
      .single();

    console.log('[createMatchV3] Insert result - data:', match, 'error:', error);

    if (error) {
      console.error('Match insert error:', error);
      throw error;
    }

    return match;
  }

  // Existing methods...
  // (Assuming we are keeping existing methods for backward compatibility or reference for now,
  // actually the user replaced the schema entirely so old methods might break.
  // I will comment them out or leave them if they don't conflict typings too much.)

  async getRecruitingMatches() {
    const { data, error } = await this.supabase
      .from('matches')
      .select(`
        *,
        gym:gyms!gym_id (*),
        host:users!host_id (*),
        team:teams!team_id (*)
      `)
      .eq('status', 'RECRUITING')
      .order('start_time', { ascending: true });

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  /**
   * 경기 상세 조회
   */
  async getMatchDetail(id: string) {
    const { data, error } = await this.supabase
      .from('matches')
      .select(`
        *,
        gym:gyms!gym_id (*),
        host:users!host_id (*),
        team:teams!team_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * 내가 주최한 경기 목록
   */
  async getMyHostedMatches(userId: string) {
    const { data, error } = await this.supabase
      .from('matches')
      .select('*')
      .eq('host_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }
}

export function createMatchService(supabase: SupabaseClient<Database>) {
  return new MatchService(supabase);
}
