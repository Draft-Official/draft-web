/**
 * Match Management Mappers
 * DB 데이터 → UI 타입 변환 함수
 */
import type {
  Application,
  Match,
  User,
  Gym,
  Team,
  RecruitmentSetup,
  ParticipantInfo,
} from '@/shared/types/database.types';
import type { AccountInfo } from '@/shared/types/jsonb.types';
import { formatMatchDate, formatMatchTime } from '@/shared/lib/date';
import { SKILL_LEVEL_NAMES } from '@/shared/config/skill-constants';
import { getPositionLabel } from '@/shared/config/match-constants';
import type {
  ScheduleMatchListItemDTO,
  MatchType,
  MatchManagementType,
  MatchStatus,
  MatchApplicantDTO,
  HostMatchDetailDTO,
  RecruitmentMode,
  PositionQuota,
} from '../model/types';
import { resolveApplicationStatus } from './status-utils';

// ============================================
// Type Guards and Helpers
// ============================================

/**
 * RecruitmentSetup에서 총 현재 인원 계산
 * current_players_count 대신 사용
 */
function getTotalCurrentFromSetup(setup: RecruitmentSetup | null | undefined): number | undefined {
  if (!setup) return undefined;

  if (setup.type === 'ANY') {
    return setup.current_count ?? 0;
  }

  if (setup.type === 'POSITION' && setup.positions) {
    return Object.values(setup.positions).reduce(
      (sum, pos) => sum + (pos?.current || 0),
      0
    );
  }

  return 0;
}

type ApplicationWithUser = Application & {
  user: Pick<User, 'id' | 'nickname' | 'avatar_url' | 'positions' | 'manner_score' | 'metadata' | 'account_info' | 'real_name' | 'phone'>;
  team?: Pick<Team, 'name'> | null;
};

type MatchWithRelations = Match & {
  gym?: Gym | null;
  team?: Pick<Team, 'name'> | null;
};

function isTeamMatch(matchType: string | null | undefined): boolean {
  return matchType === 'TEAM_MATCH';
}

function isTournamentMatch(matchType: string | null | undefined): boolean {
  return matchType === 'TOURNAMENT' || matchType === 'TOURNAMENT_MATCH';
}

function toScheduleMatchType(matchType: string | null | undefined, type: 'host' | 'guest'): MatchType {
  if (isTeamMatch(matchType)) return 'team';
  if (isTournamentMatch(matchType)) return 'tournament';
  return type === 'host' ? 'host' : 'guest';
}

function toMatchManagementType(matchType: string | null | undefined): MatchManagementType {
  if (isTeamMatch(matchType)) return 'team_exercise';
  if (isTournamentMatch(matchType)) return 'tournament';
  return 'guest_recruitment';
}

// ============================================
// Guest Status Logic
// ============================================

export function getGuestStatus(application: Application) {
  return resolveApplicationStatus(application.status ?? 'PENDING');
}

// ============================================
// Application → MatchApplicantDTO Mapper
// ============================================

/**
 * DB Application → MatchApplicantDTO 변환
 * @param matchHistory 팀 참여 이력 (별도 쿼리로 조회됨)
 */
export function toMatchApplicantDTO(
  app: ApplicationWithUser,
  matchHistory?: { count: number; lastDate?: string }
): MatchApplicantDTO {
  const participants = (app.participants_info as ParticipantInfo[] | null) || [];
  const position = participants[0]?.position || 'G';
  const positionLabel = getPositionLabel(position, 'combined');

  // User metadata에서 height, age, skill_level, display_team_name 추출 (있는 경우)
  const userMetadata = app.user?.metadata as { height?: number; age?: number; skill_level?: number; display_team_name?: string } | null;
  const height = userMetadata?.height;
  const age = userMetadata?.age;

  // 동반인 추출 (type === 'GUEST')
  const companions = participants
    .filter((p) => p.type === 'GUEST')
    .map((p) => ({
      name: p.name,
      position: getPositionLabel(p.position, 'combined'),
      height: p.height ? `${p.height}cm` : undefined,
      age: p.age ? `${p.age}세` : undefined,
      skillLevel: p.skillLevel ? (SKILL_LEVEL_NAMES[p.skillLevel] || `Lv.${p.skillLevel}`) : undefined,
    }));

  // 계좌 정보 추출
  const accountRaw = app.user?.account_info as unknown as AccountInfo | null;
  const accountInfo = accountRaw
    ? { bank: accountRaw.bank, number: accountRaw.number, holder: accountRaw.holder }
    : undefined;

  return {
    id: app.id,
    name: app.user.nickname || '이름 없음',
    realName: app.user.real_name || undefined,
    position: positionLabel,
    level: userMetadata?.skill_level
      ? (SKILL_LEVEL_NAMES[userMetadata.skill_level] || `Lv.${userMetadata.skill_level}`)
      : '정보 없음',
    ageGroup: age ? `${age}세` : '정보 없음',
    height: height ? `${height}cm` : '정보 없음',
    status: getGuestStatus(app),
    paymentVerified: !!app.payment_verified_at, // 호스트 내부 관리용 입금 확인 여부
    avatar: app.user.avatar_url || undefined,
    teamName: app.team?.name || userMetadata?.display_team_name || undefined,
    companions: companions.length > 0 ? companions : undefined,
    appliedAt: app.created_at || undefined,
    accountInfo,
    matchHistory,
    phone: app.user.phone || undefined,
  };
}

// ============================================
// Match → ScheduleMatchListItemDTO Mapper
// ============================================

/**
 * DB match_type → UI MatchType 변환
 */
function dbMatchTypeToMatchType(dbMatchType: string | null | undefined): MatchType {
  if (dbMatchType === 'TEAM_MATCH') return 'team';
  if (dbMatchType === 'TOURNAMENT') return 'tournament';
  return 'guest'; // GUEST_RECRUIT, PICKUP, 기타 → guest
}

/**
 * DB Match → ScheduleMatchListItemDTO 변환
 */
export function toScheduleMatchListItemDTO(
  match: MatchWithRelations,
  type: 'host' | 'guest'
): ScheduleMatchListItemDTO {
  const matchType = toScheduleMatchType(match.match_type, type);
  const managementType = toMatchManagementType(match.match_type);
  const scheduleMode = type === 'host' ? 'managing' : 'participating';

  // Match status 변환 (시간 기반 파생 포함)
  const status = getMatchStatus(match.status || 'RECRUITING', match.start_time, match.end_time);

  // 모집 현황 계산
  const recruitmentSetup = match.recruitment_setup as RecruitmentSetup | null;
  const { vacancies } = calculateRecruitmentStats(recruitmentSetup ?? undefined);

  return {
    id: match.id,
    publicId: match.short_id,
    managementType,
    matchType,
    scheduleMode,
    type: matchType, // legacy compatibility
    status,
    teamName: match.team?.name || match.manual_team_name || '팀명 미정',
    date: formatMatchDate(match.start_time),
    time: formatMatchTime(match.start_time),
    startTimeISO: match.start_time || '',
    location: match.gym?.name || '장소 미정',
    locationUrl: match.gym?.kakao_place_id
      ? `https://map.kakao.com/link/map/${match.gym.kakao_place_id}`
      : undefined,

    // Host specific
    // recruitment_setup에서 현재 인원 계산 (current_players_count deprecated)
    applicants: type === 'host' ? getTotalCurrentFromSetup(recruitmentSetup) : undefined,
    vacancies: type === 'host' ? vacancies : undefined,

    // Guest specific
    totalCost: type === 'guest' ? (match.cost_amount ?? undefined) : undefined,
  };
}

// ============================================
// Match → HostMatchDetailDTO Mapper
// ============================================

/**
 * DB Match → HostMatchDetailDTO 변환
 */
export function toHostMatchDetailDTO(match: MatchWithRelations): HostMatchDetailDTO {
  const recruitmentSetup = match.recruitment_setup as RecruitmentSetup | null;
  const recruitmentMode: RecruitmentMode =
    recruitmentSetup?.type === 'POSITION' ? 'position' : 'total';

  return {
    id: match.id,
    publicId: match.short_id,
    date: formatMatchDate(match.start_time),
    time: formatMatchTime(match.start_time),
    endTimeISO: match.end_time || '',
    location: match.gym?.name || '장소 미정',
    locationUrl: match.gym?.kakao_place_id
      ? `https://map.kakao.com/link/map/${match.gym.kakao_place_id}`
      : '#',
    teamName: match.team?.name || match.manual_team_name || '팀명 미정',
    status: match.status ?? 'RECRUITING', // DB status (RECRUITING, CLOSED, etc.)
    recruitmentMode,
    positionQuotas:
      recruitmentMode === 'position'
        ? getPositionQuotas(recruitmentSetup ?? undefined)
        : undefined,
    totalQuota:
      recruitmentMode === 'total'
        ? {
            // recruitment_setup.current_count 사용 (current_players_count deprecated)
            current: recruitmentSetup?.current_count ?? 0,
            max: recruitmentSetup?.max_count || 10,
          }
        : undefined,
  };
}

// ============================================
// Helper Functions
// ============================================

function getMatchStatus(
  dbStatus: string,
  startTime?: string,
  endTime?: string,
): MatchStatus {
  // 시간 기반 파생 상태 (시간이 DB 상태보다 우선)
  if (startTime && endTime) {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now >= end) {
      return dbStatus === 'CANCELED' ? 'cancelled' : 'ended';
    }
    if (now >= start) {
      return 'ongoing';
    }
  }

  const statusMap: Record<string, MatchStatus> = {
    RECRUITING: 'recruiting',   // 모집 중
    CLOSED: 'closed',           // 모집 마감
    CONFIRMED: 'confirmed',     // 경기 확정
    ONGOING: 'ongoing',         // 경기 중
    FINISHED: 'ended',          // 종료
    COMPLETED: 'ended',         // 종료 (legacy)
    CANCELED: 'cancelled',      // 취소
  };
  return statusMap[dbStatus] || 'recruiting';
}

function calculateRecruitmentStats(setup?: RecruitmentSetup): {
  applicants: number;
  vacancies: number;
} {
  if (!setup) {
    return { applicants: 0, vacancies: 10 };
  }

  if (setup.type === 'ANY') {
    const max = setup.max_count ?? 10;
    const current = setup.current_count ?? 0;
    return { applicants: current, vacancies: Math.max(0, max - current) };
  }

  // POSITION 타입 - 포지션별로 각각 계산 (한 포지션 초과가 다른 포지션 빈자리에 영향 X)
  let totalCurrent = 0;
  let totalVacancy = 0;

  if (setup.positions) {
    const positions = setup.positions as Record<string, { max: number; current: number } | undefined>;
    for (const pos of Object.values(positions)) {
      if (pos) {
        totalCurrent += pos.current || 0;
        totalVacancy += Math.max(0, (pos.max || 0) - (pos.current || 0));
      }
    }
  }

  return {
    applicants: totalCurrent,
    vacancies: totalVacancy,
  };
}

function getPositionQuotas(setup?: RecruitmentSetup): PositionQuota[] {
  if (!setup?.positions) return [];

  const positionConfig = [
    { key: 'G', label: '가드' },
    { key: 'F', label: '포워드' },
    { key: 'C', label: '센터' },
    { key: 'B', label: '빅맨' },
  ];

  return positionConfig
    .filter((p) => setup.positions?.[p.key as keyof typeof setup.positions])
    .map((p) => {
      const pos = setup.positions![p.key as keyof typeof setup.positions]!;
      return {
        position: p.key,
        label: p.label,
        current: pos.current || 0,
        max: pos.max || 0,
      };
    });
}
