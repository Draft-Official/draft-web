/**
 * Team Entity 타입 정의
 * FSD entities layer - 도메인 모델 타입
 */

import type {
  TeamRoleValue,
  TeamMemberStatusValue,
  RegularDayValue,
  TeamVoteStatusValue,
} from '@/shared/config/team-constants';
import type { AccountInfo, OperationInfo, LevelRange, AgeRange } from '@/shared/types/jsonb.types';

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
  regularStartTime: string | null;
  regularEndTime: string | null;
  teamGender: string | null;
  levelRange: LevelRange | null;
  ageRange: AgeRange | null;
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
  regularStartTime?: string;
  regularEndTime?: string;
  teamGender?: string;
  levelRange?: LevelRange;
  ageRange?: AgeRange;
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
  regularStartTime?: string | null;
  regularEndTime?: string | null;
  teamGender?: string | null;
  levelRange?: LevelRange | null;
  ageRange?: AgeRange | null;
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
 * 투표 현황 요약
 */
export interface VotingSummary {
  pending: number;
  attending: number;
  late: number;
  maybe: number;
  notAttending: number;
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
