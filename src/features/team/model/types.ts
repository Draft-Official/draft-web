/**
 * Team Feature 타입 정의
 */

import type {
  TeamRoleValue,
  TeamMemberStatusValue,
  RegularDayValue,
  TeamVoteStatusValue,
} from '@/shared/config/team-constants';
import type { AccountInfo, OperationInfo } from '@/shared/types/jsonb.types';

// ============================================
// Team (팀)
// ============================================

/**
 * 클라이언트용 팀 타입
 * DB row를 mapper로 변환한 결과
 */
export interface ClientTeam {
  id: string;
  code: string | null;
  name: string;
  shortIntro: string | null;
  description: string | null;
  logoUrl: string | null;
  regionDepth1: string | null;
  regionDepth2: string | null;
  homeGymId: string | null;
  regularDay: RegularDayValue | null;
  regularTime: string | null;
  teamGender: string | null;
  teamAvgLevel: string | null;
  teamAvgAge: string | null;
  isRecruiting: boolean;
  accountInfo: AccountInfo | null;
  operationInfo: OperationInfo | null;
  createdAt: string | null;
}

/**
 * 팀 생성 input 타입
 */
export interface CreateTeamInput {
  code: string;
  name: string;
  shortIntro?: string;
  description?: string;
  logoUrl?: string;
  regionDepth1?: string;
  regionDepth2?: string;
  homeGymId?: string;
  regularDay?: RegularDayValue;
  regularTime?: string;
  teamGender?: string;
  teamAvgLevel?: string;
  teamAvgAge?: string;
  accountInfo?: AccountInfo;
  operationInfo?: OperationInfo;
}

/**
 * 팀 수정 input 타입
 */
export interface UpdateTeamInput {
  name?: string;
  shortIntro?: string | null;
  description?: string | null;
  logoUrl?: string | null;
  regionDepth1?: string | null;
  regionDepth2?: string | null;
  homeGymId?: string | null;
  regularDay?: RegularDayValue | null;
  regularTime?: string | null;
  teamGender?: string | null;
  teamAvgLevel?: string | null;
  teamAvgAge?: string | null;
  isRecruiting?: boolean;
  accountInfo?: AccountInfo | null;
  operationInfo?: OperationInfo | null;
}

// ============================================
// Team Member (팀원)
// ============================================

/**
 * 클라이언트용 팀 멤버 타입
 */
export interface ClientTeamMember {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRoleValue;
  status: TeamMemberStatusValue;
  joinedAt: string | null;
  // 조인된 사용자 정보
  user?: {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
    positions: string[] | null;
  };
}

/**
 * 팀원 역할 변경 input
 */
export interface UpdateMemberRoleInput {
  memberId: string;
  role: TeamRoleValue;
}

// ============================================
// Team Fee (팀 회비)
// ============================================

/**
 * 클라이언트용 팀 회비 타입
 */
export interface ClientTeamFee {
  id: string;
  teamId: string;
  userId: string;
  yearMonth: string;
  isPaid: boolean;
  paidAt: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  // 조인된 사용자 정보
  user?: {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
  };
}

/**
 * 회비 상태 업데이트 input
 */
export interface UpdateFeeStatusInput {
  teamId: string;
  userId: string;
  yearMonth: string;
  isPaid: boolean;
}

// ============================================
// Team Match (팀 운동)
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
 * 투표 현황 요약
 */
export interface VotingSummary {
  attending: number;
  notAttending: number;
  undecided: number;
  noResponse: number;
  totalMembers: number;
}

/**
 * 팀 투표 타입
 */
export interface TeamVote {
  id: string;
  matchId: string;
  userId: string;
  status: TeamVoteStatusValue;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    nickname: string | null;
    avatarUrl: string | null;
  };
}

/**
 * 투표 생성/수정 input
 */
export interface VoteInput {
  matchId: string;
  status: TeamVoteStatusValue;
  description?: string;
}

// ============================================
// Team Match Creation
// ============================================

/**
 * 팀 매치 생성 input
 */
export interface CreateTeamMatchInput {
  teamId: string;
  startTime: string;
  endTime: string;
  gymId: string;
  costType?: string;
  costAmount?: number;
  matchFormat?: string;
  genderRule?: string;
  matchRule?: Record<string, unknown>;
  operationInfo?: OperationInfo;
}

// ============================================
// View Models (UI용 타입)
// ============================================

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
