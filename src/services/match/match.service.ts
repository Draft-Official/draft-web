import { SupabaseClient } from '@supabase/supabase-js';
import { MatchCreateFormData } from '@/features/match/create/model/schema';
import { toMatchInsertData, extractGymData } from './match.mapper';
import { findOrCreateGym } from '@/services/gym';
import type { Database } from '@/shared/types/database.types';

export class MatchService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Create a new match
   * 1. Gym Upsert (찾거나 생성)
   * 2. Match Insert (gym_id 포함)
   */
  async createMatch(hostId: string, form: MatchCreateFormData) {
    // 1. Gym 찾거나 생성 (Upsert 전략)
    const gymData = extractGymData(form);
    const gymId = await findOrCreateGym(this.supabase, gymData);

    // 2. Match Insert 데이터 생성 (gym_id 포함)
    const insertData = toMatchInsertData(hostId, form, gymId);

    console.log('[MatchService] Creating match with data:', insertData);

    const { data, error } = await this.supabase
      .from('matches')
      .insert(insertData)
      .select(
        `
        *,
        gym:gyms(*),
        team:teams(*)
      `
      )
      .single();

    if (error) {
      console.error('[MatchService] Insert error:', error);
      throw error;
    }

    console.log('[MatchService] Match created:', data);
    return data;
  }

  /**
   * Get all matches that are currently recruiting
   * gym, team 정보를 JOIN으로 가져옴
   */
  async getRecruitingMatches() {
    const { data, error } = await this.supabase
      .from('matches')
      .select(
        `
        *,
        gym:gyms(*),
        team:teams(*)
      `
      )
      .eq('status', 'RECRUITING')
      .order('start_time', { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }

  /**
   * Get match details by ID
   * gym, host, team 정보를 JOIN으로 가져옴
   */
  async getMatchDetail(id: string) {
    const { data, error } = await this.supabase
      .from('matches')
      .select(
        `
        *,
        gym:gyms(*),
        host:users!host_id(*),
        team:teams(*)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }
}

export const createMatchService = (client: SupabaseClient<Database>) =>
  new MatchService(client);
