/**
 * Application Service
 * 경기 신청 관련 DB 접근을 캡슐화
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  Application,
  ApplicationStatus,
  PositionType,
} from '@/shared/types/database.types';
import { handleSupabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';

export class ApplicationService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * 매치의 신청 목록 조회 (호스트용)
   */
  async getApplicationsByMatch(matchId: string) {
    const { data, error } = await this.supabase
      .from('applications')
      .select(
        `
        *,
        user:users!user_id (
          id,
          nickname,
          avatar_url,
          positions,
          manner_score
        )
      `
      )
      .eq('match_id', matchId)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error, '신청 목록');
    return data!;
  }

  /**
   * 사용자의 신청 목록 조회
   */
  async getApplicationsByUser(userId: string) {
    const { data, error } = await this.supabase
      .from('applications')
      .select(
        `
        *,
        match:matches!match_id (
          id,
          title,
          start_time,
          cost_type,
          cost_amount,
          status,
          gym:gyms(name, address)
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error, '내 신청 목록');
    return data!;
  }

  /**
   * 단일 신청 조회
   */
  async getApplicationById(applicationId: string) {
    const { data, error } = await this.supabase
      .from('applications')
      .select(
        `
        *,
        user:users!user_id (*),
        match:matches!match_id (*)
      `
      )
      .eq('id', applicationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundError('신청');
      }
      handleSupabaseError(error, '신청');
    }

    return data!;
  }

  /**
   * 신청 생성
   */
  async createApplication(
    matchId: string,
    userId: string,
    position: PositionType
  ): Promise<Application> {
    const { data, error } = await this.supabase
      .from('applications')
      .insert({
        match_id: matchId,
        user_id: userId,
        position,
        status: 'PENDING',
      })
      .select()
      .single();

    if (error) {
      // 중복 신청 체크
      if (error.code === '23505') {
        throw new ValidationError('이미 해당 경기에 신청하셨습니다');
      }
      handleSupabaseError(error, '신청');
    }

    return data!;
  }

  /**
   * 신청 상태 업데이트 (호스트용)
   */
  async updateApplicationStatus(
    applicationId: string,
    status: ApplicationStatus
  ): Promise<Application> {
    const { data, error } = await this.supabase
      .from('applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) handleSupabaseError(error, '신청 상태 변경');
    return data!;
  }

  /**
   * 신청 확정
   */
  async confirmApplication(applicationId: string) {
    return this.updateApplicationStatus(applicationId, 'CONFIRMED');
  }

  /**
   * 신청 거절
   */
  async rejectApplication(applicationId: string) {
    return this.updateApplicationStatus(applicationId, 'REJECTED');
  }

  /**
   * 신청 취소 (사용자용)
   */
  async cancelApplication(applicationId: string, reason?: string) {
    const { data, error } = await this.supabase
      .from('applications')
      .update({
        status: 'CANCELED',
        cancellation_reason: reason || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) handleSupabaseError(error, '신청 취소');
    return data!;
  }
}

/**
 * ApplicationService 팩토리 함수
 */
export function createApplicationService(supabase: SupabaseClient<Database>) {
  return new ApplicationService(supabase);
}
