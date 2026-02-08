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
import { getTeamMembers } from '../membership/api';

// ============================================
// Team Match CRUD
// ============================================

/**
 * 팀 매치 생성
 * - 매치 생성 후 모든 팀원에게 PENDING 상태의 투표(application) 생성
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

  const match = data!;

  // 모든 팀원에게 PENDING 상태의 투표 생성
  await createVotesForAllMembers(supabase, match.id, input.teamId);

  return match;
}

/**
 * 특정 경기에 모든 팀원의 투표(application) 생성
 */
async function createVotesForAllMembers(
  supabase: SupabaseClient<Database>,
  matchId: string,
  teamId: string
): Promise<void> {
  const members = await getTeamMembers(supabase, teamId);

  if (members.length === 0) return;

  const applications = members.map((member) => ({
    match_id: matchId,
    user_id: member.user_id,
    source: 'TEAM_VOTE' as const,
    status: 'PENDING' as const,
  }));

  const { error } = await supabase.from('applications').insert(applications);

  if (error) handleSupabaseError(error, '팀원 투표 생성');
}

/**
 * 새 팀원에게 진행 중인 경기들의 투표(application) 생성
 * - 팀원 가입 승인 시 호출
 */
export async function createVotesForNewMember(
  supabase: SupabaseClient<Database>,
  teamId: string,
  userId: string
): Promise<void> {
  // 진행 중인(미래) 팀 경기 조회
  const { data: upcomingMatches, error: matchError } = await supabase
    .from('matches')
    .select('id')
    .eq('team_id', teamId)
    .eq('match_type', 'TEAM_MATCH')
    .gte('start_time', new Date().toISOString());

  if (matchError) handleSupabaseError(matchError, '진행 중 경기 조회');

  if (!upcomingMatches || upcomingMatches.length === 0) return;

  // 각 경기에 대해 투표 생성
  const applications = upcomingMatches.map((match) => ({
    match_id: match.id,
    user_id: userId,
    source: 'TEAM_VOTE' as const,
    status: 'PENDING' as const,
  }));

  const { error } = await supabase.from('applications').insert(applications);

  if (error) handleSupabaseError(error, '새 팀원 투표 생성');
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

  // 투표 마감 여부 확인 (match.status === 'CLOSED' 기준)
  const { data: match } = await supabase
    .from('matches')
    .select('status')
    .eq('id', input.matchId)
    .single();

  if (match?.status === 'CLOSED') {
    throw new Error('투표가 마감되었습니다');
  }

  // 상태 매핑: TeamVoteStatus -> ApplicationStatus
  // 팀 투표는 MAYBE 상태를 그대로 저장 (게스트 신청과 다름)
  const statusMap: Record<TeamVoteStatusValue, string> = {
    PENDING: 'PENDING',
    CONFIRMED: 'CONFIRMED',
    LATE: 'LATE',
    NOT_ATTENDING: 'NOT_ATTENDING',
    MAYBE: 'MAYBE',
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
 * - 모든 팀원에게 application이 존재하므로 application만 집계
 */
export async function getVotingSummary(
  supabase: SupabaseClient<Database>,
  matchId: string,
  _teamId?: string // 하위 호환성 유지, 더 이상 사용하지 않음
): Promise<VotingSummary> {
  // 투표 현황 조회 (applications 기반)
  const { data: votes, error } = await supabase
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
export async function closeVoting(
  supabase: SupabaseClient<Database>,
  matchId: string
): Promise<Match> {
  const { data, error } = await supabase
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
