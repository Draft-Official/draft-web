/**
 * Team Fees API
 * 팀 회비 관리 관련 DB 접근
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, TeamFee, TeamFeeInsert } from '@/shared/types/database.types';
import { handleSupabaseError } from '@/shared/lib/errors';
import type { UpdateFeeStatusInput } from '../../model/types';

// DB row 타입 (users 조인 포함)
export type TeamFeeWithUser = TeamFee & {
  users?: {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
  } | null;
};

// ============================================
// Team Fees
// ============================================

/**
 * 팀 회비 목록 조회 (특정 월)
 */
export async function getTeamFees(
  supabase: SupabaseClient<Database>,
  teamId: string,
  yearMonth: string
): Promise<TeamFeeWithUser[]> {
  const { data, error } = await supabase
    .from('team_fees')
    .select('*, users!user_id(id, nickname, avatar_url)')
    .eq('team_id', teamId)
    .eq('year_month', yearMonth)
    .order('created_at', { ascending: true });

  if (error) handleSupabaseError(error, '회비 목록');
  return data || [];
}

/**
 * 특정 사용자의 회비 상태 조회
 */
export async function getMyFeeStatus(
  supabase: SupabaseClient<Database>,
  teamId: string,
  userId: string,
  yearMonth: string
): Promise<TeamFee | null> {
  const { data, error } = await supabase
    .from('team_fees')
    .select('*')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .eq('year_month', yearMonth)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error, '내 회비 상태');
  }

  return data;
}

/**
 * 회비 상태 업데이트 (납부/미납)
 */
export async function updateFeeStatus(
  supabase: SupabaseClient<Database>,
  updatedBy: string,
  input: UpdateFeeStatusInput
): Promise<TeamFee> {
  // 기존 레코드 확인
  const existing = await getMyFeeStatus(
    supabase,
    input.teamId,
    input.userId,
    input.yearMonth
  );

  if (existing) {
    // 업데이트
    const { data, error } = await supabase
      .from('team_fees')
      .update({
        is_paid: input.isPaid,
        paid_at: input.isPaid ? new Date().toISOString() : null,
        updated_by: updatedBy,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) handleSupabaseError(error, '회비 상태 수정');
    return data!;
  } else {
    // 생성
    const feeInsert: TeamFeeInsert = {
      team_id: input.teamId,
      user_id: input.userId,
      year_month: input.yearMonth,
      is_paid: input.isPaid,
      paid_at: input.isPaid ? new Date().toISOString() : null,
      updated_by: updatedBy,
    };

    const { data, error } = await supabase
      .from('team_fees')
      .insert(feeInsert)
      .select()
      .single();

    if (error) handleSupabaseError(error, '회비 레코드 생성');
    return data!;
  }
}

/**
 * 팀 회비 요약 조회
 */
export async function getFeeSummary(
  supabase: SupabaseClient<Database>,
  teamId: string,
  yearMonth: string
): Promise<{ total: number; paid: number; unpaid: number }> {
  // 팀원 수 조회
  const { count: totalCount, error: memberError } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId)
    .eq('status', 'ACCEPTED');

  if (memberError) handleSupabaseError(memberError, '팀원 수');

  // 납부 현황 조회
  const { data: fees, error: feeError } = await supabase
    .from('team_fees')
    .select('is_paid')
    .eq('team_id', teamId)
    .eq('year_month', yearMonth);

  if (feeError) handleSupabaseError(feeError, '회비 현황');

  const paidCount = (fees || []).filter((f) => f.is_paid).length;

  return {
    total: totalCount || 0,
    paid: paidCount,
    unpaid: (totalCount || 0) - paidCount,
  };
}

/**
 * 팀원들의 회비 레코드 일괄 생성 (새 달 시작 시)
 */
export async function initializeMonthlyFees(
  supabase: SupabaseClient<Database>,
  teamId: string,
  yearMonth: string
): Promise<TeamFee[]> {
  // 팀원 목록 조회
  const { data: members, error: memberError } = await supabase
    .from('team_members')
    .select('user_id')
    .eq('team_id', teamId)
    .eq('status', 'ACCEPTED');

  if (memberError) handleSupabaseError(memberError, '팀원 목록');
  if (!members || members.length === 0) return [];

  // 이미 존재하는 레코드 확인
  const { data: existingFees, error: feeError } = await supabase
    .from('team_fees')
    .select('user_id')
    .eq('team_id', teamId)
    .eq('year_month', yearMonth);

  if (feeError) handleSupabaseError(feeError, '기존 회비 확인');

  const existingUserIds = new Set((existingFees || []).map((f) => f.user_id));

  // 새로 생성할 레코드
  const newFees: TeamFeeInsert[] = members
    .filter((m) => !existingUserIds.has(m.user_id))
    .map((m) => ({
      team_id: teamId,
      user_id: m.user_id,
      year_month: yearMonth,
      is_paid: false,
    }));

  if (newFees.length === 0) return [];

  const { data, error } = await supabase
    .from('team_fees')
    .insert(newFees)
    .select();

  if (error) handleSupabaseError(error, '회비 레코드 생성');
  return data || [];
}
