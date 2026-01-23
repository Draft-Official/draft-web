/**
 * 경기 관리 페이지 타입 정의
 * Phase 2 확장성 가이드라인 준수
 */

// 경기 타입 (MVP + Phase 2)
export type MatchType = 'guest' | 'host' | 'team' | 'tournament';

// 경기 상태
export type MatchStatus =
  | 'scheduled'   // 예정
  | 'ongoing'     // 진행중
  | 'ended'       // 종료
  | 'cancelled'   // 취소
  | 'pending'     // 승인대기
  | 'confirmed'   // 확정
  | 'closed'      // 마감
  | 'rejected';   // 승인거부

// 경기 관리 아이템 인터페이스
export interface ManagedMatch {
  id: string;
  type: MatchType;
  status: MatchStatus;
  teamName: string;
  date: string;       // YYYY. MM. DD (Day)
  time: string;       // HH:mm
  location: string;
  locationUrl?: string;

  // Guest specific
  approvalStatus?: string;
  amount?: number;
  bankInfo?: {
    bank: string;
    account: string;
    holder: string;
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
export type GuestStatus = 'pending' | 'payment_waiting' | 'confirmed' | 'rejected';

// 모집 방식
export type RecruitmentMode = 'position' | 'total';

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
