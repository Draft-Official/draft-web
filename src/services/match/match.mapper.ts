/**
 * Match 타입 매퍼
 * DB Row 타입 <-> 클라이언트 타입 변환
 */
import type { Match as MatchRow } from '@/shared/types/database.types';
import { MatchType } from '@/shared/types/match';
import type {
  GuestListMatch,
  HostDashboardMatch,
  MatchStatus,
} from '@/shared/types/match';

// 호스트 정보가 포함된 매치 Row
type MatchWithHost = MatchRow & {
  host: {
    id: string;
    nickname: string | null;
    avatar_url: string | null;
    manner_score: number;
  } | null;
};

// 신청 정보가 포함된 매치 Row
type MatchWithApplications = MatchRow & {
  applications: Array<{
    id: string;
    status: string;
    position: string;
  }>;
};

/**
 * DB position_type -> 클라이언트 Position 변환
 */
export function dbPositionToClient(
  dbPosition: 'guard' | 'forward' | 'center'
): 'G' | 'F' | 'C' {
  const map = {
    guard: 'G' as const,
    forward: 'F' as const,
    center: 'C' as const,
  };
  return map[dbPosition];
}

/**
 * 클라이언트 Position -> DB position_type 변환
 */
export function clientPositionToDb(
  position: 'G' | 'F' | 'C'
): 'guard' | 'forward' | 'center' {
  const map = {
    G: 'guard' as const,
    F: 'forward' as const,
    C: 'center' as const,
  };
  return map[position];
}

/**
 * DB status -> 클라이언트 MatchStatus 변환
 */
export function dbStatusToClient(dbStatus: string): MatchStatus {
  const map: Record<string, MatchStatus> = {
    recruiting: 'recruiting' as MatchStatus,
    closed: 'closed' as MatchStatus,
    finished: 'closed' as MatchStatus,
  };
  return map[dbStatus] || ('recruiting' as MatchStatus);
}

/**
 * DB Match Row -> GuestListMatch 변환
 * 게스트 매치 목록 표시용
 */
export function matchRowToGuestListMatch(row: MatchWithHost): GuestListMatch {
  const startDate = new Date(row.start_time);

  return {
    id: row.id,
    title: row.title,
    matchType: MatchType.GUEST_RECRUIT,

    // Location
    location: {
      name: row.location_name,
      address: row.location_address || '',
      latitude: 0, // DB에 없으면 기본값 (Phase 2에서 추가 예정)
      longitude: 0,
    },

    // DateTime
    dateISO: startDate.toISOString().split('T')[0],
    startTime: startDate.toTimeString().slice(0, 5),

    // Price
    price: {
      base: row.fee,
      final: row.fee,
    },

    // Positions
    positions: {
      G: {
        open: row.vacancy_guards,
        closed: row.max_guards - row.vacancy_guards,
      },
      F: {
        open: row.vacancy_forwards,
        closed: row.max_forwards - row.vacancy_forwards,
      },
      C: {
        open: row.vacancy_centers,
        closed: row.max_centers - row.vacancy_centers,
      },
    },

    // Team info
    teamName: row.host?.nickname || '호스트',

    // Default values (Phase 2에서 DB 필드 추가 예정)
    level: 'intermediate',
    gender: 'men',
    gameFormat: '5vs5',
    courtType: 'indoor',
    facilities: {},
  };
}

/**
 * DB Match Row -> HostDashboardMatch 변환
 * 호스트 대시보드 표시용
 */
export function matchRowToHostDashboardMatch(
  row: MatchWithApplications
): HostDashboardMatch {
  const startDate = new Date(row.start_time);
  const now = new Date();

  // 확정된 신청 수 계산
  const confirmedCount = row.applications.filter(
    (app) => app.status === 'confirmed'
  ).length;

  // 대기 중인 신청 수 계산
  const pendingCount = row.applications.filter(
    (app) => app.status === 'pending_payment' || app.status === 'verification_pending'
  ).length;

  // 총 모집 인원
  const totalSlots = row.max_guards + row.max_forwards + row.max_centers;

  return {
    id: row.id,
    title: row.title,
    matchType: MatchType.GUEST_RECRUIT,

    location: {
      name: row.location_name,
      address: row.location_address || '',
      latitude: 0,
      longitude: 0,
    },

    dateISO: startDate.toISOString().split('T')[0],
    startTime: startDate.toTimeString().slice(0, 5),

    price: {
      base: row.fee,
      final: row.fee,
    },

    facilities: {},

    // Host Dashboard specific
    status: dbStatusToClient(row.status),
    stats: {
      total: totalSlots,
      confirmed: confirmedCount,
      left: totalSlots - confirmedCount,
    },
    pendingCount,
    isPast: startDate < now,
  };
}

/**
 * 매치 생성 폼 데이터 -> DB Insert 데이터 변환
 */
export function matchCreateFormToInsert(
  formData: {
    title: string;
    location: { name: string; address: string };
    date: string;
    startTime: string;
    endTime: string;
    price: number;
    recruitment: {
      type: 'position' | 'any';
      guard?: number;
      forward?: number;
      center?: number;
      total?: number;
    };
    notice?: string;
  },
  hostId: string
): {
  host_id: string;
  title: string;
  description: string | null;
  location_name: string;
  location_address: string | null;
  start_time: string;
  end_time: string | null;
  fee: number;
  max_guards: number;
  max_forwards: number;
  max_centers: number;
  vacancy_guards: number;
  vacancy_forwards: number;
  vacancy_centers: number;
  status: string;
} {
  const recruitment = formData.recruitment;

  // 포지션별 모집이면 각 포지션 인원, 아니면 전체를 가드로
  const guards =
    recruitment.type === 'position' ? (recruitment.guard || 0) : (recruitment.total || 0);
  const forwards = recruitment.type === 'position' ? (recruitment.forward || 0) : 0;
  const centers = recruitment.type === 'position' ? (recruitment.center || 0) : 0;

  return {
    host_id: hostId,
    title: formData.title,
    description: formData.notice || null,
    location_name: formData.location.name,
    location_address: formData.location.address || null,
    start_time: `${formData.date}T${formData.startTime}:00+09:00`,
    end_time: formData.endTime
      ? `${formData.date}T${formData.endTime}:00+09:00`
      : null,
    fee: formData.price,
    max_guards: guards,
    max_forwards: forwards,
    max_centers: centers,
    vacancy_guards: guards,
    vacancy_forwards: forwards,
    vacancy_centers: centers,
    status: 'recruiting',
  };
}
