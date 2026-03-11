/**
 * Match Management Query Hooks
 * 경기 관리 데이터 조회용 React Query hooks
 */
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

const PAGE_SIZE = 20;

type SchedulePage = { matches: ScheduleMatchListItemDTO[]; nextCursor: number | undefined };
type CursorPage<TItem> = { items: TItem[]; nextCursor: number | undefined };
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createMatchService } from '@/entities/match';
import {
  createApplicationService,
  countTeamVoteParticipants,
  extractTeamVoteGuestNames,
  toTeamVoteStatus,
} from '@/entities/application';
import { createTeamService } from '@/entities/team';
import { useAuth } from '@/shared/session';
import { formatMatchDate, formatMatchTimeRange } from '@/shared/lib/datetime';
import { getPositionLabel } from '@/shared/config/match-constants';
import type { TeamVoteStatusValue } from '@/shared/config/application-constants';
import { matchManagementKeys } from './keys';
import { PAST_MATCH_STATUSES } from '../config/constants';
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

interface UseScheduleMatchesOptions {
  includePast?: boolean;
}

async function findFirstVisibleCursorPage<TItem>({
  startCursor,
  fetchPage,
  hasVisibleItems,
}: {
  startCursor: number;
  fetchPage: (cursor: number) => Promise<CursorPage<TItem>>;
  hasVisibleItems: (items: TItem[]) => boolean;
}): Promise<CursorPage<TItem> | undefined> {
  let cursor = startCursor;

  while (true) {
    const page = await fetchPage(cursor);
    if (page.items.length === 0) return undefined;
    if (hasVisibleItems(page.items)) return page;
    if (page.nextCursor === undefined) return undefined;

    cursor = page.nextCursor;
  }
}

async function findNextVisibleCursorPage<TItem>({
  startCursor,
  fetchPage,
  hasVisibleItems,
}: {
  startCursor: number | undefined;
  fetchPage: (cursor: number) => Promise<CursorPage<TItem>>;
  hasVisibleItems: (items: TItem[]) => boolean;
}): Promise<number | undefined> {
  if (startCursor === undefined) return undefined;
  let cursor = startCursor;

  while (true) {
    const page = await fetchPage(cursor);
    if (page.items.length === 0) return undefined;
    if (hasVisibleItems(page.items)) return cursor;
    if (page.nextCursor === undefined) return undefined;

    cursor = page.nextCursor;
  }
}

/**
 * 내가 주최한 경기 목록 조회
 * @returns ScheduleMatchListItemDTO[] 형태로 변환된 호스트 경기 목록
 */
export function useHostedMatches(options: UseScheduleMatchesOptions = {}) {
  const { user } = useAuth();
  const includePast = options.includePast ?? true;

  return useInfiniteQuery({
    queryKey: [
      ...matchManagementKeys.hostedMatches(user?.id ?? ''),
      includePast ? 'with-past' : 'without-past',
    ],
    initialPageParam: 0,
    getNextPageParam: (lastPage: SchedulePage) => lastPage.nextCursor,
    queryFn: async ({ pageParam }): Promise<SchedulePage> => {
      if (!user?.id) return { matches: [], nextCursor: undefined };

      const supabase = getSupabaseBrowserClient();
      const matchService = createMatchService(supabase);
      type HostedMatchRow = Awaited<ReturnType<typeof matchService.getMyHostedMatches>>['matches'][number];
      const isPastMatch = (status: ScheduleMatchListItemDTO['status']) =>
        PAST_MATCH_STATUSES.includes(status);
      const hasVisibleRows = (rows: HostedMatchRow[]) =>
        rows.some((row) => !isPastMatch(toScheduleMatchListItemDTO(row, 'host').status));
      const fetchHostedMatchPage = async (cursor: number): Promise<CursorPage<HostedMatchRow>> => {
        const page = await matchService.getMyHostedMatches(user.id, PAGE_SIZE, cursor);
        return {
          items: page.matches,
          nextCursor: page.nextCursor,
        };
      };

      let rows: HostedMatchRow[] = [];
      let nextCursor: number | undefined;

      if (includePast) {
        const page = await matchService.getMyHostedMatches(user.id, PAGE_SIZE, pageParam);
        rows = page.matches;
        nextCursor = page.nextCursor;
      } else {
        const page = await findFirstVisibleCursorPage({
          startCursor: pageParam,
          fetchPage: fetchHostedMatchPage,
          hasVisibleItems: hasVisibleRows,
        });
        if (!page) return { matches: [], nextCursor: undefined };
        rows = page.items;
        nextCursor = page.nextCursor;
      }

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
        const teamMatchIds = teamRows.map((r) => r.id);
        const [{ data: allVotes }, { data: myVotes }] = await Promise.all([
          supabase
            .from('applications')
            .select('match_id, status, participants_info')
            .in('match_id', teamMatchIds)
            .eq('source', 'TEAM_VOTE'),
          supabase
            .from('applications')
            .select('match_id, status, description')
            .in('match_id', teamMatchIds)
            .eq('user_id', user.id)
            .eq('source', 'TEAM_VOTE'),
        ]);

        for (const matchId of teamMatchIds) {
          votingSummaryMap.set(matchId, { attending: 0, notAttending: 0, pending: 0 });
        }

        for (const vote of allVotes ?? []) {
          const count = countTeamVoteParticipants(vote.participants_info);
          const entry = votingSummaryMap.get(vote.match_id)!;
          switch (vote.status) {
            case 'CONFIRMED':
            case 'LATE':
              entry.attending += count;
              break;
            case 'NOT_ATTENDING':
              entry.notAttending += count;
              break;
            case 'PENDING':
              entry.pending += count;
              break;
          }
        }

        for (const vote of myVotes ?? []) {
          myVoteMap.set(vote.match_id, {
            vote: toTeamVoteStatus(vote.status),
            reason: vote.description || undefined,
          });
        }
      }

      // DB Row -> ScheduleMatchListItemDTO 변환
      const mappedMatches = rows.map((row) => {
        const dto = toScheduleMatchListItemDTO(row, 'host');
        const myVoteData = myVoteMap.get(row.id);
        const isTeamExercise = row.match_type === 'TEAM_MATCH';
        return {
          ...dto,
          // 게스트 모집 경기: 실제 신청자 수(PENDING + PAYMENT_PENDING)로 덮어씌우기
          applicants: row.match_type !== 'TEAM_MATCH'
            ? (applicantCountMap.get(row.id) ?? 0)
            : dto.applicants,
          myVote: myVoteData?.vote,
          myVoteReason: myVoteData?.reason,
          isVotingClosed: isTeamExercise ? row.status === 'CLOSED' : undefined,
          votingSummary: votingSummaryMap.get(row.id),
          teamId: row.team_id || undefined,
          teamCode: (row.team as { name: string; code?: string | null; logo_url?: string | null })?.code || undefined,
          teamLogoUrl: (row.team as { name: string; code?: string | null; logo_url?: string | null })?.logo_url ?? null,
        };
      });
      const matches = includePast
        ? mappedMatches
        : mappedMatches.filter((match) => !isPastMatch(match.status));
      const resolvedNextCursor = includePast
        ? nextCursor
        : await findNextVisibleCursorPage({
            startCursor: nextCursor,
            fetchPage: fetchHostedMatchPage,
            hasVisibleItems: hasVisibleRows,
          });

      return { matches, nextCursor: resolvedNextCursor };
    },
    enabled: !!user?.id,
  });
}

/**
 * 내가 참여한 경기 목록 조회 (게스트로 신청한 경기)
 * @returns ScheduleMatchListItemDTO[] 형태로 변환된 참여 경기 목록
 */
export function useParticipatingMatches(options: UseScheduleMatchesOptions = {}) {
  const { user } = useAuth();
  const includePast = options.includePast ?? true;

  return useInfiniteQuery({
    queryKey: [
      ...matchManagementKeys.participatingMatches(user?.id ?? ''),
      includePast ? 'with-past' : 'without-past',
    ],
    initialPageParam: 0,
    getNextPageParam: (lastPage: SchedulePage) => lastPage.nextCursor,
    queryFn: async ({ pageParam }): Promise<SchedulePage> => {
      if (!user?.id) return { matches: [], nextCursor: undefined };

      const supabase = getSupabaseBrowserClient();
      const fetchApplicationPage = async (offset: number) => {
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
              team:teams!team_id (name, code, logo_url)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(offset, offset + PAGE_SIZE - 1);

        if (error) throw error;
        if (!applications) return { applications: [], nextCursor: undefined };

        return {
          applications,
          nextCursor: applications.length === PAGE_SIZE ? offset + PAGE_SIZE : undefined,
        };
      };
      const fetchParticipatingApplicationPage = async (
        cursor: number
      ): Promise<CursorPage<{ match?: unknown; status?: string | null }>> => {
        const page = await fetchApplicationPage(cursor);
        return {
          items: page.applications,
          nextCursor: page.nextCursor,
        };
      };

      const isPastApplication = (app: { match?: unknown; status?: string | null }) => {
        if (!app.match) return true;
        const match = app.match as ParticipatingMatchRow;
        const baseStatus = resolveApplicationStatus(app.status ?? 'PENDING');
        const matchEnded = Boolean(match.end_time && new Date() >= new Date(match.end_time));
        return matchEnded || baseStatus === 'rejected' || baseStatus === 'canceled';
      };

      const hasVisibleApplications = (applications: { match?: unknown; status?: string | null }[]) =>
        applications.some((app) => !isPastApplication(app));

      let applications: Array<{ match?: unknown; status?: string | null; [key: string]: unknown }> = [];
      let nextCursor: number | undefined;

      if (includePast) {
        const page = await fetchApplicationPage(pageParam);
        applications = page.applications;
        nextCursor = page.nextCursor;
      } else {
        const page = await findFirstVisibleCursorPage({
          startCursor: pageParam,
          fetchPage: fetchParticipatingApplicationPage,
          hasVisibleItems: hasVisibleApplications,
        });
        if (!page) return { matches: [], nextCursor: undefined };
        applications = page.items;
        nextCursor = page.nextCursor;
      }

      // match가 있는 것만 필터
      const validApps = applications.filter((app) => app.match);

      // Team 매치의 투표 현황을 한 번에 조회
      const teamMatchIds = validApps
        .filter((app) => (app.match as ParticipatingMatchRow).match_type === 'TEAM_MATCH')
        .map((app) => (app.match as ParticipatingMatchRow).id);

      const votingSummaryMap = new Map<string, { attending: number; notAttending: number; pending: number }>();
      if (teamMatchIds.length > 0) {
        const { data: allVotes } = await supabase
          .from('applications')
          .select('match_id, status, participants_info')
          .in('match_id', teamMatchIds)
          .eq('source', 'TEAM_VOTE');

        for (const matchId of teamMatchIds) {
          votingSummaryMap.set(matchId, { attending: 0, notAttending: 0, pending: 0 });
        }

        for (const vote of allVotes ?? []) {
          const count = countTeamVoteParticipants(vote.participants_info);
          const entry = votingSummaryMap.get(vote.match_id)!;
          switch (vote.status) {
            case 'CONFIRMED':
            case 'LATE':
              entry.attending += count;
              break;
            case 'NOT_ATTENDING':
              entry.notAttending += count;
              break;
            case 'PENDING':
              entry.pending += count;
              break;
          }
        }
      }

      // DB Application → ScheduleMatchListItemDTO 변환
      const mappedMatches = validApps.map((app) => {
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
          const myVote = managementType === 'team_exercise' ? toTeamVoteStatus(app.status) : undefined;
          const myVoteReason = managementType === 'team_exercise' ? (app.description || undefined) : undefined;
          const isVotingClosed = managementType === 'team_exercise' ? match.status === 'CLOSED' : undefined;

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
            time: formatMatchTimeRange(match.start_time, match.end_time),
            startTimeISO: match.start_time || '',
            endTimeISO: match.end_time || '',
            location: match.gym?.name || match.gym?.address || '장소 미정',
            locationUrl: match.gym?.kakao_place_id ? `https://map.kakao.com/link/map/${match.gym.kakao_place_id}` : undefined,
            applicationId: app.id,
            approvalStatus: approvalStatusText,
            paymentNotifiedAt: (app as unknown as { payment_notified_at?: string }).payment_notified_at || undefined,
            costType: match.cost_type,
            totalCost: match.cost_amount != null ? match.cost_amount * totalCount : undefined,
            perCost: companionCount > 0 && match.cost_amount != null ? match.cost_amount : undefined,
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
            isVotingClosed,
            votingSummary: votingSummaryMap.get(match.id),
            teamId: match.team_id || undefined,
            teamCode: match.team?.code || undefined,
            teamLogoUrl: match.team?.logo_url ?? null,
          } as ScheduleMatchListItemDTO;
        });
      const matches = includePast
        ? mappedMatches
        : mappedMatches.filter((match) => !PAST_MATCH_STATUSES.includes(match.status));
      const resolvedNextCursor = includePast
        ? nextCursor
        : await findNextVisibleCursorPage({
            startCursor: nextCursor,
            fetchPage: fetchParticipatingApplicationPage,
            hasVisibleItems: hasVisibleApplications,
          });

      return { matches, nextCursor: resolvedNextCursor };
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
        const guestNames = extractTeamVoteGuestNames(row.participants_info);

        return {
          id: row.id,
          userId: row.user_id,
          name: typed.users?.nickname || typed.users?.real_name || '알 수 없음',
          status: toTeamVoteStatus(row.status),
          reason: row.description || undefined,
          guestNames,
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
