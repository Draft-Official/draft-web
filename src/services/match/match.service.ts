import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/shared/types/database.types';
import {
  toMatchInsertDataV3,
  extractGymDataV3,
} from './match.mapper';
import { MatchCreateFormData } from '@/features/match/create/model/schema';
import { createGymService } from '../gym/gym.service';
import { logRequest, logResponse, logSupabaseQuery, logSupabaseResult } from '@/shared/lib/logger';

export class MatchService {
  private readonly SERVICE_NAME = 'MatchService';

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
    logRequest(this.SERVICE_NAME, 'createMatchV3', { hostId, form });

    try {
      // 1. Gym 처리
      const gymService = createGymService(this.supabase);
      const gymData = extractGymDataV3(form);

      // Gym 생성 또는 조회 (Upsert + Latest Wins)
      const gymId = await gymService.upsertGym(gymData);

      // 2. Match Data 매핑 (gymId 전달)
      const matchInsertData = toMatchInsertDataV3(hostId, form, gymId);

      // 3. Team Name 보정 (Manual Team Name)
      if (matchInsertData.manual_team_name === '' && matchInsertData.team_id) {
        logSupabaseQuery('teams', 'SELECT', undefined, { id: matchInsertData.team_id });

        const { data: team, error: teamError } = await this.supabase
          .from('teams')
          .select('name')
          .eq('id', matchInsertData.team_id)
          .single();

        logSupabaseResult('teams', 'SELECT', team, teamError);

        if (team) {
          matchInsertData.manual_team_name = team.name;
        } else {
          matchInsertData.manual_team_name = 'Unknown Team';
        }
      } else if (matchInsertData.manual_team_name === '') {
        matchInsertData.manual_team_name = '개인 주최';
      }

      // 4. Match Insert
      logSupabaseQuery('matches', 'INSERT', matchInsertData);

      const { data: match, error } = await this.supabase
        .from('matches')
        .insert(matchInsertData)
        .select()
        .single();

      logSupabaseResult('matches', 'INSERT', match, error);

      if (error) {
        throw error;
      }

      logResponse(this.SERVICE_NAME, 'createMatchV3', { matchId: match.id, gymId });
      return match;

    } catch (error) {
      logResponse(this.SERVICE_NAME, 'createMatchV3', undefined, error);
      throw error;
    }
  }

  /**
   * 모집 중인 경기 목록 조회
   */
  async getRecruitingMatches() {
    logRequest(this.SERVICE_NAME, 'getRecruitingMatches');
    logSupabaseQuery('matches', 'SELECT', undefined, { status: 'RECRUITING' });

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

    logSupabaseResult('matches', 'SELECT', { count: data?.length ?? 0 }, error);

    if (error) {
      logResponse(this.SERVICE_NAME, 'getRecruitingMatches', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'getRecruitingMatches', { count: data?.length ?? 0 });
    return data ?? [];
  }

  /**
   * 경기 상세 조회
   */
  async getMatchDetail(id: string) {
    logRequest(this.SERVICE_NAME, 'getMatchDetail', { id });
    logSupabaseQuery('matches', 'SELECT', undefined, { id });

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

    logSupabaseResult('matches', 'SELECT', data, error);

    if (error) {
      logResponse(this.SERVICE_NAME, 'getMatchDetail', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'getMatchDetail', data);
    return data;
  }

  /**
   * 내가 주최한 경기 목록 (gym, team 정보 포함)
   * @param userId 사용자 ID
   * @param limit 최대 조회 개수 (기본 5개)
   */
  async getMyHostedMatches(userId: string, limit: number = 5) {
    logRequest(this.SERVICE_NAME, 'getMyHostedMatches', { userId, limit });
    logSupabaseQuery('matches', 'SELECT', undefined, { host_id: userId });

    const { data, error } = await this.supabase
      .from('matches')
      .select(`
        *,
        gym:gyms!gym_id (*),
        team:teams!team_id (name)
      `)
      .eq('host_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    logSupabaseResult('matches', 'SELECT', { count: data?.length ?? 0 }, error);

    if (error) {
      logResponse(this.SERVICE_NAME, 'getMyHostedMatches', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'getMyHostedMatches', { count: data?.length ?? 0 });
    return data;
  }
}

export function createMatchService(supabase: SupabaseClient<Database>) {
  return new MatchService(supabase);
}
