import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/shared/types/database.types';
import {
  toMatchInsertDataV3,
  extractGymDataV3,
} from './match-create-mapper';
import { MatchCreateFormData } from '@/features/match-create/model/schema';
import { createGymService } from '@/shared/api/gym-api';
import { logRequest, logResponse, logSupabaseQuery, logSupabaseResult } from '@/shared/lib/logger';

export class MatchCreateService {
  private readonly SERVICE_NAME = 'MatchCreateService';

  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Form → DB 데이터 준비 (Gym upsert + Match 매핑 + Team Name 보정)
   */
  private async prepareMatchData(hostId: string, form: MatchCreateFormData) {
    const gymService = createGymService(this.supabase);
    const gymId = await gymService.upsertGym(extractGymDataV3(form));
    const matchData = toMatchInsertDataV3(hostId, form, gymId);

    // Team Name 보정
    if (matchData.manual_team_name === '' && matchData.team_id) {
      logSupabaseQuery('teams', 'SELECT', undefined, { id: matchData.team_id });

      const { data: team, error: teamError } = await this.supabase
        .from('teams')
        .select('name')
        .eq('id', matchData.team_id)
        .single();

      logSupabaseResult('teams', 'SELECT', team, teamError);
      matchData.manual_team_name = team ? team.name : 'Unknown Team';
    } else if (matchData.manual_team_name === '') {
      matchData.manual_team_name = '개인 주최';
    }

    return { matchData, gymId };
  }

  /**
   * 경기 생성
   */
  async createMatch(hostId: string, form: MatchCreateFormData) {
    logRequest(this.SERVICE_NAME, 'createMatch', { hostId, form });

    try {
      const { matchData, gymId } = await this.prepareMatchData(hostId, form);

      logSupabaseQuery('matches', 'INSERT', matchData);
      const { data: match, error } = await this.supabase
        .from('matches')
        .insert(matchData)
        .select()
        .single();

      logSupabaseResult('matches', 'INSERT', match, error);
      if (error) throw error;

      logResponse(this.SERVICE_NAME, 'createMatch', { matchId: match.id, gymId });
      return match;
    } catch (error) {
      logResponse(this.SERVICE_NAME, 'createMatch', undefined, error);
      throw error;
    }
  }

  /**
   * 경기 수정
   */
  async updateMatch(matchId: string, hostId: string, form: MatchCreateFormData) {
    logRequest(this.SERVICE_NAME, 'updateMatch', { matchId, hostId, form });

    try {
      const { matchData, gymId } = await this.prepareMatchData(hostId, form);
      delete (matchData as any).status; // 수정 시 기존 상태 유지

      logSupabaseQuery('matches', 'UPDATE', matchData, { id: matchId });
      const { data: match, error } = await this.supabase
        .from('matches')
        .update(matchData)
        .eq('id', matchId)
        .eq('host_id', hostId)
        .select()
        .single();

      logSupabaseResult('matches', 'UPDATE', match, error);
      if (error) throw error;

      logResponse(this.SERVICE_NAME, 'updateMatch', { matchId: match.id, gymId });
      return match;
    } catch (error) {
      logResponse(this.SERVICE_NAME, 'updateMatch', undefined, error);
      throw error;
    }
  }
}

export function createMatchCreateService(supabase: SupabaseClient<Database>) {
  return new MatchCreateService(supabase);
}
