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
import type {
  ManagedMatch,
  MatchType,
  MatchStatus,
  Guest,
  GuestStatus,
  HostMatchDetail,
  RecruitmentMode,
  PositionQuota,
} from '../model/types';

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
  user: Pick<User, 'id' | 'nickname' | 'avatar_url' | 'positions' | 'manner_score'> & {
    metadata?: { height?: number };
  };
};

type MatchWithRelations = Match & {
  gym?: Gym | null;
  team?: Pick<Team, 'name'> | null;
};

// ============================================
// Guest Status Logic
// ============================================

/**
 * DB Application status → UI GuestStatus 변환
 *
 * 상태 해석:
 * - PENDING + approved_at IS NULL → 신청자 (pending)
 * - PENDING + approved_at IS NOT NULL → 입금대기 (payment_waiting)
 * - CONFIRMED → 확정
 * - REJECTED / CANCELED → 거절
 */
export function getGuestStatus(application: Application): GuestStatus {
  const { status, approved_at } = application;

  if (status === 'CONFIRMED') return 'confirmed';
  if (status === 'REJECTED' || status === 'CANCELED') return 'rejected';

  // PENDING 상태: approved_at 유무로 구분
  if (status === 'PENDING') {
    return approved_at ? 'payment_waiting' : 'pending';
  }

  return 'pending';
}

// ============================================
// Application → Guest Mapper
// ============================================

/**
 * DB Application → UI Guest 변환
 */
export function applicationToGuest(app: ApplicationWithUser): Guest {
  const participants = (app.participants_info as ParticipantInfo[] | null) || [];
  const position = participants[0]?.position || 'G';
  const positionLabel = getPositionLabel(position);

  // User metadata에서 height 추출 (있는 경우)
  const height = (app.user as { metadata?: { height?: number } })?.metadata?.height;

  return {
    id: app.id,
    name: app.user.nickname || '이름 없음',
    position: positionLabel,
    level: getLevelLabel(app.user.manner_score || 0),
    ageGroup: '정보 없음', // DB에 age_group이 없어서 기본값
    height: height ? `${height}cm` : '정보 없음',
    status: getGuestStatus(app),
    paymentVerified: !!app.payment_verified_at, // 호스트 내부 관리용 입금 확인 여부
    avatar: app.user.avatar_url || undefined,
    // matchHistory는 별도 쿼리 필요 (추후 구현)
  };
}

// ============================================
// Match → ManagedMatch Mapper
// ============================================

/**
 * DB Match → UI ManagedMatch 변환
 */
export function matchToManagedMatch(
  match: MatchWithRelations,
  type: 'host' | 'guest'
): ManagedMatch {
  const matchType: MatchType = type === 'host' ? 'host' : 'guest';

  // Match status 변환 (시간 기반 파생 포함)
  const status = getMatchStatus(match.status || 'RECRUITING', match.start_time, match.end_time);

  // 모집 현황 계산
  const recruitmentSetup = match.recruitment_setup as RecruitmentSetup | null;
  const { applicants, vacancies } = calculateRecruitmentStats(recruitmentSetup ?? undefined);

  return {
    id: match.id,
    type: matchType,
    status,
    teamName: match.team?.name || match.manual_team_name || '팀명 미정',
    date: formatMatchDate(match.start_time),
    time: formatMatchTime(match.start_time),
    location: match.gym?.name || '장소 미정',
    locationUrl: match.gym?.kakao_place_id
      ? `https://map.kakao.com/link/map/${match.gym.kakao_place_id}`
      : undefined,

    // Host specific
    // recruitment_setup에서 현재 인원 계산 (current_players_count deprecated)
    applicants: type === 'host' ? getTotalCurrentFromSetup(recruitmentSetup) : undefined,
    vacancies: type === 'host' ? vacancies : undefined,

    // Guest specific
    amount: type === 'guest' ? (match.cost_amount ?? undefined) : undefined,
  };
}

// ============================================
// Match → HostMatchDetail Mapper
// ============================================

/**
 * DB Match → UI HostMatchDetail 변환
 */
export function matchToHostMatchDetail(match: MatchWithRelations): HostMatchDetail {
  const recruitmentSetup = match.recruitment_setup as RecruitmentSetup | null;
  const recruitmentMode: RecruitmentMode =
    recruitmentSetup?.type === 'POSITION' ? 'position' : 'total';

  return {
    id: match.id,
    date: formatMatchDate(match.start_time),
    time: formatMatchTime(match.start_time),
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

function getPositionLabel(position: string): string {
  const labels: Record<string, string> = {
    G: '가드 (G)',
    F: '포워드 (F)',
    C: '센터 (C)',
    B: '빅맨 (F/C)',
  };
  return labels[position] || position;
}

function getLevelLabel(mannerScore: number): string {
  // manner_score를 레벨로 변환 (임시 로직)
  if (mannerScore >= 4.5) return '상급 (Lv.7)';
  if (mannerScore >= 4.0) return '상급 (Lv.6)';
  if (mannerScore >= 3.5) return '중급 (Lv.5)';
  if (mannerScore >= 3.0) return '중급 (Lv.4)';
  if (mannerScore >= 2.5) return '초급 (Lv.3)';
  if (mannerScore >= 2.0) return '초급 (Lv.2)';
  return '초급 (Lv.1)';
}

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
      return dbStatus === 'CONFIRMED' ? 'ended' : 'cancelled';
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
    const max = setup.max_count || 10;
    const current = setup.current_count ?? 0;
    return { applicants: current, vacancies: Math.max(0, max - current) };
  }

  // POSITION 타입
  let totalCurrent = 0;
  let totalMax = 0;

  if (setup.positions) {
    const positions = setup.positions as Record<string, { max: number; current: number } | undefined>;
    for (const pos of Object.values(positions)) {
      if (pos) {
        totalCurrent += pos.current || 0;
        totalMax += pos.max || 0;
      }
    }
  }

  return {
    applicants: totalCurrent,
    vacancies: Math.max(0, totalMax - totalCurrent),
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

function formatMatchDate(dateString: string): string {
  const date = new Date(dateString);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dayName = days[date.getDay()];

  return `${year}. ${month}. ${day} (${dayName})`;
}

function formatMatchTime(dateString: string): string {
  const date = new Date(dateString);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}
