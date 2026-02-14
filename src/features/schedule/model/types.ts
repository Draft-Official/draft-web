/**
 * 경기 관리 페이지 타입 정의
 * Phase 2 확장성 가이드라인 준수
 */

// ============================================
// DTO Types (NEW)
// ============================================

// 일정 화면 모드
export type ScheduleMode = 'participating' | 'managing';

// 신청 동반인 DTO
export interface MatchApplicantCompanionDTO {
  name: string;
  position: string;
  height?: string;
  age?: string;
  skillLevel?: string;
}

// 신청 이력 DTO
export interface MatchApplicantHistoryDTO {
  count: number;
  lastDate?: string;
}

// 경기 신청자 DTO (호스트 관리용)
export interface MatchApplicantDTO extends Participant {
  status: GuestStatus;
  realName?: string;
  paymentVerified?: boolean;
  teamName?: string;
  companions?: MatchApplicantCompanionDTO[];
  appliedAt?: string;
  accountInfo?: {
    bank?: string;
    number?: string;
    holder?: string;
  };
  matchHistory?: MatchApplicantHistoryDTO;
}

// 경기 관리 리스트 아이템 DTO
export interface ScheduleMatchListItemDTO {
  id: string;
  matchType: MatchType;
  scheduleMode: ScheduleMode;
  status: MatchStatus;
  teamName: string;
  date: string;
  time: string;
  startTimeISO: string;
  location: string;
  locationUrl?: string;

  applicationId?: string;
  approvalStatus?: string;
  totalCost?: number;
  perCost?: number;
  companionCount?: number;
  bankInfo?: {
    bank: string;
    account: string;
    holder: string;
  };
  applicationInfo?: {
    position: string;
    appliedAt: string;
    companions?: {
      name: string;
      position: string;
    }[];
    cancelReason?: string;
  };

  applicants?: number;
  vacancies?: number;
  participants?: number;
  tournamentName?: string;
  round?: string;

  // Legacy compatibility field
  type: MatchType;
}

// 호스트 경기 상세 DTO
export interface HostMatchDetailDTO {
  id: string;
  date: string;
  time: string;
  endTimeISO: string;
  location: string;
  locationUrl: string;
  teamName: string;
  status: string;
  recruitmentMode: RecruitmentMode;
  positionQuotas?: PositionQuota[];
  totalQuota?: {
    current: number;
    max: number;
  };
}

// 팀운동 상세 DTO
export interface TeamExerciseDetailDTO {
  id: string;
  teamName: string;
  date: string;
  time: string;
  location: string;
  locationUrl: string;
  description: string;
  participants: Participant[];
}

// 대회 상세 DTO
export interface TournamentDetailDTO {
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

// 팀운동 관리 상세 DTO
export interface TeamExerciseManageDetailDTO {
  id: string;
  teamName: string;
  date: string;
  time: string;
  location: string;
  locationUrl: string;
  description: string;
  participants: Participant[];
}

// 대회 관리 상세 DTO
export interface TournamentManageDetailDTO {
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

// 포지션별 모집 인원
export interface PositionQuota {
  position: string;
  label: string;
  current: number;
  max: number;
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
