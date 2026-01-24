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
  const position = app.participants_info?.[0]?.position || 'G';
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

  // Match status 변환
  const status = getMatchStatus(match.status);

  // 모집 현황 계산
  const recruitmentSetup = match.recruitment_setup;
  const { applicants, vacancies } = calculateRecruitmentStats(recruitmentSetup);

  return {
    id: match.id,
    type: matchType,
    status,
    teamName: match.team?.name || match.manual_team_name || '팀명 미정',
    date: formatMatchDate(match.start_time),
    time: formatMatchTime(match.start_time),
    location: match.gym?.name || match.gym_address || '장소 미정',
    locationUrl: match.gym?.kakao_place_id
      ? `https://map.kakao.com/link/map/${match.gym.kakao_place_id}`
      : undefined,

    // Host specific
    applicants: type === 'host' ? match.current_players_count : undefined,
    vacancies: type === 'host' ? vacancies : undefined,

    // Guest specific
    amount: type === 'guest' ? match.cost_amount : undefined,
  };
}

// ============================================
// Match → HostMatchDetail Mapper
// ============================================

/**
 * DB Match → UI HostMatchDetail 변환
 */
export function matchToHostMatchDetail(match: MatchWithRelations): HostMatchDetail {
  const recruitmentSetup = match.recruitment_setup;
  const recruitmentMode: RecruitmentMode =
    recruitmentSetup?.type === 'POSITION' ? 'position' : 'total';

  return {
    id: match.id,
    date: formatMatchDate(match.start_time),
    time: formatMatchTime(match.start_time),
    location: match.gym?.name || match.gym_address || '장소 미정',
    locationUrl: match.gym?.kakao_place_id
      ? `https://map.kakao.com/link/map/${match.gym.kakao_place_id}`
      : '#',
    teamName: match.team?.name || match.manual_team_name || '팀명 미정',
    status: match.status, // DB status (RECRUITING, CLOSED, etc.)
    recruitmentMode,
    positionQuotas:
      recruitmentMode === 'position'
        ? getPositionQuotas(recruitmentSetup)
        : undefined,
    totalQuota:
      recruitmentMode === 'total'
        ? {
            current: match.current_players_count || 0,
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

function getMatchStatus(dbStatus: string): MatchStatus {
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
    // current_players_count는 match에서 가져와야 함
    return { applicants: 0, vacancies: max };
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
