/**
 * 경기 관리 페이지 타입 정의
 * Phase 2 확장성 가이드라인 준수
 */

// 경기 타입 (MVP + Phase 2)
export type MatchType = 'guest' | 'host' | 'team' | 'tournament';

// 경기 상태
export type MatchStatus =
  | 'recruiting'      // 모집 중 (호스트)
  | 'waiting'         // 대기 중 (승인대기, 결제 대기, 투표 중)
  | 'payment_waiting' // 결제 대기
  | 'voting'          // 투표 중
  | 'confirmed'       // 경기 확정
  | 'ongoing'         // 경기 중
  | 'ended'           // 종료
  | 'cancelled'       // 취소/거절
  // Legacy (기존 호환용)
  | 'scheduled'
  | 'pending'
  | 'closed'
  | 'rejected';

// 경기 관리 아이템 인터페이스
export interface ManagedMatch {
  id: string;
  type: MatchType;
  status: MatchStatus;
  teamName: string;
  date: string;       // YYYY. MM. DD (Day)
  time: string;       // HH:mm
  startTimeISO: string; // ISO timestamp (정렬용)
  location: string;
  locationUrl?: string;

  // Guest specific
  applicationId?: string; // 게스트 신청 ID (송금 완료 처리용)
  approvalStatus?: string;
  totalCost?: number;    // 총금액 (본인 + 동반인)
  perCost?: number;      // 인당 금액
  companionCount?: number; // 동반인 수
  bankInfo?: {
    bank: string;
    account: string;
    holder: string;
  };
  // 신청 정보 (바텀시트용)
  applicationInfo?: {
    position: string;
    appliedAt: string;
    companions?: {
      name: string;
      position: string;
    }[];
    cancelReason?: string; // 거절/취소 사유
  };

  // Host specific
  applicants?: number;
  vacancies?: number;

  // Team specific
  participants?: number;

  // Tournament specific
  tournamentName?: string;
  round?: string;
}

// 필터 옵션 타입
export interface FilterOption<T extends string = string> {
  value: T;
  label: string;
}

// ============================================
// 경기 상세 페이지 타입 정의
// ============================================

// 게스트 상태 (호스트 관리용)
export type GuestStatus = 'pending' | 'payment_waiting' | 'confirmed' | 'rejected' | 'canceled';

// 모집 방식
export type RecruitmentMode = 'position' | 'total';

// 동반인 정보
export interface CompanionInfo {
  name: string;
  position: string;
  height?: string;
  age?: string;
  skillLevel?: string;
}

// 참여자 기본 정보
export interface Participant {
  id: string;
  name: string;
  position: string;
  level: string;
  ageGroup: string;
  height: string;
  avatar?: string;
}

// 게스트 정보 (호스트 관리용)
export interface Guest extends Participant {
  status: GuestStatus;
  paymentVerified?: boolean; // 호스트 내부 관리용 입금 확인 여부
  teamName?: string; // 신청 시 선택한 팀
  companions?: CompanionInfo[];
  appliedAt?: string; // 신청 시간 (ISO timestamp)
  accountInfo?: {
    bank?: string;
    number?: string;
    holder?: string;
  };
  matchHistory?: {
    count: number;
    lastDate?: string;
  };
}

// 포지션별 모집 인원
export interface PositionQuota {
  position: string;
  label: string;
  current: number;
  max: number;
}

// 호스트 경기 상세
export interface HostMatchDetail {
  id: string;
  date: string;
  time: string;
  endTimeISO: string; // ISO timestamp for time-based status derivation
  location: string;
  locationUrl: string;
  teamName: string;
  status: string; // DB status (RECRUITING, CLOSED, etc.)
  recruitmentMode: RecruitmentMode;
  positionQuotas?: PositionQuota[];
  totalQuota?: {
    current: number;
    max: number;
  };
}

// 팀운동 상세
export interface TeamExerciseDetail {
  id: string;
  teamName: string;
  date: string;
  time: string;
  location: string;
  locationUrl: string;
  description: string;
  participants: Participant[];
}

// 대회 상세
export interface TournamentDetail {
  id: string;
  tournamentName: string;
  round: string;
  date: string;
  time: string;
  location: string;
  locationUrl: string;
  tactics: string;
  participants: Participant[];
  teamName: string;
}

// 게스트 경기 상세 (게스트 신청용)
export interface GuestMatchDetail {
  id: string;
  teamName: string;
  hostName: string;
  hostAvatar?: string;
  date: string;
  time: string;
  duration: string;
  gymName: string;
  address: string;
  locationUrl: string;
  price: number;
  level: string;
  gender: string;
  method: string;
  ageRange: string;
  totalParticipants: number;
  currentParticipants: number;
  hostMessage: string;
  positions: GuestMatchPosition[];
  cancellationPolicy: string[];
  bankInfo: {
    bank: string;
    account: string;
    holder: string;
  };
}

// 게스트 경기 포지션 정보
export interface GuestMatchPosition {
  position: string;
  label: string;
  current: number;
  max: number;
  isOpen: boolean;
  canSupportCenter?: boolean;
}

// ============================================
// Query 응답 타입
// ============================================

// Participating matches query에서 사용하는 match row 타입
export interface ParticipatingMatchRow {
  id: string;
  match_type: string;
  team_id: string | null;
  manual_team_name: string;
  start_time: string;
  end_time: string;
  cost_type: string;
  cost_amount: number;
  status: string;
  account_info: { bank?: string; number?: string; holder?: string } | null;
  gym: { name: string; address: string; kakao_place_id: string | null } | null;
  team: { name: string } | null;
}

// ============================================
// 관리 페이지 타입 정의
// ============================================

// 팀운동 관리 상세
export interface TeamExerciseManageDetail {
  id: string;
  teamName: string;
  date: string;
  time: string;
  location: string;
  locationUrl: string;
  description: string;
  participants: Participant[];
}

// 대회 관리 상세
export interface TournamentManageDetail {
  id: string;
  teamName: string;
  tournamentName: string;
  round: string;
  date: string;
  time: string;
  location: string;
  locationUrl: string;
  description: string;
  participants: Participant[];
}
