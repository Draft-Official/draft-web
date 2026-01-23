/**
 * Host Dashboard 관련 타입 정의
 *
 * 공통 타입은 @/shared/types/match에서 import하여 사용
 * UI 호환성을 위해 일부 view model 타입을 추가로 정의
 */

// 공통 타입 import
export type {
  Position,
  Applicant,
  Team,
  HostDashboardMatch,
} from '@/shared/types/match';

// Enum 값 re-export (export type은 값을 export하지 않으므로 별도 필요)
export { MatchStatus, ApplicantStatus } from '@/shared/types/match';

// UI용 호환 타입 (화면 표시를 위한 view model)
// HostDashboardMatch의 location/price를 간단한 문자열로 변환한 형태
export interface Match {
  id: string;
  title: string;
  gymName: string;           // location.name에서 변환
  date: string;              // YYYY. MM. DD (Day) 형식 (표시용)
  time: string;              // HH:mm (표시용)
  status: 'recruiting' | 'closing_soon' | 'closed' | 'canceled';
  type: 'TEAM' | 'SOLO';     // MVP용 간소화된 타입
  stats: {
    total: number;
    confirmed: number;
    left: number;
  };
  pendingCount: number;
  isPast?: boolean;
}
