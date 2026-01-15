/**
 * Match Service
 * 매치 관련 모든 DB 접근을 캡슐화
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, MatchInsert, MatchUpdate } from '@/shared/types/database.types';
import { handleSupabaseError, NotFoundError } from '@/shared/lib/errors';

export class MatchService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * 모집중인 매치 목록 조회 (Guest List용)
   */
  async getRecruitingMatches() {
    const { data, error } = await this.supabase
      .from('matches')
      .select(
        `
        *,
        host:profiles!host_id (
          id,
          nickname,
          avatar_url,
          manner_score
        )
      `
      )
      .eq('status', 'recruiting')
      .order('start_time', { ascending: true });

    if (error) handleSupabaseError(error, '매치 목록');
    return data!;
  }

  /**
   * 단일 매치 상세 조회
   */
  async getMatchById(matchId: string) {
    const { data, error } = await this.supabase
      .from('matches')
      .select(
        `
        *,
        host:profiles!host_id (
          id,
          nickname,
          avatar_url,
          manner_score
        ),
        applications (
          id,
          position,
          status,
          user:profiles!user_id (
            id,
            nickname,
            avatar_url,
            height,
            position,
            manner_score
          )
        )
      `
      )
      .eq('id', matchId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('매치');
      }
      handleSupabaseError(error, '매치');
    }

    return data!;
  }

  /**
   * 호스트의 매치 목록 조회 (Dashboard용)
   */
  async getMatchesByHost(hostId: string) {
    const { data, error } = await this.supabase
      .from('matches')
      .select(
        `
        *,
        applications (
          id,
          status,
          position
        )
      `
      )
      .eq('host_id', hostId)
      .order('start_time', { ascending: false });

    if (error) handleSupabaseError(error, '호스트 매치 목록');
    return data!;
  }

  /**
   * 새 매치 생성
   */
  async createMatch(match: MatchInsert) {
    const { data, error } = await this.supabase
      .from('matches')
      .insert(match)
      .select()
      .single();

    if (error) handleSupabaseError(error, '매치 생성');
    return data!;
  }

  /**
   * 매치 정보 업데이트
   */
  async updateMatch(matchId: string, updates: MatchUpdate) {
    const { data, error } = await this.supabase
      .from('matches')
      .update(updates)
      .eq('id', matchId)
      .select()
      .single();

    if (error) handleSupabaseError(error, '매치 수정');
    return data!;
  }

  /**
   * 매치 상태 변경
   */
  async updateMatchStatus(matchId: string, status: string) {
    return this.updateMatch(matchId, { status });
  }

  /**
   * 매치 삭제 (호스트만)
   */
  async deleteMatch(matchId: string) {
    const { error } = await this.supabase
      .from('matches')
      .delete()
      .eq('id', matchId);

    if (error) handleSupabaseError(error, '매치 삭제');
  }
}

/**
 * MatchService 팩토리 함수
 */
export function createMatchService(supabase: SupabaseClient<Database>) {
  return new MatchService(supabase);
}
