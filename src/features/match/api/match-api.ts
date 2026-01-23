import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/shared/types/database.types';
import { logRequest, logResponse, logSupabaseQuery, logSupabaseResult } from '@/shared/lib/logger';

export class MatchService {
  private readonly SERVICE_NAME = 'MatchService';

  constructor(private supabase: SupabaseClient<Database>) {}

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
