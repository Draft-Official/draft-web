/**
 * Team Feature 타입 정의
 *
 * 주요 타입은 entities/team에서 re-export합니다.
 * 이 파일은 feature-specific 타입과 하위 호환성을 위한 re-exports를 포함합니다.
 */

// Re-export entity types for backwards compatibility
export type {
  ClientTeam,
  ClientTeamMember,
  ClientTeamFee,
  CreateTeamInput,
  UpdateTeamInput,
  UpdateMemberRoleInput,
  UpdateFeeStatusInput,
  VotingSummary,
  TeamVote,
  VoteInput,
  CreateTeamMatchInput,
} from '@/entities/team';

import type {
  TeamRoleValue,
  RegularDayValue,
} from '@/shared/config/team-constants';
import type { VotingSummary } from '@/entities/team';

// ============================================
// Feature-specific View Models
// ============================================

/**
 * 팀 운동용 매치 타입 (투표 정보 포함)
 */
export interface TeamMatchWithVoting {
  id: string;
  teamId: string;
  title: string;
  startTime: string;
  endTime: string;
  gymName: string;
  gymAddress: string;
  isVotingClosed: boolean;
  votingClosedAt: string | null;
  votingSummary: VotingSummary;
}

/**
 * 팀 프로필 카드용 타입
 */
export interface TeamProfileCardData {
  id: string;
  code: string;
  name: string;
  shortIntro: string | null;
  logoUrl: string | null;
  region: string | null;
  memberCount: number;
  regularSchedule: string | null;
}

/**
 * 팀 목록 아이템용 타입 (나의 팀 카드에 표시)
 */
export interface TeamListItem {
  id: string;
  code: string;
  name: string;
  logoUrl: string | null;
  role: TeamRoleValue;
  regularDay: RegularDayValue | null;
  regularTime: string | null;
  homeGymName: string | null;
}

// ============================================
// Legacy Compatibility (기존 코드 호환)
// ============================================

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
 * 레거시 Team 타입 (mock data용)
 */
export interface Team {
  id: string;
  name: string;
  leaderName: string;
  memberCount: number;
  avatar: string;
}

/**
 * 레거시 Match 타입 (mock data용)
 */
export interface Match {
  id: string;
  title: string;
  gymName: string;
  date: string;
  time: string;
  status: 'recruiting' | 'closing_soon' | 'closed';
  type: 'TEAM' | 'SOLO';
  stats: {
    total: number;
    confirmed: number;
    left: number;
  };
  pendingCount: number;
  isPast: boolean;
}

// Re-export from application feature for convenience
export type { Applicant } from '@/features/application/model/types';

// Re-export position type
export type { PositionValue as Position } from '@/shared/config/constants';
