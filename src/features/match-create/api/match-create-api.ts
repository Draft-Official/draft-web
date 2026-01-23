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
   * 경기 생성 (V3: Gym 생성/조회 후 Match 생성)
   *
   * Transaction Flow:
   * 1. Extract Gym Data from Form
   * 2. Find or Create Gym -> get gym_id
   * 3. Extract Match Data (with gym_id)
   * 4. Insert Match
   */
  async createMatch(hostId: string, form: MatchCreateFormData) {
    logRequest(this.SERVICE_NAME, 'createMatch', { hostId, form });

    try {
      // 1. Gym 처리
      const gymService = createGymService(this.supabase);
      const gymData = extractGymDataV3(form);

      // Gym 생성 또는 조회 (Upsert + Latest Wins)
      const gymId = await gymService.upsertGym(gymData);

      // 2. Match Data 매핑 (gymId 전달)
      const matchInsertData = toMatchInsertDataV3(hostId, form, gymId);

      // 3. Team Name 보정 (Manual Team Name)
      if (matchInsertData.manual_team_name === '' && matchInsertData.team_id) {
        logSupabaseQuery('teams', 'SELECT', undefined, { id: matchInsertData.team_id });

        const { data: team, error: teamError } = await this.supabase
          .from('teams')
          .select('name')
          .eq('id', matchInsertData.team_id)
          .single();

        logSupabaseResult('teams', 'SELECT', team, teamError);

        if (team) {
          matchInsertData.manual_team_name = team.name;
        } else {
          matchInsertData.manual_team_name = 'Unknown Team';
        }
      } else if (matchInsertData.manual_team_name === '') {
        matchInsertData.manual_team_name = '개인 주최';
      }

      // 4. Match Insert
      logSupabaseQuery('matches', 'INSERT', matchInsertData);

      const { data: match, error } = await this.supabase
        .from('matches')
        .insert(matchInsertData)
        .select()
        .single();

      logSupabaseResult('matches', 'INSERT', match, error);

      if (error) {
        throw error;
      }

      logResponse(this.SERVICE_NAME, 'createMatch', { matchId: match.id, gymId });
      return match;

    } catch (error) {
      logResponse(this.SERVICE_NAME, 'createMatch', undefined, error);
      throw error;
    }
  }
}

export function createMatchCreateService(supabase: SupabaseClient<Database>) {
  return new MatchCreateService(supabase);
}
