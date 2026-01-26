/**
 * Team Service
 * 팀 관련 DB 접근을 캡슐화
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  Team,
  TeamUpdate,
  TeamMember,
} from '@/shared/types/database.types';
import { AccountInfo, OperationInfo } from '@/shared/types/jsonb.types';
import { handleSupabaseError } from '@/shared/lib/errors';

export class TeamService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * 현재 사용자가 속한 팀 목록 조회
   */
  async getMyTeams(userId: string): Promise<Team[]> {
    const { data, error } = await this.supabase
      .from('team_members')
      .select('team_id, teams(*)')
      .eq('user_id', userId)
      .eq('status', 'ACCEPTED');

    if (error) handleSupabaseError(error, '내 팀 목록');

    // team_members와 teams를 조인한 결과에서 teams 데이터만 추출
    return (data || [])
      .map((item) => item.teams)
      .filter((team): team is Team => team !== null);
  }

  /**
   * 팀 정보 조회
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
   * 팀 운영 정보 기본값 업데이트
   */
  async updateTeamDefaults(
    teamId: string,
    updates: {
      accountInfo?: AccountInfo | null;
      operationInfo?: Partial<OperationInfo> | null;
    }
  ): Promise<Team> {
    const dbUpdates: TeamUpdate = {};
    
    // Explicitly map using string indexing to avoid partial type issues if needed, strictly speaking casting is safer here
    if (updates.accountInfo !== undefined) {
      dbUpdates.account_info = updates.accountInfo as any;
    }
    if (updates.operationInfo !== undefined) {
      dbUpdates.operation_info = updates.operationInfo as any;
    }

    const { data, error } = await this.supabase
      .from('teams')
      .update(dbUpdates)
      .eq('id', teamId)
      .select()
      .single();

    if (error) handleSupabaseError(error, '팀 운영 정보 수정');
    return data!;
  }

  /**
   * 팀 정보 업데이트 (일반)
   */
  async updateTeam(teamId: string, updates: TeamUpdate): Promise<Team> {
    const { data, error } = await this.supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single();

    if (error) handleSupabaseError(error, '팀 정보 수정');
    return data!;
  }

  /**
   * 팀 멤버 목록 조회
   */
  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
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
