/**
 * Team Match API
 * 팀 운동 및 투표 관련 DB 접근
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Database,
  Match,
  MatchInsert,
  Application,
} from '@/shared/types/database.types';
import { handleSupabaseError } from '@/shared/lib/errors';
import type { CreateTeamMatchInput, VoteInput, VotingSummary } from '../../model/types';
import type { TeamVoteStatusValue } from '@/shared/config/team-constants';
import { getTeamMemberCount } from '../membership/api';

// ============================================
// Team Match CRUD
// ============================================

/**
 * 팀 매치 생성
 */
export async function createTeamMatch(
  supabase: SupabaseClient<Database>,
  hostId: string,
  input: CreateTeamMatchInput
): Promise<Match> {
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
    manual_team_name: '', // 팀 매치는 팀 이름 사용
    status: 'RECRUITING',
    recruitment_setup: {
      type: 'ANY',
      max_count: 0,
      current_count: 0,
    },
  };

  const { data, error } = await supabase
    .from('matches')
    .insert(matchInsert)
    .select()
    .single();

  if (error) handleSupabaseError(error, '팀 운동 생성');
  return data!;
}

/**
 * 팀 매치 목록 조회
 */
export async function getTeamMatches(
  supabase: SupabaseClient<Database>,
  teamId: string,
  options?: {
    upcoming?: boolean;
    limit?: number;
  }
): Promise<Match[]> {
  let query = supabase
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
export async function getTeamMatch(
  supabase: SupabaseClient<Database>,
  matchId: string
): Promise<Match | null> {
  const { data, error } = await supabase
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

// ============================================
// Team Voting
// ============================================

/**
 * 팀 투표 생성/수정
 */
export async function upsertTeamVote(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: VoteInput
): Promise<Application> {
  // 기존 투표 확인
  const { data: existing } = await supabase
    .from('applications')
    .select('*')
    .eq('match_id', input.matchId)
    .eq('user_id', userId)
    .eq('source', 'TEAM_VOTE')
    .single();

  // 투표 마감 여부 확인
  const { data: match } = await supabase
    .from('matches')
    .select('voting_closed_at')
    .eq('id', input.matchId)
    .single();

  if (match?.voting_closed_at) {
    throw new Error('투표가 마감되었습니다');
  }

  // 상태 매핑: TeamVoteStatus -> ApplicationStatus
  const statusMap: Record<TeamVoteStatusValue, string> = {
    CONFIRMED: 'CONFIRMED',
    NOT_ATTENDING: 'NOT_ATTENDING',
    PENDING: 'PENDING',
  };

  const applicationStatus = statusMap[input.status];

  if (existing) {
    // 업데이트
    const { data, error } = await supabase
      .from('applications')
      .update({
        status: applicationStatus as Application['status'],
        description: input.status === 'NOT_ATTENDING' ? input.description : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) handleSupabaseError(error, '투표 수정');
    return data!;
  } else {
    // 생성
    const { data, error } = await supabase
      .from('applications')
      .insert({
        match_id: input.matchId,
        user_id: userId,
        source: 'TEAM_VOTE',
        status: applicationStatus as Application['status'],
        description: input.status === 'NOT_ATTENDING' ? input.description : null,
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
export async function getMyVote(
  supabase: SupabaseClient<Database>,
  matchId: string,
  userId: string
): Promise<Application | null> {
  const { data, error } = await supabase
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
export async function getTeamVotes(
  supabase: SupabaseClient<Database>,
  matchId: string
): Promise<Application[]> {
  const { data, error } = await supabase
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
export async function getVotingSummary(
  supabase: SupabaseClient<Database>,
  matchId: string,
  teamId: string
): Promise<VotingSummary> {
  // 팀원 수 조회
  const totalMembers = await getTeamMemberCount(supabase, teamId);

  // 투표 현황 조회
  const { data: votes, error } = await supabase
    .from('applications')
    .select('status')
    .eq('match_id', matchId)
    .eq('source', 'TEAM_VOTE');

  if (error) handleSupabaseError(error, '투표 현황');

  const voteCounts = (votes || []).reduce(
    (acc, vote) => {
      if (vote.status === 'CONFIRMED') acc.attending++;
      else if (vote.status === 'NOT_ATTENDING') acc.notAttending++;
      else if (vote.status === 'PENDING') acc.undecided++;
      return acc;
    },
    { attending: 0, notAttending: 0, undecided: 0 }
  );

  return {
    ...voteCounts,
    noResponse: totalMembers - (voteCounts.attending + voteCounts.notAttending + voteCounts.undecided),
    totalMembers,
  };
}

/**
 * 투표 마감
 */
export async function closeVoting(
  supabase: SupabaseClient<Database>,
  matchId: string
): Promise<Match> {
  const { data, error } = await supabase
    .from('matches')
    .update({
      voting_closed_at: new Date().toISOString(),
    })
    .eq('id', matchId)
    .eq('match_type', 'TEAM_MATCH')
    .select()
    .single();

  if (error) handleSupabaseError(error, '투표 마감');
  return data!;
}

/**
 * 게스트 모집으로 전환
 */
export async function openGuestRecruitment(
  supabase: SupabaseClient<Database>,
  matchId: string,
  recruitmentSetup: {
    type: 'ANY' | 'POSITION';
    maxCount?: number;
    positions?: Record<string, { max: number; current: number }>;
  }
): Promise<Match> {
  const { data, error } = await supabase
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
