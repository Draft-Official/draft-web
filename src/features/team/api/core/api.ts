/**
 * Team Core API
 * 팀 관련 DB 접근을 캡슐화
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  Team,
  TeamInsert,
  TeamUpdate,
} from '@/shared/types/database.types';
import type { AccountInfo, OperationInfo } from '@/shared/types/jsonb.types';
import { handleSupabaseError } from '@/shared/lib/errors';
import type { CreateTeamInput, UpdateTeamInput } from '../../model/types';
import type { TeamRoleValue } from '@/shared/config/team-constants';

// ============================================
// Team CRUD
// ============================================

/**
 * 팀 ID로 팀 정보 조회
 */
export async function getTeam(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<Team | null> {
  const { data, error } = await supabase
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
 * 팀 코드로 팀 정보 조회
 */
export async function getTeamByCode(
  supabase: SupabaseClient<Database>,
  code: string
): Promise<Team | null> {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
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
export async function checkTeamCodeExists(
  supabase: SupabaseClient<Database>,
  code: string
): Promise<boolean> {
  const { count, error } = await supabase
    .from('teams')
    .select('*', { count: 'exact', head: true })
    .eq('code', code);

  if (error) handleSupabaseError(error, '팀 코드 확인');
  return (count ?? 0) > 0;
}

/**
 * 팀 생성
 * DB Trigger(trg_add_team_leader)가 자동으로 생성자를 LEADER로 추가함
 * @returns 생성된 팀 정보
 */
export async function createTeam(
  supabase: SupabaseClient<Database>,
  _userId: string, // Trigger가 auth.uid()로 처리하므로 사용하지 않음
  input: CreateTeamInput
): Promise<Team> {
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

  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert(teamInsert)
    .select()
    .single();

  if (teamError) handleSupabaseError(teamError, '팀 생성');

  // Trigger가 자동으로 team_members에 LEADER로 추가함
  return team!;
}

/**
 * 팀 정보 수정
 */
export async function updateTeam(
  supabase: SupabaseClient<Database>,
  teamId: string,
  input: UpdateTeamInput
): Promise<Team> {
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

  const { data, error } = await supabase
    .from('teams')
    .update(teamUpdate)
    .eq('id', teamId)
    .select()
    .single();

  if (error) handleSupabaseError(error, '팀 정보 수정');
  return data!;
}

/**
 * 팀 삭제
 */
export async function deleteTeam(
  supabase: SupabaseClient<Database>,
  teamId: string
): Promise<void> {
  const { error } = await supabase.from('teams').delete().eq('id', teamId);

  if (error) handleSupabaseError(error, '팀 삭제');
}

// ============================================
// My Teams
// ============================================

/**
 * 현재 사용자가 속한 팀 목록 조회 (역할 정보 + 체육관 정보 포함)
 */
export async function getMyTeams(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<(Team & { role: TeamRoleValue; home_gym_name: string | null })[]> {
  const { data, error } = await supabase
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
// Legacy Service Class (for backward compatibility)
// ============================================

export class TeamService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getMyTeams(userId: string) {
    return getMyTeams(this.supabase, userId);
  }

  async getTeam(teamId: string) {
    return getTeam(this.supabase, teamId);
  }

  async updateTeamDefaults(
    teamId: string,
    updates: {
      accountInfo?: AccountInfo | null;
      operationInfo?: Partial<OperationInfo> | null;
    }
  ) {
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

  async updateTeam(teamId: string, updates: TeamUpdate) {
    const { data, error } = await this.supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single();

    if (error) handleSupabaseError(error, '팀 정보 수정');
    return data!;
  }

  async getTeamMembers(teamId: string) {
    const { data, error } = await this.supabase
      .from('team_members')
      .select('*, users(*)')
      .eq('team_id', teamId)
      .eq('status', 'ACCEPTED');

    if (error) handleSupabaseError(error, '팀 멤버 목록');
    return data || [];
  }
}

/**
 * TeamService 팩토리 함수
 */
export function createTeamService(supabase: SupabaseClient<Database>) {
  return new TeamService(supabase);
}
