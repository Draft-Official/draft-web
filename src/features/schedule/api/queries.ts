/**
 * Match Management Query Hooks
 * 경기 관리 데이터 조회용 React Query hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createMatchService } from '@/entities/match';
import { createApplicationService } from '@/entities/application';
import { createTeamService } from '@/entities/team';
import { useAuth } from '@/shared/session';
import { formatMatchDate, formatMatchTime } from '@/shared/lib/datetime';
import { getPositionLabel } from '@/shared/config/match-constants';
import type { TeamVoteStatusValue } from '@/shared/config/application-constants';
import { matchManagementKeys } from './keys';
import {
  toScheduleMatchListItemDTO,
  toMatchApplicantDTO,
  toHostMatchDetailDTO,
} from '../lib/mappers';
import {
  resolveApplicationStatus,
  toParticipatingMatchStatus,
  toApprovalStatusText,
} from '../lib/status-utils';
import type {
  ScheduleMatchListItemDTO,
  MatchApplicantDTO,
  HostMatchDetailDTO,
  ParticipatingMatchRow,
  TeamExerciseVoteItemDTO,
} from '../model/types';

function toTeamVoteStatus(status: string | null | undefined): TeamVoteStatusValue {
  switch (status) {
    case 'CONFIRMED':
    case 'LATE':
    case 'NOT_ATTENDING':
    case 'MAYBE':
      return status;
    case 'PENDING':
    default:
      return 'PENDING';
  }
}

/**
 * 내가 주최한 경기 목록 조회
 * @returns ScheduleMatchListItemDTO[] 형태로 변환된 호스트 경기 목록
 */
export function useHostedMatches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: matchManagementKeys.hostedMatches(user?.id ?? ''),
    queryFn: async (): Promise<ScheduleMatchListItemDTO[]> => {
      if (!user?.id) return [];

      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);

      // 모든 호스트 경기 조회 (limit 없음)
      const rows = await matchService.getMyHostedMatches(user.id, 100);

      // 게스트 모집 경기의 신청자 수 조회 (PENDING + PAYMENT_PENDING)
      const guestMatchIds = rows
        .filter((r) => r.match_type !== 'TEAM_MATCH')
        .map((r) => r.id);
      const applicantCountMap = new Map<string, number>();

      if (guestMatchIds.length > 0) {
        const { data: appRows } = await supabase
          .from('applications')
          .select('match_id')
          .in('match_id', guestMatchIds)
          .in('status', ['PENDING', 'PAYMENT_PENDING']);

        if (appRows) {
          for (const app of appRows) {
            applicantCountMap.set(app.match_id, (applicantCountMap.get(app.match_id) ?? 0) + 1);
          }
        }
      }

      // Team 매치의 투표 현황 조회
      const teamRows = rows.filter((r) => r.match_type === 'TEAM_MATCH');
      const votingSummaryMap = new Map<string, { attending: number; notAttending: number; pending: number }>();
      const myVoteMap = new Map<string, { vote: TeamVoteStatusValue; reason?: string }>();

      if (teamRows.length > 0) {
        const teamService = createTeamService(supabase);
        await Promise.all(
          teamRows.map(async (row) => {
            const [summary, myVoteRow] = await Promise.all([
              teamService.getVotingSummary(row.id),
              teamService.getMyVote(row.id, user.id),
            ]);
            votingSummaryMap.set(row.id, {
              attending: summary.attending + summary.late,
              notAttending: summary.notAttending,
              pending: summary.pending + summary.maybe,
            });
            if (myVoteRow) {
              myVoteMap.set(row.id, {
                vote: myVoteRow.status as TeamVoteStatusValue,
                reason: myVoteRow.description || undefined,
              });
            }
          })
        );
      }

      // DB Row -> ScheduleMatchListItemDTO 변환
      return rows.map((row) => {
        const dto = toScheduleMatchListItemDTO(row, 'host');
        const myVoteData = myVoteMap.get(row.id);
        return {
          ...dto,
          // 게스트 모집 경기: 실제 신청자 수(PENDING + PAYMENT_PENDING)로 덮어씌우기
          applicants: row.match_type !== 'TEAM_MATCH'
            ? (applicantCountMap.get(row.id) ?? 0)
            : dto.applicants,
          myVote: myVoteData?.vote,
          myVoteReason: myVoteData?.reason,
          votingSummary: votingSummaryMap.get(row.id),
          teamId: row.team_id || undefined,
          teamCode: (row.team as { name: string; code?: string | null })?.code || undefined,
        };
      });
    },
    enabled: !!user?.id,
  });
}

/**
 * 내가 참여한 경기 목록 조회 (게스트로 신청한 경기)
 * @returns ScheduleMatchListItemDTO[] 형태로 변환된 참여 경기 목록
 */
export function useParticipatingMatches() {
  const { user } = useAuth();

  return useQuery({
    queryKey: matchManagementKeys.participatingMatches(user?.id ?? ''),
    queryFn: async (): Promise<ScheduleMatchListItemDTO[]> => {
      if (!user?.id) return [];

      const supabase = getSupabaseBrowserClient();

      // 직접 쿼리하여 필요한 match 필드 가져오기
      const { data: applications, error } = await supabase
        .from('applications')
        .select(`
          *,
          match:matches!match_id (
            id,
            short_id,
            match_type,
            team_id,
            manual_team_name,
            start_time,
            end_time,
            cost_type,
            cost_amount,
            status,
            account_info,
            gym:gyms!gym_id (name, address, kakao_place_id),
            team:teams!team_id (name, code)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!applications) return [];

      // match가 있는 것만 필터
      const validApps = applications.filter((app) => app.match);

      // Team 매치의 투표 현황을 한 번에 조회
      const teamMatchIds = validApps
        .filter((app) => (app.match as ParticipatingMatchRow).match_type === 'TEAM_MATCH')
        .map((app) => (app.match as ParticipatingMatchRow).id);

      const votingSummaryMap = new Map<string, { attending: number; notAttending: number; pending: number }>();
      if (teamMatchIds.length > 0) {
        const teamService = createTeamService(supabase);
        await Promise.all(
          teamMatchIds.map(async (matchId) => {
            const summary = await teamService.getVotingSummary(matchId);
            votingSummaryMap.set(matchId, {
              attending: summary.attending + summary.late,
              notAttending: summary.notAttending,
              pending: summary.pending + summary.maybe,
            });
          })
        );
      }

      // DB Application → ScheduleMatchListItemDTO 변환
      return validApps.map((app) => {
          const match = app.match as ParticipatingMatchRow;

          // 경기 시간 기반 종료 판정
          const now = new Date();
          const matchEnded = match.end_time && now >= new Date(match.end_time);
          const matchOngoing = match.start_time && match.end_time &&
            now >= new Date(match.start_time) && now < new Date(match.end_time);

          // Application status → 공통 GuestStatus → UI 매핑
          const baseStatus = resolveApplicationStatus(app.status ?? 'PENDING');

          let status: ScheduleMatchListItemDTO['status'];
          if (matchEnded) {
            status = baseStatus === 'rejected' || baseStatus === 'canceled' ? 'cancelled' : 'ended';
          } else if (matchOngoing && baseStatus === 'confirmed') {
            status = 'ongoing';
          } else {
            status = toParticipatingMatchStatus(baseStatus);
          }

          const approvalStatusText = toApprovalStatusText(baseStatus);

          // 참가자 정보 파싱
          const participants = (app.participants_info as { type: string; name?: string; position?: string }[] | null) || [];
          const mainParticipant = participants.find((p) => p.type === 'MAIN');
          const companions = participants
            .filter((p) => p.type === 'GUEST')
            .map((p) => ({ name: p.name || '', position: p.position || '' }));
          const companionCount = companions.length;
          const totalCount = participants.length || 1;

          const position = mainParticipant?.position || 'G';

          // match_type에 따라 관리 도메인/카드 타입 결정
          const isTeamExercise = match.match_type === 'TEAM_MATCH';
          const isTournament = match.match_type === 'TOURNAMENT' || match.match_type === 'TOURNAMENT_MATCH';
          const managementType = isTeamExercise
            ? 'team_exercise' as const
            : isTournament
              ? 'tournament' as const
              : 'guest_recruitment' as const;
          const matchType = isTeamExercise
            ? 'team' as const
            : isTournament
              ? 'tournament' as const
              : 'guest' as const;
          const scheduleMode = 'participating' as const;

          // Team 매치: 투표 상태 매핑
          const myVote = managementType === 'team_exercise' ? (app.status as TeamVoteStatusValue) : undefined;
          const myVoteReason = managementType === 'team_exercise' ? (app.description || undefined) : undefined;

          return {
            id: match.id,
            publicId: match.short_id,
            managementType,
            matchType,
            scheduleMode,
            type: matchType,
            status,
            teamName: match.team?.name || match.manual_team_name || '팀명 미정',
            date: formatMatchDate(match.start_time),
            time: formatMatchTime(match.start_time),
            startTimeISO: match.start_time || '',
            location: match.gym?.name || match.gym?.address || '장소 미정',
            locationUrl: match.gym?.kakao_place_id ? `https://map.kakao.com/link/map/${match.gym.kakao_place_id}` : undefined,
            applicationId: app.id,
            approvalStatus: approvalStatusText,
            paymentNotifiedAt: (app as unknown as { payment_notified_at?: string }).payment_notified_at || undefined,
            totalCost: match.cost_amount ? match.cost_amount * totalCount : undefined,
            perCost: companionCount > 0 ? match.cost_amount : undefined,
            companionCount: companionCount > 0 ? companionCount : undefined,
            bankInfo: match.account_info?.bank && match.account_info?.number && match.account_info?.holder
              ? {
                  bank: match.account_info.bank,
                  account: match.account_info.number,
                  holder: match.account_info.holder,
                }
              : undefined,
            applicationInfo: {
              position: getPositionLabel(position, 'combined'),
              appliedAt: app.created_at || '',
              companions: companions.length > 0 ? companions.map((c) => ({
                name: c.name,
                position: getPositionLabel(c.position, 'combined'),
              })) : undefined,
              cancelReason: app.cancel_reason || undefined,
            },
            // Team vote fields
            myVote,
            myVoteReason,
            votingSummary: votingSummaryMap.get(match.id),
            teamId: match.team_id || undefined,
            teamCode: match.team?.code || undefined,
          } as ScheduleMatchListItemDTO;
        });
    },
    enabled: !!user?.id,
  });
}

/**
 * 호스트 경기 상세 조회
 * @param matchIdentifier 경기 식별자(UUID 또는 short_id)
 * @returns HostMatchDetailDTO 형태로 변환된 경기 상세
 */
export function useHostMatchDetail(matchIdentifier: string) {
  return useQuery({
    queryKey: matchManagementKeys.matchDetail(matchIdentifier),
    queryFn: async (): Promise<HostMatchDetailDTO | null> => {
      if (!matchIdentifier) return null;

      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);

      const row = await matchService.getMatchDetail(matchIdentifier);

      // DB Row -> HostMatchDetailDTO 변환
      return toHostMatchDetailDTO(row);
    },
    enabled: !!matchIdentifier,
  });
}

/**
 * 팀운동 투표 목록 조회 (투표현황 모달용)
 * @param matchId 경기 ID
 */
export function useTeamExerciseVotes(matchId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: matchManagementKeys.teamVotes(matchId),
    queryFn: async (): Promise<TeamExerciseVoteItemDTO[]> => {
      if (!matchId) return [];

      const supabase = getSupabaseBrowserClient();
      const teamService = createTeamService(supabase);
      const rows = await teamService.getTeamVotes(matchId);

      return rows.map((row) => {
        const typed = row as typeof row & {
          users?: { id?: string | null; nickname?: string | null; real_name?: string | null } | null;
        };

        return {
          id: row.id,
          userId: row.user_id,
          name: typed.users?.nickname || typed.users?.real_name || '알 수 없음',
          status: toTeamVoteStatus(row.status),
          reason: row.description || undefined,
        };
      });
    },
    enabled: !!matchId && enabled,
  });
}

/**
 * 경기 신청자 목록 조회
 * @param matchId 경기 ID
 * @returns MatchApplicantDTO[] 형태로 변환된 신청자 목록 (팀 참여 이력 포함)
 */
export function useMatchApplicants(matchId: string) {
  return useQuery({
    queryKey: matchManagementKeys.applicants(matchId),
    queryFn: async (): Promise<MatchApplicantDTO[]> => {
      if (!matchId) return [];

      const supabase = getSupabaseBrowserClient();
      const applicationService = createApplicationService(supabase);

      // 1. 현재 경기의 team_id 조회
      const { data: match } = await supabase
        .from('matches')
        .select('team_id')
        .eq('id', matchId)
        .single();

      // team_id가 없으면 이력 조회 불가
      if (!match?.team_id) {
        const applications = await applicationService.getApplicationsByMatch(matchId);
        return applications.map((app) => toMatchApplicantDTO(app));
      }

      // 2. 신청자 목록 조회
      const applications = await applicationService.getApplicationsByMatch(matchId);
      if (applications.length === 0) return [];

      // 3. 각 신청자의 팀 참여 이력 조회 (현재 경기 제외, CONFIRMED만)
      const userIds = applications.map((app) => app.user_id);
      const { data: historyData } = await supabase
        .from('applications')
        .select(`
          user_id,
          created_at,
          match:matches!match_id (id, team_id)
        `)
        .in('user_id', userIds)
        .eq('status', 'CONFIRMED')
        .neq('match_id', matchId);

      // 4. 유저별 이력 집계 (같은 team의 경기만)
      const historyMap = new Map<string, { count: number; lastDate?: string }>();
      if (historyData) {
        for (const row of historyData) {
          const rowMatch = row.match as { id: string; team_id: string | null } | null;
          if (rowMatch?.team_id !== match.team_id) continue;

          const existing = historyMap.get(row.user_id);
          if (existing) {
            existing.count += 1;
            if (row.created_at && (!existing.lastDate || row.created_at > existing.lastDate)) {
              existing.lastDate = row.created_at;
            }
          } else {
            historyMap.set(row.user_id, {
              count: 1,
              lastDate: row.created_at || undefined,
            });
          }
        }
      }

      // 5. DB Application -> MatchApplicantDTO 변환 (이력 포함)
      return applications.map((app) => {
        const history = historyMap.get(app.user_id);
        return toMatchApplicantDTO(app, history ? {
          count: history.count,
          lastDate: history.lastDate ? formatMatchDate(history.lastDate) : undefined,
        } : undefined);
      });
    },
    enabled: !!matchId,
  });
}
