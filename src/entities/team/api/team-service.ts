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
} from '@/shared/types/database.types';
import type { AccountInfo, OperationInfo } from '@/shared/types/jsonb.types';
import { handleSupabaseError } from '@/shared/lib/errors';
import type { TeamRoleValue, TeamVoteStatusValue } from '@/shared/config/team-constants';
import type {
  CreateTeamInput,
  UpdateTeamInput,
  CreateTeamMatchInput,
  VoteInput,
  VotingSummary,
  UpdateFeeStatusInput,
} from '../model/types';

// DB row types (users 조인 포함)
export type TeamMemberWithUser = TeamMember & {
  users?: {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
    positions: string[] | null;
  } | null;
};

export type TeamFeeWithUser = TeamFee & {
  users?: {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
  } | null;
};

export class TeamService {
  constructor(private supabase: SupabaseClient<Database>) {}

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
  async getTeamByCode(code: string): Promise<(Team & { gyms?: { name: string } | null }) | null> {
    const { data, error } = await this.supabase
      .from('teams')
      .select('*, gyms(name)')
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
      regular_day: input.regularDay,
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
  async updateTeam(teamId: string, input: UpdateTeamInput): Promise<Team> {
    const teamUpdate: TeamUpdate = {};

    if (input.name !== undefined) teamUpdate.name = input.name;
    if (input.shortIntro !== undefined) teamUpdate.short_intro = input.shortIntro;
    if (input.description !== undefined) teamUpdate.description = input.description;
    if (input.logoUrl !== undefined) teamUpdate.logo_url = input.logoUrl;
    if (input.regionDepth1 !== undefined) teamUpdate.region_depth1 = input.regionDepth1;
    if (input.regionDepth2 !== undefined) teamUpdate.region_depth2 = input.regionDepth2;
    if (input.homeGymId !== undefined) teamUpdate.home_gym_id = input.homeGymId;
    if (input.regularDay !== undefined) teamUpdate.regular_day = input.regularDay;
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
      .select()
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
  async getTeamMembers(teamId: string): Promise<TeamMemberWithUser[]> {
    const { data, error } = await this.supabase
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
  async getPendingMembers(teamId: string): Promise<TeamMemberWithUser[]> {
    const { data, error } = await this.supabase
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
    const newLeaderMembership = await this.getMembership(teamId, newLeaderId);
    if (!newLeaderMembership || newLeaderMembership.status !== 'ACCEPTED') {
      throw new Error('유효한 팀원만 팀장이 될 수 있습니다');
    }

    const { error: error1 } = await this.supabase
      .from('team_members')
      .update({ role: 'MEMBER' })
      .eq('team_id', teamId)
      .eq('user_id', currentLeaderId)
      .eq('role', 'LEADER');

    if (error1) handleSupabaseError(error1, '팀장 권한 해제');

    const { error: error2 } = await this.supabase
      .from('team_members')
      .update({ role: 'LEADER' })
      .eq('team_id', teamId)
      .eq('user_id', newLeaderId);

    if (error2) {
      await this.supabase
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
  async getTeamFees(teamId: string, yearMonth: string): Promise<TeamFeeWithUser[]> {
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
    const matchInsert: MatchInsert = {
      team_id: input.teamId,
      host_id: hostId,
      match_type: 'TEAM_MATCH',
      start_time: input.startTime,
      end_time: input.endTime,
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

    const applications = upcomingMatches.map((match) => ({
      match_id: match.id,
      user_id: userId,
      source: 'TEAM_VOTE' as const,
      status: 'PENDING' as const,
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
      .order('start_time', { ascending: true });

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
  async getTeamMatch(matchId: string): Promise<Match | null> {
    const { data, error } = await this.supabase
      .from('matches')
      .select('*, gyms(*), teams(*)')
      .eq('id', matchId)
      .eq('match_type', 'TEAM_MATCH')
      .single();

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
      .select('*, users(id, nickname, avatar_url)')
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
      .select('status')
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
      switch (vote.status) {
        case 'PENDING':
          acc.pending++;
          break;
        case 'CONFIRMED':
          acc.attending++;
          break;
        case 'LATE':
          acc.late++;
          break;
        case 'MAYBE':
          acc.maybe++;
          break;
        case 'NOT_ATTENDING':
          acc.notAttending++;
          break;
      }
      return acc;
    }, initialCounts);

    return {
      ...voteCounts,
      totalMembers: votes?.length || 0,
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
    if (input.startTime) updateData.start_time = input.startTime;
    if (input.endTime) updateData.end_time = input.endTime;
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
}

/**
 * TeamService 팩토리 함수
 */
export function createTeamService(supabase: SupabaseClient<Database>) {
  return new TeamService(supabase);
}
