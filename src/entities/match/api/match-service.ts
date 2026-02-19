/**
 * Match Service
 * Unified CRUD for both GUEST_RECRUIT and TEAM_MATCH types
 */
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/shared/types/database.types';
import { logRequest, logResponse } from '@/shared/lib/logger';
import type { MatchStatusValue } from '@/shared/config/match-constants';

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
  async createMatch(data: Record<string, unknown>) {
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
  async updateMatch(id: string, data: Record<string, unknown>) {
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

  // ============================================
  // Feature-specific queries
  // ============================================

  /**
   * Get recruiting guest matches (RECRUITING + GUEST_RECRUIT only)
   * Used by guest match list feature
   */
  async getRecruitingMatches() {
    logRequest(this.SERVICE_NAME, 'getRecruitingMatches');

    const { data, error } = await this.supabase
      .from('matches')
      .select(`
        *,
        gym:gyms!gym_id (*),
        host:users!host_id (*),
        team:teams!team_id (*)
      `)
      .eq('status', 'RECRUITING')
      .eq('match_type', 'GUEST_RECRUIT')
      .order('start_time', { ascending: true });

    if (error) {
      logResponse(this.SERVICE_NAME, 'getRecruitingMatches', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'getRecruitingMatches', { count: data?.length ?? 0 });
    return data ?? [];
  }

  /**
   * Get recruiting matches with pagination
   * @param pageParam Starting index
   * @param pageSize Page size (default 20)
   */
  async getRecruitingMatchesPaginated(pageParam: number = 0, pageSize: number = 20) {
    logRequest(this.SERVICE_NAME, 'getRecruitingMatchesPaginated', { pageParam, pageSize });

    const todayISO = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
    const VISIBLE_STATUSES: MatchStatusValue[] = ['RECRUITING', 'CLOSED'];

    const { data, error } = await this.supabase
      .from('matches')
      .select(`
        *,
        gym:gyms!gym_id (*),
        host:users!host_id (*),
        team:teams!team_id (*)
      `)
      .in('status', VISIBLE_STATUSES)
      .eq('match_type', 'GUEST_RECRUIT')
      .gte('start_time', todayISO)
      .order('created_at', { ascending: false })
      .range(pageParam, pageParam + pageSize - 1);

    if (error) {
      logResponse(this.SERVICE_NAME, 'getRecruitingMatchesPaginated', undefined, error);
      throw error;
    }

    const hasMore = data?.length === pageSize;
    const nextCursor = hasMore ? pageParam + pageSize : undefined;

    logResponse(this.SERVICE_NAME, 'getRecruitingMatchesPaginated', {
      count: data?.length ?? 0,
      nextCursor
    });

    return {
      matches: data ?? [],
      nextCursor,
    };
  }

  /**
   * Get matches hosted by user
   * @param userId User ID
   * @param limit Maximum number of matches (default 5)
   */
  async getMyHostedMatches(userId: string, limit: number = 5) {
    logRequest(this.SERVICE_NAME, 'getMyHostedMatches', { userId, limit });

    const { data, error } = await this.supabase
      .from('matches')
      .select(`
        *,
        gym:gyms!gym_id (*),
        team:teams!team_id (name)
      `)
      .eq('host_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logResponse(this.SERVICE_NAME, 'getMyHostedMatches', undefined, error);
      throw error;
    }

    logResponse(this.SERVICE_NAME, 'getMyHostedMatches', { count: data?.length ?? 0 });
    return data;
  }
}

export function createMatchService(supabase: SupabaseClient<Database>) {
  return new MatchService(supabase);
}
