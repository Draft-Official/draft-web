/**
 * Team Feature 타입 정의
 */

import type { PositionValue } from '@/shared/config/constants';

// Re-export constants types for convenience
export type { PositionValue as Position };

// Re-export from other features
export type { Applicant } from '@/features/application/model/types';
export type { HostDashboardMatch } from '@/features/match/model/types';

// Re-export status values as objects for compatibility
export const MatchStatus = {
  RECRUITING: 'RECRUITING',
  CLOSING_SOON: 'CLOSING_SOON',
  CLOSED: 'CLOSED',
  FINISHED: 'FINISHED',
  CANCELED: 'CANCELED',
} as const;

export const ApplicantStatus = {
  PENDING: 'PENDING',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  CONFIRMED: 'CONFIRMED',
  REJECTED: 'REJECTED',
  LATE: 'LATE',
  NOT_ATTENDING: 'NOT_ATTENDING',
} as const;

/**
 * 팀 정보
 */
export interface Team {
  id: string;
  name: string;
  leaderName: string;
  memberCount: number;
  avatar?: string;
}

/**
 * UI용 호환 타입 (화면 표시를 위한 view model)
 * HostDashboardMatch의 location/price를 간단한 문자열로 변환한 형태
 */
export interface Match {
  id: string;
  title: string;
  gymName: string; // location.name에서 변환
  date: string; // YYYY. MM. DD (Day) 형식 (표시용)
  time: string; // HH:mm (표시용)
  status: 'recruiting' | 'closing_soon' | 'closed' | 'canceled';
  type: 'TEAM' | 'SOLO'; // MVP용 간소화된 타입
  stats: {
    total: number;
    confirmed: number;
    left: number;
  };
  pendingCount: number;
  isPast?: boolean;
}
