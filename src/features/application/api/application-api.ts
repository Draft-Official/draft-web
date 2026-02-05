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
  ParticipantInfo,
  Json,
} from '@/shared/types/database.types';
import type { CancelTypeValue, CanceledByValue } from '@/shared/config/constants';
import { handleSupabaseError, NotFoundError, ValidationError } from '@/shared/lib/errors';

export interface CancelOptions {
  cancelType?: CancelTypeValue;
  canceledBy?: CanceledByValue;
  cancelReason?: string;
}

/**
 * participants_info에서 포지션 배열 추출
 */
function extractPositionsFromParticipants(
  participantsInfo: Json | null
): string[] {
  if (!participantsInfo || !Array.isArray(participantsInfo)) {
    return [];
  }

  return (participantsInfo as unknown as Array<{ position?: string }>)
    .map((p) => p.position)
    .filter((pos): pos is string => typeof pos === 'string' && pos.length > 0);
}

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
          manner_score,
          metadata,
          account_info
        ),
        team:teams!team_id (
          name
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
   * 신청 생성 (레거시 - 단일 포지션)
   * @deprecated Use createApplicationV2 instead
   */
  async createApplication(
    matchId: string,
    userId: string,
    position: PositionType
  ): Promise<Application> {
    // 레거시 호환: 단일 포지션을 participants_info 배열로 변환
    const participantsInfo: ParticipantInfo[] = [
      { type: 'MAIN', name: '', position }
    ];

    return this.createApplicationV2(matchId, userId, participantsInfo);
  }

  /**
   * 신청 생성 V2 (participants_info 배열 지원)
   * 본인 + 동반인 처리 가능
   */
  async createApplicationV2(
    matchId: string,
    userId: string,
    participantsInfo: ParticipantInfo[],
    teamId?: string | null
  ): Promise<Application> {
    const { data, error } = await this.supabase
      .from('applications')
      .insert({
        match_id: matchId,
        user_id: userId,
        team_id: teamId || null,
        participants_info: participantsInfo as unknown as Json,
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
   * 신청 승인 (PENDING 상태 유지, approved_at 설정)
   * 입금대기 상태로 전환
   */
  async approveApplication(applicationId: string): Promise<Application> {
    const { data, error } = await this.supabase
      .from('applications')
      .update({
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) handleSupabaseError(error, '신청 승인');
    return data!;
  }

  /**
   * 신청 확정 (with recruitment count update)
   * RPC 함수를 통해 트랜잭션으로 처리
   * @param confirmedBy - 'GUEST' (기본값) 또는 'HOST'. HOST인 경우 알림이 발송되지 않음
   */
  async confirmApplication(applicationId: string, confirmedBy: 'GUEST' | 'HOST' = 'GUEST'): Promise<Application> {
    // 먼저 신청 정보 조회하여 participants_info 추출
    const application = await this.getApplicationById(applicationId);
    const positions = extractPositionsFromParticipants(application.participants_info);

    // RPC 함수 호출 (신청 확정 + count 업데이트)
    // Note: RPC 타입은 마이그레이션 후 database.types.ts에 추가됨
    const { error } = await (this.supabase.rpc as CallableFunction)(
      'confirm_application_with_count',
      {
        p_application_id: applicationId,
        p_positions: positions.length > 0 ? positions : null,
        p_confirmed_by: confirmedBy,
      }
    );

    if (error) {
      // RPC 함수가 없는 경우 fallback
      if (error.code === '42883') {
        console.warn('RPC function not found, using legacy method');
        return this.updateApplicationStatus(applicationId, 'CONFIRMED');
      }
      handleSupabaseError(error, '신청 확정');
    }

    // 업데이트된 신청 정보 다시 조회
    return this.getApplicationById(applicationId);
  }

  /**
   * 신청 거절
   */
  async rejectApplication(applicationId: string) {
    return this.updateApplicationStatus(applicationId, 'REJECTED');
  }

  /**
   * 신청 취소 (with recruitment count update)
   * RPC 함수를 통해 트랜잭션으로 처리
   */
  async cancelApplication(applicationId: string, options?: CancelOptions): Promise<Application> {
    // 먼저 신청 정보 조회하여 participants_info 추출
    const application = await this.getApplicationById(applicationId);
    const positions = extractPositionsFromParticipants(application.participants_info);

    // cancel 메타데이터를 RPC 호출 전에 먼저 설정
    // (RPC가 status를 CANCELED로 변경할 때 트리거가 canceled_by를 참조하므로)
    if (options?.cancelType || options?.canceledBy || options?.cancelReason) {
      await this.supabase
        .from('applications')
        .update({
          ...(options.cancelType && { cancel_type: options.cancelType }),
          ...(options.canceledBy && { canceled_by: options.canceledBy }),
          ...(options.cancelReason && { cancel_reason: options.cancelReason }),
        })
        .eq('id', applicationId);
    }

    // RPC 함수 호출 (신청 취소 + count 감소)
    // 이 시점에 canceled_by가 이미 설정되어 있으므로 트리거가 올바른 알림 생성
    const { error } = await (this.supabase.rpc as CallableFunction)(
      'cancel_application_with_count',
      {
        p_application_id: applicationId,
        p_positions: positions.length > 0 ? positions : null,
      }
    );

    if (error) {
      // RPC 함수가 없는 경우 fallback
      if (error.code === '42883') {
        console.warn('RPC function not found, using legacy method');
        const { data, error: updateError } = await this.supabase
          .from('applications')
          .update({
            status: 'CANCELED',
            updated_at: new Date().toISOString(),
            ...(options?.cancelType && { cancel_type: options.cancelType }),
            ...(options?.canceledBy && { canceled_by: options.canceledBy }),
            ...(options?.cancelReason && { cancel_reason: options.cancelReason }),
          })
          .eq('id', applicationId)
          .select()
          .single();

        if (updateError) handleSupabaseError(updateError, '신청 취소');
        return data!;
      }
      handleSupabaseError(error, '신청 취소');
    }

    // 업데이트된 신청 정보 다시 조회
    return this.getApplicationById(applicationId);
  }
}

/**
 * ApplicationService 팩토리 함수
 */
export function createApplicationService(supabase: SupabaseClient<Database>) {
  return new ApplicationService(supabase);
}
