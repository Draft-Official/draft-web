/**
 * Team Membership API
 * 팀원 관리 관련 DB 접근
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, TeamMember } from '@/shared/types/database.types';
import { handleSupabaseError } from '@/shared/lib/errors';
import type { TeamRoleValue } from '@/shared/config/team-constants';

// DB row 타입 (users 조인 포함)
export type TeamMemberWithUser = TeamMember & {
  users?: {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
    positions: string[] | null;
  } | null;
};

// ============================================
// Team Members
// ============================================

/**
 * 팀원 목록 조회 (활성 팀원만)
 */
export async function getTeamMembers(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<TeamMemberWithUser[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*, users(id, nickname, avatar_url, positions)')
    .eq('team_id', teamId)
    .eq('status', 'ACCEPTED')
    .order('joined_at', { ascending: true });

  if (error) handleSupabaseError(error, '팀원 목록');
  return data || [];
}

/**
 * 가입 대기자 목록 조회
 */
export async function getPendingMembers(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<TeamMemberWithUser[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*, users(id, nickname, avatar_url, positions)')
    .eq('team_id', teamId)
    .eq('status', 'PENDING')
    .order('id', { ascending: true });

  if (error) handleSupabaseError(error, '가입 대기자 목록');
  return data || [];
}

/**
 * 특정 사용자의 팀 멤버십 조회
 */
export async function getMembership(
  supabase: SupabaseClient<Database>,
  teamId: string,
  userId: string
): Promise<TeamMember | null> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    handleSupabaseError(error, '멤버십 조회');
  }

  return data;
}

/**
 * 팀 가입 신청
 */
export async function createJoinRequest(
  supabase: SupabaseClient<Database>,
  teamId: string,
  userId: string
): Promise<TeamMember> {
  // 이미 존재하는지 확인
  const existing = await getMembership(supabase, teamId, userId);
  if (existing) {
    if (existing.status === 'ACCEPTED') {
      throw new Error('이미 팀원입니다');
    }
    if (existing.status === 'PENDING') {
      throw new Error('이미 가입 신청 중입니다');
    }
    // REJECTED인 경우 다시 신청 가능 - 기존 레코드 업데이트
    const { data, error } = await supabase
      .from('team_members')
      .update({ status: 'PENDING' })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) handleSupabaseError(error, '가입 재신청');
    return data!;
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: userId,
      role: 'MEMBER',
      status: 'PENDING',
    })
    .select()
    .single();

  if (error) handleSupabaseError(error, '가입 신청');
  return data!;
}

/**
 * 가입 신청 승인
 */
export async function approveJoinRequest(
  supabase: SupabaseClient<Database>,
  membershipId: string
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .update({
      status: 'ACCEPTED',
      joined_at: new Date().toISOString(),
    })
    .eq('id', membershipId)
    .eq('status', 'PENDING')
    .select()
    .single();

  if (error) handleSupabaseError(error, '가입 승인');
  return data!;
}

/**
 * 가입 신청 거절
 */
export async function rejectJoinRequest(
  supabase: SupabaseClient<Database>,
  membershipId: string
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .update({ status: 'REJECTED' })
    .eq('id', membershipId)
    .eq('status', 'PENDING')
    .select()
    .single();

  if (error) handleSupabaseError(error, '가입 거절');
  return data!;
}

/**
 * 팀원 역할 변경
 */
export async function updateMemberRole(
  supabase: SupabaseClient<Database>,
  membershipId: string,
  newRole: TeamRoleValue
): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .update({ role: newRole })
    .eq('id', membershipId)
    .eq('status', 'ACCEPTED')
    .select()
    .single();

  if (error) handleSupabaseError(error, '역할 변경');
  return data!;
}

/**
 * 팀원 강퇴 (삭제)
 */
export async function removeMember(
  supabase: SupabaseClient<Database>,
  membershipId: string
): Promise<void> {
  // 팀장은 강퇴할 수 없음 - 호출 전에 체크해야 함
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', membershipId);

  if (error) handleSupabaseError(error, '팀원 강퇴');
}

/**
 * 팀 탈퇴 (자발적)
 */
export async function leaveTeam(
  supabase: SupabaseClient<Database>,
  teamId: string,
  userId: string
): Promise<void> {
  // 팀장은 탈퇴 전 권한 이전 필요 - 호출 전에 체크해야 함
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);

  if (error) handleSupabaseError(error, '팀 탈퇴');
}

/**
 * 팀장 권한 이전
 */
export async function transferLeadership(
  supabase: SupabaseClient<Database>,
  teamId: string,
  currentLeaderId: string,
  newLeaderId: string
): Promise<void> {
  // 새 팀장이 팀원인지 확인
  const newLeaderMembership = await getMembership(supabase, teamId, newLeaderId);
  if (!newLeaderMembership || newLeaderMembership.status !== 'ACCEPTED') {
    throw new Error('유효한 팀원만 팀장이 될 수 있습니다');
  }

  // 트랜잭션으로 처리해야 하지만 Supabase JS 클라이언트에서는 제한적
  // 순차적으로 업데이트

  // 1. 기존 팀장을 일반 팀원으로
  const { error: error1 } = await supabase
    .from('team_members')
    .update({ role: 'MEMBER' })
    .eq('team_id', teamId)
    .eq('user_id', currentLeaderId)
    .eq('role', 'LEADER');

  if (error1) handleSupabaseError(error1, '팀장 권한 해제');

  // 2. 새 팀장으로 지정
  const { error: error2 } = await supabase
    .from('team_members')
    .update({ role: 'LEADER' })
    .eq('team_id', teamId)
    .eq('user_id', newLeaderId);

  if (error2) {
    // 롤백 시도
    await supabase
      .from('team_members')
      .update({ role: 'LEADER' })
      .eq('team_id', teamId)
      .eq('user_id', currentLeaderId);
    handleSupabaseError(error2, '새 팀장 지정');
  }
}

/**
 * 팀원 수 조회
 */
export async function getTeamMemberCount(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('team_members')
    .select('*', { count: 'exact', head: true })
    .eq('team_id', teamId)
    .eq('status', 'ACCEPTED');

  if (error) handleSupabaseError(error, '팀원 수');
  return count ?? 0;
}
