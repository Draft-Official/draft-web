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
