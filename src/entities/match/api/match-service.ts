/**
 * Match Service
 * Unified CRUD for both GUEST_RECRUIT and TEAM_MATCH types
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/shared/types/database.types';
import { logRequest, logResponse } from '@/shared/lib/logger';
import type { MatchStatusValue } from '@/shared/config/constants';

type MatchType = 'GUEST_RECRUIT' | 'TEAM_MATCH';

export class MatchService {
  private readonly SERVICE_NAME = 'MatchService';

  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get matches with optional type filter
   */
  async getMatches(filter?: { type?: MatchType; status?: MatchStatusValue }) {
    logRequest(this.SERVICE_NAME, 'getMatches', filter);

    let query = this.supabase
      .from('matches')
      .select(`
        *,
        gym:gyms!gym_id (*),
        host:users!host_id (*),
        team:teams!team_id (*)
      `)
      .order('start_time', { ascending: true });

    if (filter?.type) {
      query = query.eq('match_type', filter.type);
    }

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }

    const { data, error } = await query;

    if (error) {
      logResponse(this.SERVICE_NAME, 'getMatches', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'getMatches', { count: data?.length ?? 0 });
    return data ?? [];
  }

  /**
   * Get match detail (type-agnostic)
   */
  async getMatchDetail(id: string) {
    logRequest(this.SERVICE_NAME, 'getMatchDetail', { id });

    const { data, error } = await this.supabase
      .from('matches')
      .select(`
        *,
        gym:gyms!gym_id (*),
        host:users!host_id (*),
        team:teams!team_id (*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      logResponse(this.SERVICE_NAME, 'getMatchDetail', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'getMatchDetail', data);
    return data;
  }

  /**
   * Create match (supports both types)
   */
  async createMatch(data: any) {
    logRequest(this.SERVICE_NAME, 'createMatch', data);

    const { data: match, error } = await this.supabase
      .from('matches')
      .insert(data)
      .select()
      .single();

    if (error) {
      logResponse(this.SERVICE_NAME, 'createMatch', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'createMatch', { matchId: match.id });
    return match;
  }

  /**
   * Update match
   */
  async updateMatch(id: string, data: any) {
    logRequest(this.SERVICE_NAME, 'updateMatch', { id, data });

    const { data: match, error } = await this.supabase
      .from('matches')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logResponse(this.SERVICE_NAME, 'updateMatch', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'updateMatch', { matchId: match.id });
    return match;
  }

  /**
   * Update match status
   */
  async updateStatus(id: string, status: MatchStatusValue) {
    logRequest(this.SERVICE_NAME, 'updateStatus', { id, status });

    const { data, error } = await this.supabase
      .from('matches')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logResponse(this.SERVICE_NAME, 'updateStatus', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'updateStatus', data);
    return data;
  }

  /**
   * Cancel match
   */
  async cancelMatch(id: string) {
    return this.updateStatus(id, 'CANCELED');
  }
}

export function createMatchService(supabase: SupabaseClient<Database>) {
  return new MatchService(supabase);
}
