/**
 * Team Service
 * 팀 관련 모든 DB 접근을 캡슐화
 * - Core: 팀 CRUD
 * - Membership: 팀원 관리
 * - Match: 팀 운동 및 투표
 * - Fees: 회비 관리
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  Team,
  TeamInsert,
  TeamUpdate,
  TeamMember,
  TeamFee,
  TeamFeeInsert,
  Match,
  MatchInsert,
  Application,
  ParticipantInfo,
} from '@/shared/types/database.types';
import type { AccountInfo, OperationInfo } from '@/shared/types/jsonb.types';
import { handleSupabaseError, ValidationError } from '@/shared/lib/errors';
import type { TeamRoleValue, TeamVoteStatusValue } from '@/shared/config/team-constants';
import type { PositionValue } from '@/shared/config/match-constants';
import { toKSTDateTimeISO } from '@/shared/lib/datetime';
import type {
  CreateTeamInput,
  UpdateTeamInput,
  CreateTeamMatchInput,
  VoteInput,
  VotingSummary,
  UpdateFeeStatusInput,
} from '../model/types';

// DB row types (users 조인 포함)
export type TeamMemberWithUserRow = TeamMember & {
  users?: {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
    positions: string[] | null;
    metadata: Database['public']['Tables']['users']['Row']['metadata'];
  } | null;
};

export type TeamFeeWithUserRow = TeamFee & {
  users?: {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
  } | null;
};

type TeamVoteWithUserRow = Application & {
  users?: {
    positions: string[] | null;
  } | null;
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const HAS_TIMEZONE_PATTERN = /(Z|[+-]\d{2}:\d{2})$/i;
const LOCAL_DATETIME_PATTERN = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})(?::\d{2})?$/;
const TEAM_VOTE_POSITION_SET = new Set<PositionValue>(['G', 'F', 'C', 'B']);

function normalizeMatchDateTimeInput(value: string): string {
  if (HAS_TIMEZONE_PATTERN.test(value)) return value;

  const match = value.match(LOCAL_DATETIME_PATTERN);
  if (!match) return value;

  return toKSTDateTimeISO(match[1], match[2]);
}

function normalizeTeamVotePosition(position: string | null | undefined): PositionValue {
  if (!position) return 'G';
  const upper = position.toUpperCase() as PositionValue;
  return TEAM_VOTE_POSITION_SET.has(upper) ? upper : 'G';
}

function parseTeamVoteParticipants(
  participantsInfo: Application['participants_info'] | null | undefined
): ParticipantInfo[] {
  if (!participantsInfo || !Array.isArray(participantsInfo)) return [];

  return (participantsInfo as ParticipantInfo[]).filter(
    (participant) =>
      participant &&
      (participant.type === 'MAIN' || participant.type === 'GUEST') &&
      typeof participant.position === 'string'
  );
}

function countTeamVoteParticipants(
  participantsInfo: Application['participants_info'] | null | undefined
): number {
  const participants = parseTeamVoteParticipants(participantsInfo);
  if (participants.length === 0) return 1;

  const hasMainParticipant = participants.some((participant) => participant.type === 'MAIN');
  if (!hasMainParticipant) return participants.length + 1;

  return participants.length;
}

export class TeamService {
  constructor(private supabase: SupabaseClient<Database>) {}

  private async assertPhoneVerified(userId: string, actionLabel: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('users')
      .select('phone_verified')
      .eq('id', userId)
      .maybeSingle();

    if (error) handleSupabaseError(error, '사용자 인증 정보');

    if (!data?.phone_verified) {
      throw new ValidationError(`전화번호 인증 후 ${actionLabel}이 가능합니다.`);
    }
  }

  // ============================================
  // Core - Team CRUD
  // ============================================

  /**
   * 팀 ID로 팀 정보 조회
   */
  async getTeam(teamId: string): Promise<Team | null> {
    const { data, error } = await this.supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error, '팀 정보');
    }

    return data;
  }

  /**
   * 팀 코드로 팀 정보 조회 (gym join 포함)
   */
  async getTeamByCode(code: string): Promise<(Team & { gyms?: { name: string; address: string | null } | null }) | null> {
    const { data, error } = await this.supabase
      .from('teams')
      .select('*, gyms(name, address)')
      .eq('code', code)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error, '팀 정보');
    }

    return data;
  }

  /**
   * 팀 코드 중복 체크
   */
  async checkTeamCodeExists(code: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('code', code);

    if (error) handleSupabaseError(error, '팀 코드 확인');
    return (count ?? 0) > 0;
  }

  /**
   * 팀 생성
   * DB Trigger(trg_add_team_leader)가 자동으로 생성자를 LEADER로 추가함
   */
  async createTeam(_userId: string, input: CreateTeamInput): Promise<Team> {
    const teamInsert = {
      code: input.code,
      name: input.name,
      short_intro: input.shortIntro,
      description: input.description,
      logo_url: input.logoUrl,
      region_depth1: input.regionDepth1,
      region_depth2: input.regionDepth2,
      home_gym_id: input.homeGymId,
      regular_day: input.regularDays ?? [],
      regular_start_time: input.regularStartTime,
      regular_end_time: input.regularEndTime,
      team_gender: input.teamGender,
      level_range: input.levelRange,
      age_range: input.ageRange,
      account_info: input.accountInfo,
      operation_info: input.operationInfo,
    } as TeamInsert;

    const { data: team, error: teamError } = await this.supabase
      .from('teams')
      .insert(teamInsert)
      .select()
      .single();

    if (teamError) handleSupabaseError(teamError, '팀 생성');

    return team!;
  }

  /**
   * 팀 정보 수정
   */
  async updateTeam(teamId: string, input: UpdateTeamInput): Promise<Team & { gyms?: { name: string } | null }> {
    const teamUpdate: TeamUpdate = {};

    if (input.name !== undefined) teamUpdate.name = input.name;
    if (input.shortIntro !== undefined) teamUpdate.short_intro = input.shortIntro;
    if (input.description !== undefined) teamUpdate.description = input.description;
    if (input.logoUrl !== undefined) teamUpdate.logo_url = input.logoUrl;
    if (input.regionDepth1 !== undefined) teamUpdate.region_depth1 = input.regionDepth1;
    if (input.regionDepth2 !== undefined) teamUpdate.region_depth2 = input.regionDepth2;
    if (input.homeGymId !== undefined) teamUpdate.home_gym_id = input.homeGymId;
    if (input.regularDays !== undefined) {
      teamUpdate.regular_day = input.regularDays ?? [];
    }
    if (input.regularStartTime !== undefined) {
      (teamUpdate as Record<string, unknown>).regular_start_time = input.regularStartTime;
    }
    if (input.regularEndTime !== undefined) {
      (teamUpdate as Record<string, unknown>).regular_end_time = input.regularEndTime;
    }
    if (input.teamGender !== undefined) teamUpdate.team_gender = input.teamGender;
    if (input.levelRange !== undefined) {
      teamUpdate.level_range = input.levelRange as unknown as TeamUpdate['level_range'];
    }
    if (input.ageRange !== undefined) {
      teamUpdate.age_range = input.ageRange as unknown as TeamUpdate['age_range'];
    }
    if (input.isRecruiting !== undefined) teamUpdate.is_recruiting = input.isRecruiting;
    if (input.accountInfo !== undefined) {
      teamUpdate.account_info = input.accountInfo as unknown as TeamUpdate['account_info'];
    }
    if (input.operationInfo !== undefined) {
      teamUpdate.operation_info = input.operationInfo as unknown as TeamUpdate['operation_info'];
    }

    const { data, error } = await this.supabase
      .from('teams')
      .update(teamUpdate)
      .eq('id', teamId)
      .select('*, gyms(name)')
      .single();

    if (error) handleSupabaseError(error, '팀 정보 수정');
    return data!;
  }

  /**
   * 팀 운영 정보 수정
   */
  async updateTeamDefaults(
    teamId: string,
    updates: {
      accountInfo?: AccountInfo | null;
      operationInfo?: Partial<OperationInfo> | null;
    }
  ): Promise<Team> {
    const teamUpdate: TeamUpdate = {};

    if (updates.accountInfo !== undefined) {
      teamUpdate.account_info = updates.accountInfo as unknown as TeamUpdate['account_info'];
    }
    if (updates.operationInfo !== undefined) {
      teamUpdate.operation_info = updates.operationInfo as unknown as TeamUpdate['operation_info'];
    }

    const { data, error } = await this.supabase
      .from('teams')
      .update(teamUpdate)
      .eq('id', teamId)
      .select()
      .single();

    if (error) handleSupabaseError(error, '팀 운영 정보 수정');
    return data!;
  }

  /**
   * 팀 삭제
   */
  async deleteTeam(teamId: string): Promise<void> {
    const { error } = await this.supabase.from('teams').delete().eq('id', teamId);

    if (error) handleSupabaseError(error, '팀 삭제');
  }

  /**
   * 현재 사용자가 속한 팀 목록 조회 (역할 정보 + 체육관 정보 포함)
   */
  async getMyTeams(userId: string): Promise<(Team & { role: TeamRoleValue; home_gym_name: string | null })[]> {
    const { data, error } = await this.supabase
      .from('team_members')
      .select('role, teams(*, gyms(name))')
      .eq('user_id', userId)
      .eq('status', 'ACCEPTED');

    if (error) handleSupabaseError(error, '내 팀 목록');

    return (data || [])
      .filter((item) => item.teams !== null)
      .map((item) => {
        const team = item.teams as Team & { gyms?: { name: string } | null };
        return {
          ...team,
          role: (item.role as TeamRoleValue) || 'MEMBER',
          home_gym_name: team.gyms?.name ?? null,
        };
      });
  }

  // ============================================
  // Membership - Team Member Management
  // ============================================

  /**
   * 팀원 목록 조회 (활성 팀원만)
   */
  async getTeamMembers(teamId: string): Promise<TeamMemberWithUserRow[]> {
    const { data, error } = await this.supabase
      .from('team_members')
      .select('*, users(id, nickname, avatar_url, positions, metadata)')
      .eq('team_id', teamId)
      .eq('status', 'ACCEPTED')
      .order('joined_at', { ascending: true });

    if (error) handleSupabaseError(error, '팀원 목록');
    return data || [];
  }

  /**
   * 가입 대기자 목록 조회
   */
  async getPendingMembers(teamId: string): Promise<TeamMemberWithUserRow[]> {
    const { data, error } = await this.supabase
      .from('team_members')
      .select('*, users(id, nickname, avatar_url, positions, metadata)')
      .eq('team_id', teamId)
      .eq('status', 'PENDING')
      .order('id', { ascending: true });

    if (error) handleSupabaseError(error, '가입 대기자 목록');
    return data || [];
  }

  /**
   * 특정 사용자의 팀 멤버십 조회
   */
  async getMembership(teamId: string, userId: string): Promise<TeamMember | null> {
    const { data, error } = await this.supabase
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
  async createJoinRequest(teamId: string, userId: string): Promise<TeamMember> {
    const existing = await this.getMembership(teamId, userId);
    if (existing) {
      if (existing.status === 'ACCEPTED') {
        throw new Error('이미 팀원입니다');
      }
      if (existing.status === 'PENDING') {
        throw new Error('이미 가입 신청 중입니다');
      }
      // REJECTED인 경우 다시 신청 가능
      const { data, error } = await this.supabase
        .from('team_members')
        .update({ status: 'PENDING' })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) handleSupabaseError(error, '가입 재신청');
      return data!;
    }

    const { data, error } = await this.supabase
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
  async approveJoinRequest(membershipId: string): Promise<TeamMember> {
    const { data, error } = await this.supabase
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
  async rejectJoinRequest(membershipId: string): Promise<TeamMember> {
    const { data, error } = await this.supabase
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
  async updateMemberRole(membershipId: string, newRole: TeamRoleValue): Promise<TeamMember> {
    const { data, error } = await this.supabase
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
  async removeMember(membershipId: string): Promise<void> {
    const { error } = await this.supabase
      .from('team_members')
      .delete()
      .eq('id', membershipId);

    if (error) handleSupabaseError(error, '팀원 강퇴');
  }

  /**
   * 팀 탈퇴 (자발적)
   */
  async leaveTeam(teamId: string, userId: string): Promise<void> {
    const { error } = await this.supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) handleSupabaseError(error, '팀 탈퇴');
  }

  /**
   * 팀장 권한 이전
   */
  async transferLeadership(teamId: string, currentLeaderId: string, newLeaderId: string): Promise<void> {
    if (currentLeaderId === newLeaderId) {
      throw new Error('현재 팀장에게 다시 위임할 수 없습니다');
    }

    const newLeaderMembership = await this.getMembership(teamId, newLeaderId);
    if (!newLeaderMembership || newLeaderMembership.status !== 'ACCEPTED') {
      throw new Error('유효한 팀원만 팀장이 될 수 있습니다');
    }

    // NOTE:
    // RLS 정책상 현재 사용자가 LEADER 권한을 유지해야 다른 멤버를 LEADER로 업데이트할 수 있다.
    // 따라서 기존 팀장을 먼저 MEMBER로 내리면 다음 승격 쿼리가 권한 부족으로 실패한다.
    // 순서를 "신규 팀장 승격 -> 기존 팀장 강등"으로 유지한다.
    const { error: promoteError } = await this.supabase
      .from('team_members')
      .update({ role: 'LEADER' })
      .eq('team_id', teamId)
      .eq('user_id', newLeaderId)
      .eq('status', 'ACCEPTED');

    if (promoteError) handleSupabaseError(promoteError, '새 팀장 지정');

    const { error: demoteError } = await this.supabase
      .from('team_members')
      .update({ role: 'MEMBER' })
      .eq('team_id', teamId)
      .eq('user_id', currentLeaderId)
      .eq('role', 'LEADER');

    if (demoteError) {
      const { error: rollbackError } = await this.supabase
        .from('team_members')
        .update({ role: newLeaderMembership.role })
        .eq('team_id', teamId)
        .eq('user_id', newLeaderId);

      if (rollbackError) {
        handleSupabaseError(rollbackError, '팀장 위임 롤백');
      }

      handleSupabaseError(demoteError, '기존 팀장 권한 해제');
    }
  }

  /**
   * 팀원 수 조회
   */
  async getTeamMemberCount(teamId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .eq('status', 'ACCEPTED');

    if (error) handleSupabaseError(error, '팀원 수');
    return count ?? 0;
  }

  // ============================================
  // Fees - Team Fee Management
  // ============================================

  /**
   * 팀 회비 목록 조회 (특정 월)
   */
  async getTeamFees(teamId: string, yearMonth: string): Promise<TeamFeeWithUserRow[]> {
    const { data, error } = await this.supabase
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
  async getMyFeeStatus(teamId: string, userId: string, yearMonth: string): Promise<TeamFee | null> {
    const { data, error } = await this.supabase
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
  async updateFeeStatus(updatedBy: string, input: UpdateFeeStatusInput): Promise<TeamFee> {
    const existing = await this.getMyFeeStatus(input.teamId, input.userId, input.yearMonth);

    if (existing) {
      const { data, error } = await this.supabase
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
      const feeInsert: TeamFeeInsert = {
        team_id: input.teamId,
        user_id: input.userId,
        year_month: input.yearMonth,
        is_paid: input.isPaid,
        paid_at: input.isPaid ? new Date().toISOString() : null,
        updated_by: updatedBy,
      };

      const { data, error } = await this.supabase
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
  async getFeeSummary(teamId: string, yearMonth: string): Promise<{ total: number; paid: number; unpaid: number }> {
    const { count: totalCount, error: memberError } = await this.supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('team_id', teamId)
      .eq('status', 'ACCEPTED');

    if (memberError) handleSupabaseError(memberError, '팀원 수');

    const { data: fees, error: feeError } = await this.supabase
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
  async initializeMonthlyFees(teamId: string, yearMonth: string): Promise<TeamFee[]> {
    const { data: members, error: memberError } = await this.supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId)
      .eq('status', 'ACCEPTED');

    if (memberError) handleSupabaseError(memberError, '팀원 목록');
    if (!members || members.length === 0) return [];

    const { data: existingFees, error: feeError } = await this.supabase
      .from('team_fees')
      .select('user_id')
      .eq('team_id', teamId)
      .eq('year_month', yearMonth);

    if (feeError) handleSupabaseError(feeError, '기존 회비 확인');

    const existingUserIds = new Set((existingFees || []).map((f) => f.user_id));

    const newFees: TeamFeeInsert[] = members
      .filter((m) => !existingUserIds.has(m.user_id))
      .map((m) => ({
        team_id: teamId,
        user_id: m.user_id,
        year_month: yearMonth,
        is_paid: false,
      }));

    if (newFees.length === 0) return [];

    const { data, error } = await this.supabase
      .from('team_fees')
      .insert(newFees)
      .select();

    if (error) handleSupabaseError(error, '회비 레코드 생성');
    return data || [];
  }

  // ============================================
  // Match - Team Match & Voting
  // ============================================

  /**
   * 팀 매치 생성
   * - 매치 생성 후 모든 팀원에게 PENDING 상태의 투표(application) 생성
   */
  async createTeamMatch(hostId: string, input: CreateTeamMatchInput): Promise<Match> {
    await this.assertPhoneVerified(hostId, '팀 운동 개설');

    const matchInsert: MatchInsert = {
      team_id: input.teamId,
      host_id: hostId,
      match_type: 'TEAM_MATCH',
      start_time: normalizeMatchDateTimeInput(input.startTime),
      end_time: normalizeMatchDateTimeInput(input.endTime),
      gym_id: input.gymId,
      cost_type: input.costType || 'FREE',
      cost_amount: input.costAmount,
      match_format: input.matchFormat || 'FIVE_ON_FIVE',
      gender_rule: input.genderRule || 'MIXED',
      match_rule: input.matchRule as MatchInsert['match_rule'],
      operation_info: input.operationInfo as MatchInsert['operation_info'],
      manual_team_name: '',
      status: 'RECRUITING',
      recruitment_setup: {
        type: 'ANY',
        max_count: 0,
        current_count: 0,
      },
    };

    const { data, error } = await this.supabase
      .from('matches')
      .insert(matchInsert)
      .select()
      .single();

    if (error) handleSupabaseError(error, '팀 운동 생성');

    const match = data!;

    await this.createVotesForAllMembers(match.id, input.teamId);

    return match;
  }

  /**
   * 특정 경기에 모든 팀원의 투표(application) 생성
   */
  private async createVotesForAllMembers(matchId: string, teamId: string): Promise<void> {
    const members = await this.getTeamMembers(teamId);

    if (members.length === 0) return;

    const applications = members.map((member) => ({
      match_id: matchId,
      user_id: member.user_id,
      source: 'TEAM_VOTE' as const,
      status: 'PENDING' as const,
      participants_info: [
        {
          type: 'MAIN',
          name: '',
          position: normalizeTeamVotePosition(member.users?.positions?.[0]),
        },
      ] as unknown as Application['participants_info'],
    }));

    const { error } = await this.supabase.from('applications').insert(applications);

    if (error) handleSupabaseError(error, '팀원 투표 생성');
  }

  /**
   * 새 팀원에게 진행 중인 경기들의 투표(application) 생성
   */
  async createVotesForNewMember(teamId: string, userId: string): Promise<void> {
    const { data: upcomingMatches, error: matchError } = await this.supabase
      .from('matches')
      .select('id')
      .eq('team_id', teamId)
      .eq('match_type', 'TEAM_MATCH')
      .gte('start_time', new Date().toISOString());

    if (matchError) handleSupabaseError(matchError, '진행 중 경기 조회');

    if (!upcomingMatches || upcomingMatches.length === 0) return;

    const { data: user, error: userError } = await this.supabase
      .from('users')
      .select('positions')
      .eq('id', userId)
      .single();

    if (userError) handleSupabaseError(userError, '사용자 포지션 조회');

    const defaultMainPosition = normalizeTeamVotePosition(user?.positions?.[0]);

    const applications = upcomingMatches.map((match) => ({
      match_id: match.id,
      user_id: userId,
      source: 'TEAM_VOTE' as const,
      status: 'PENDING' as const,
      participants_info: [
        {
          type: 'MAIN',
          name: '',
          position: defaultMainPosition,
        },
      ] as unknown as Application['participants_info'],
    }));

    const { error } = await this.supabase.from('applications').insert(applications);

    if (error) handleSupabaseError(error, '새 팀원 투표 생성');
  }

  /**
   * 팀 매치 목록 조회
   */
  async getTeamMatches(
    teamId: string,
    options?: {
      upcoming?: boolean;
      limit?: number;
    }
  ): Promise<Match[]> {
    let query = this.supabase
      .from('matches')
      .select('*, gyms(*)')
      .eq('team_id', teamId)
      .eq('match_type', 'TEAM_MATCH')
      .order('start_time', { ascending: false });

    if (options?.upcoming) {
      query = query.gte('start_time', new Date().toISOString());
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) handleSupabaseError(error, '팀 운동 목록');
    return data || [];
  }

  /**
   * 팀 매치 상세 조회
   */
  async getTeamMatch(identifier: string, teamId?: string | null): Promise<Match | null> {
    const isUuidIdentifier = UUID_REGEX.test(identifier);

    let query = this.supabase
      .from('matches')
      .select('*, gyms(*), teams(*)')
      .eq('match_type', 'TEAM_MATCH');

    query = isUuidIdentifier
      ? query.eq('id', identifier)
      : query.eq('short_id', identifier);

    if (teamId) {
      query = query.eq('team_id', teamId);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error, '팀 운동 상세');
    }

    return data;
  }

  /**
   * 팀 투표 생성/수정
   */
  async upsertTeamVote(userId: string, input: VoteInput): Promise<Application> {
    const { data: existing } = await this.supabase
      .from('applications')
      .select('*')
      .eq('match_id', input.matchId)
      .eq('user_id', userId)
      .eq('source', 'TEAM_VOTE')
      .single();

    const { data: match } = await this.supabase
      .from('matches')
      .select('status')
      .eq('id', input.matchId)
      .single();

    if (match?.status === 'CLOSED') {
      throw new Error('투표가 마감되었습니다');
    }

    const statusMap: Record<TeamVoteStatusValue, string> = {
      PENDING: 'PENDING',
      CONFIRMED: 'CONFIRMED',
      LATE: 'LATE',
      NOT_ATTENDING: 'NOT_ATTENDING',
      MAYBE: 'MAYBE',
    };

    const applicationStatus = statusMap[input.status];

    if (existing) {
      const { data, error } = await this.supabase
        .from('applications')
        .update({
          status: applicationStatus as Application['status'],
          description: input.description || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) handleSupabaseError(error, '투표 수정');
      return data!;
    } else {
      const { data, error } = await this.supabase
        .from('applications')
        .insert({
          match_id: input.matchId,
          user_id: userId,
          source: 'TEAM_VOTE',
          status: applicationStatus as Application['status'],
          description: input.description || null,
        })
        .select()
        .single();

      if (error) handleSupabaseError(error, '투표 생성');
      return data!;
    }
  }

  /**
   * 팀 투표 참여자에 게스트 추가
   * - 게스트 상태는 대표 참여자(application.status)를 그대로 상속
   */
  async addGuestToTeamVote(
    matchId: string,
    ownerUserId: string,
    input: {
      name: string;
      position: PositionValue;
    }
  ): Promise<Application> {
    const guestName = input.name.trim();
    if (!guestName) {
      throw new ValidationError('게스트 이름을 입력해주세요');
    }

    const { data: match, error: matchError } = await this.supabase
      .from('matches')
      .select('status')
      .eq('id', matchId)
      .single();

    if (matchError) handleSupabaseError(matchError, '경기 상태 조회');

    if (match?.status === 'CLOSED') {
      throw new ValidationError('투표가 마감된 경기에는 게스트를 추가할 수 없습니다');
    }

    const { data: voteRow, error: voteError } = await this.supabase
      .from('applications')
      .select('*, users(positions)')
      .eq('match_id', matchId)
      .eq('user_id', ownerUserId)
      .eq('source', 'TEAM_VOTE')
      .single();

    if (voteError) {
      if (voteError.code === 'PGRST116') {
        throw new ValidationError('내 투표 정보를 찾을 수 없습니다');
      }
      handleSupabaseError(voteError, '게스트 추가 대상 조회');
    }

    const typedVoteRow = voteRow as TeamVoteWithUserRow;
    const currentParticipants = parseTeamVoteParticipants(typedVoteRow.participants_info);
    const hasMainParticipant = currentParticipants.some((participant) => participant.type === 'MAIN');

    const nextParticipants: ParticipantInfo[] = hasMainParticipant
      ? [...currentParticipants]
      : [
          {
            type: 'MAIN',
            name: '',
            position: normalizeTeamVotePosition(typedVoteRow.users?.positions?.[0]),
          },
          ...currentParticipants,
        ];

    nextParticipants.push({
      type: 'GUEST',
      name: guestName,
      position: normalizeTeamVotePosition(input.position),
    });

    const { data: updatedVote, error: updateError } = await this.supabase
      .from('applications')
      .update({
        participants_info: nextParticipants as unknown as Application['participants_info'],
        updated_at: new Date().toISOString(),
      })
      .eq('id', typedVoteRow.id)
      .select()
      .single();

    if (updateError) handleSupabaseError(updateError, '게스트 추가');
    return updatedVote!;
  }

  /**
   * 특정 사용자의 투표 조회
   */
  async getMyVote(matchId: string, userId: string): Promise<Application | null> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*')
      .eq('match_id', matchId)
      .eq('user_id', userId)
      .eq('source', 'TEAM_VOTE')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error, '내 투표 조회');
    }

    return data;
  }

  /**
   * 팀 매치 투표 목록 조회
   */
  async getTeamVotes(matchId: string): Promise<Application[]> {
    const { data, error } = await this.supabase
      .from('applications')
      .select('*, users(*)')
      .eq('match_id', matchId)
      .eq('source', 'TEAM_VOTE')
      .order('created_at', { ascending: true });

    if (error) handleSupabaseError(error, '투표 목록');
    return data || [];
  }

  /**
   * 투표 현황 요약 조회
   */
  async getVotingSummary(matchId: string): Promise<VotingSummary> {
    const { data: votes, error } = await this.supabase
      .from('applications')
      .select('status, participants_info')
      .eq('match_id', matchId)
      .eq('source', 'TEAM_VOTE');

    if (error) handleSupabaseError(error, '투표 현황');

    const initialCounts = {
      pending: 0,
      attending: 0,
      late: 0,
      maybe: 0,
      notAttending: 0,
    };

    const voteCounts = (votes || []).reduce((acc, vote) => {
      const participantCount = countTeamVoteParticipants(vote.participants_info);

      switch (vote.status) {
        case 'PENDING':
          acc.pending += participantCount;
          break;
        case 'CONFIRMED':
          acc.attending += participantCount;
          break;
        case 'LATE':
          acc.late += participantCount;
          break;
        case 'MAYBE':
          acc.maybe += participantCount;
          break;
        case 'NOT_ATTENDING':
          acc.notAttending += participantCount;
          break;
      }
      return acc;
    }, initialCounts);

    return {
      ...voteCounts,
      totalMembers: (votes || []).reduce(
        (sum, vote) => sum + countTeamVoteParticipants(vote.participants_info),
        0
      ),
    };
  }

  /**
   * 투표 마감 (status를 CLOSED로 변경)
   */
  async closeVoting(matchId: string): Promise<Match> {
    const { data, error } = await this.supabase
      .from('matches')
      .update({
        status: 'CLOSED',
      })
      .eq('id', matchId)
      .eq('match_type', 'TEAM_MATCH')
      .select()
      .single();

    if (error) handleSupabaseError(error, '투표 마감');
    return data!;
  }

  /**
   * 투표 재오픈 (status를 RECRUITING으로 변경)
   */
  async reopenVoting(matchId: string): Promise<Match> {
    const { data, error } = await this.supabase
      .from('matches')
      .update({
        status: 'RECRUITING',
      })
      .eq('id', matchId)
      .eq('match_type', 'TEAM_MATCH')
      .select()
      .single();

    if (error) handleSupabaseError(error, '투표 재오픈');
    return data!;
  }

  /**
   * 관리자가 팀원의 투표를 대신 변경
   */
  async updateMemberVote(
    matchId: string,
    memberId: string,
    status: TeamVoteStatusValue,
    description?: string
  ): Promise<Application> {
    const statusMap: Record<TeamVoteStatusValue, string> = {
      PENDING: 'PENDING',
      CONFIRMED: 'CONFIRMED',
      LATE: 'LATE',
      NOT_ATTENDING: 'NOT_ATTENDING',
      MAYBE: 'MAYBE',
    };

    const applicationStatus = statusMap[status];

    const { data, error } = await this.supabase
      .from('applications')
      .update({
        status: applicationStatus as Application['status'],
        description: description || null,
        updated_at: new Date().toISOString(),
      })
      .eq('match_id', matchId)
      .eq('user_id', memberId)
      .eq('source', 'TEAM_VOTE')
      .select()
      .single();

    if (error) handleSupabaseError(error, '투표 변경');
    return data!;
  }

  /**
   * 팀 매치 수정 (시간, 장소)
   */
  async updateTeamMatch(
    matchId: string,
    input: {
      startTime?: string;
      endTime?: string;
      gymId?: string;
      operationInfo?: Record<string, unknown>;
    }
  ): Promise<Match> {
    const updateData: Record<string, unknown> = {};
    if (input.startTime) updateData.start_time = normalizeMatchDateTimeInput(input.startTime);
    if (input.endTime) updateData.end_time = normalizeMatchDateTimeInput(input.endTime);
    if (input.gymId) updateData.gym_id = input.gymId;
    if (input.operationInfo) updateData.operation_info = input.operationInfo;

    const { data, error } = await this.supabase
      .from('matches')
      .update(updateData)
      .eq('id', matchId)
      .eq('match_type', 'TEAM_MATCH')
      .select('*, gyms(*)')
      .single();

    if (error) handleSupabaseError(error, '팀 매치 수정');
    return data!;
  }

  /**
   * 팀 매치 취소
   */
  async cancelTeamMatch(matchId: string): Promise<Match> {
    const { data, error } = await this.supabase
      .from('matches')
      .update({
        status: 'CANCELED',
      })
      .eq('id', matchId)
      .eq('match_type', 'TEAM_MATCH')
      .select()
      .single();

    if (error) handleSupabaseError(error, '팀 매치 취소');
    return data!;
  }

  /**
   * 게스트 모집으로 전환
   */
  async openGuestRecruitment(
    matchId: string,
    recruitmentSetup: {
      type: 'ANY' | 'POSITION';
      maxCount?: number;
      positions?: Record<string, { max: number; current: number }>;
    }
  ): Promise<Match> {
    const { data, error } = await this.supabase
      .from('matches')
      .update({
        recruitment_setup: recruitmentSetup,
        status: 'RECRUITING',
      })
      .eq('id', matchId)
      .eq('match_type', 'TEAM_MATCH')
      .select()
      .single();

    if (error) handleSupabaseError(error, '게스트 모집 전환');
    return data!;
  }

  /**
   * 내가 속한 팀의 미투표 매치 목록 조회
   */
  async getMyPendingVoteMatches(
    teamIds: string[],
    userId: string,
    options?: { guestRecruitmentOnly?: boolean }
  ): Promise<
    Array<{
      match: Match;
      team: Team;
      myVote: Application | null;
      votingSummary: { attending: number; notAttending: number; pending: number };
    }>
  > {
    if (teamIds.length === 0) return [];

    // 1. 미래의 팀 매치들 조회
    const { data: matches, error: matchError } = await this.supabase
      .from('matches')
      .select('*, gyms(*), teams!inner(*)')
      .in('team_id', teamIds)
      .eq('match_type', 'TEAM_MATCH')
      .neq('status', 'CLOSED')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (matchError) handleSupabaseError(matchError, '미투표 매치 조회');

    if (!matches || matches.length === 0) return [];

    // 1.5 게스트 모집 중인 매치만 필터링 (옵션)
    let filteredMatches = matches;
    if (options?.guestRecruitmentOnly) {
      filteredMatches = matches.filter((match) => {
        const setup = match.recruitment_setup as {
          type?: 'ANY' | 'POSITION';
          max_count?: number;
          positions?: Record<string, { max: number; current: number }>;
        } | null;

        if (!setup) return false;

        // ANY 타입: max_count > 0이면 게스트 모집 중
        if (setup.type === 'ANY' && (setup.max_count ?? 0) > 0) {
          return true;
        }

        // POSITION 타입: 포지션에 슬롯이 있으면 게스트 모집 중
        if (setup.type === 'POSITION' && setup.positions) {
          return Object.values(setup.positions).some((pos) => pos.max > pos.current);
        }

        return false;
      });
    }

    if (filteredMatches.length === 0) return [];

    // 2. 해당 매치들의 투표 정보 조회
    const matchIds = filteredMatches.map((m) => m.id);
    const { data: votes, error: voteError } = await this.supabase
      .from('applications')
      .select('*')
      .in('match_id', matchIds)
      .eq('source', 'TEAM_VOTE');

    if (voteError) handleSupabaseError(voteError, '투표 정보 조회');

    // 3. 매치별 투표 요약 및 내 투표 상태 계산
    const result = filteredMatches.map((match) => {
      const matchVotes = (votes || []).filter((v) => v.match_id === match.id);
      const myVote = matchVotes.find((v) => v.user_id === userId) || null;

      const votingSummary = {
        attending: matchVotes.reduce((sum, vote) => (
          vote.status === 'CONFIRMED' || vote.status === 'LATE'
            ? sum + countTeamVoteParticipants(vote.participants_info)
            : sum
        ), 0),
        notAttending: matchVotes.reduce((sum, vote) => (
          vote.status === 'NOT_ATTENDING'
            ? sum + countTeamVoteParticipants(vote.participants_info)
            : sum
        ), 0),
        pending: matchVotes.reduce((sum, vote) => (
          vote.status === 'PENDING'
            ? sum + countTeamVoteParticipants(vote.participants_info)
            : sum
        ), 0),
      };

      const team = match.teams as unknown as Team;

      return {
        match,
        team,
        myVote,
        votingSummary,
      };
    });

    return result;
  }
}

/**
 * TeamService 팩토리 함수
 */
export function createTeamService(supabase: SupabaseClient<Database>) {
  return new TeamService(supabase);
}
