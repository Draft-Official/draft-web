/**
 * Team Feature 타입 정의
 *
 * 주요 타입은 entities/team에서 re-export합니다.
 * 이 파일은 feature-specific 타입과 하위 호환성을 위한 re-exports를 포함합니다.
 */

// Re-export entity types for backwards compatibility
export type {
  Team,
  CreateTeamInput,
  UpdateTeamInput,
  UpdateMemberRoleInput,
  UpdateFeeStatusInput,
  VotingSummary,
  VoteInput,
  CreateTeamMatchInput,
} from '@/entities/team';

import type {
  TeamMember as TeamMemberEntity,
  TeamFee as TeamFeeEntity,
  TeamVote as TeamVoteEntity,
  VotingSummary,
} from '@/entities/team';

import type {
  TeamRoleValue,
  TeamMemberStatusValue,
  TeamVoteStatusValue,
  RegularDayValue,
} from '@/shared/config/team-constants';
import type { MatchStatusValue, MatchTypeValue, MatchFormatValue, GenderValue } from '@/shared/config/match-constants';
import type {
  AccountInfo,
  AgeRange,
  GymFacilities,
  LevelRange,
  MatchRule,
  OperationInfo,
  RecruitmentSetup,
} from '@/shared/types/jsonb.types';
import type { ApplicationSourceValue } from '@/shared/config/application-constants';

// ============================================
// DTO Types (NEW - Flat Structure)
// ============================================

/**
 * Team 상세 DTO
 * 팀 상세/설정/프로필 화면에서 사용
 */
export interface TeamInfoDTO {
  id: string;
  code: string | null;
  name: string;
  shortIntro: string | null;
  description: string | null;
  logoUrl: string | null;
  regionDepth1: string | null;
  regionDepth2: string | null;
  regionDisplay: string | null;
  homeGymId: string | null;
  homeGymName: string | null;
  regularDay: RegularDayValue | null;
  regularStartTime: string | null;
  regularEndTime: string | null;
  regularScheduleDisplay: string | null;
  teamGender: string | null;
  levelRange: LevelRange | null;
  levelDisplay: string | null;
  ageRange: AgeRange | null;
  ageDisplay: string | null;
  isRecruiting: boolean;
  accountInfo: AccountInfo | null;
  operationInfo: OperationInfo | null;
  createdAt: string | null;
}

/**
 * 내 팀 목록 카드 DTO
 * /team, /my 팀 카드 영역에서 사용
 */
export interface MyTeamListItemDTO {
  id: string;
  code: string;
  name: string;
  logoUrl: string | null;
  role: TeamRoleValue;
  regularDay: RegularDayValue | null;
  regularTime: string | null;
  regularScheduleDisplay: string | null;
  homeGymName: string | null;
}

/**
 * 팀 멤버십 DTO
 * 멤버 권한/상태 확인용
 */
export interface TeamMembershipDTO {
  id: string;
  teamId: string;
  userId: string;
  role: TeamRoleValue;
  status: TeamMemberStatusValue;
  joinedAt: string | null;
  user?: TeamMemberUser;
}

/**
 * 팀 멤버 목록 아이템 DTO
 * 멤버/대기자 목록 화면에서 사용
 */
export type TeamMemberListItemDTO = TeamMembershipDTO;

/**
 * 팀 투표 DTO
 * TEAM_VOTE source application 표시용
 */
export interface TeamVoteDTO {
  id: string;
  matchId: string;
  userId: string;
  status: TeamVoteStatusValue;
  source: ApplicationSourceValue | null;
  description: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  userNickname: string | null;
  userAvatarUrl: string | null;
}

/**
 * 팀 일정 아이템 DTO
 * 팀 상세 > 일정 탭, 내 팀 > 정기운동 카드에서 사용
 */
export interface TeamScheduleMatchItemDTO {
  matchId: string;
  teamId: string | null;
  teamCode: string | null;
  teamName: string;
  teamLogoUrl: string | null;
  gymId: string | null;
  gymName: string;
  gymAddress: string | null;
  startTime: string;
  endTime: string;
  dateDisplay: string;
  timeDisplay: string;
  status: MatchStatusValue | null;
  statusLabel: string;
  isPast: boolean;
}

/**
 * 팀 매치 상세 DTO
 * 팀 매치 상세 화면에서 사용
 */
export interface TeamMatchDetailDTO extends TeamScheduleMatchItemDTO {
  matchType: MatchTypeValue;
  matchFormat: MatchFormatValue;
  genderRule: GenderValue;
  recruitmentSetup: RecruitmentSetup;
  matchRule: MatchRule | null;
  requirements: string[] | null;
  operationInfo: OperationInfo | null;
  accountInfo: AccountInfo | null;
  facilities: GymFacilities | null;
  isVotingClosed: boolean;
}

/**
 * 내 미투표 팀 매치 카드 DTO
 * /team 내 팀 정기운동 섹션에서 사용
 */
export interface MyPendingTeamVoteMatchDTO {
  matchId: string;
  teamId: string;
  teamCode: string;
  teamName: string;
  teamLogoUrl: string | null;
  dateDisplay: string;
  timeDisplay: string;
  gymName: string;
  gymAddress: string | null;
  status: MatchStatusValue;
  myVote: TeamVoteStatusValue;
  myVoteReason: string | null;
  votingSummary: {
    attending: number;
    notAttending: number;
    pending: number;
  };
}

/**
 * TeamMember UI 조합용 사용자 타입
 */
export interface TeamMemberUser {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
  positions: string[] | null;
}

/**
 * TeamFee UI 조합용 사용자 타입
 */
export interface TeamFeeUser {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
}

/**
 * TeamVote UI 조합용 사용자 타입
 */
export interface TeamVoteUser {
  id: string;
  nickname: string | null;
  avatarUrl: string | null;
}

/**
 * Feature 조합 모델 (TeamMember + joined user)
 */
export type TeamMember = TeamMemberEntity & {
  user?: TeamMemberUser;
};

/**
 * Feature 조합 모델 (TeamFee + joined user)
 */
export type TeamFee = TeamFeeEntity & {
  user?: TeamFeeUser;
};

/**
 * Feature 조합 모델 (TeamVote + joined user)
 */
export type TeamVote = TeamVoteEntity & {
  user?: TeamVoteUser;
};

// ============================================
// Feature-specific View Models
// ============================================

/**
 * @deprecated Use TeamScheduleMatchItemDTO or TeamMatchDetailDTO instead
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
 * @deprecated Use TeamInfoDTO instead
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
 * @deprecated Use MyTeamListItemDTO instead
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
 * @deprecated Use TeamInfoDTO or MyTeamListItemDTO instead
 * 레거시 Team 카드 타입 (mock data용)
 */
export interface LegacyTeamCard {
  id: string;
  name: string;
  leaderName: string;
  memberCount: number;
  avatar: string;
}

/**
 * @deprecated Use TeamScheduleMatchItemDTO instead
 * 레거시 Match 카드 타입 (mock data용)
 */
export interface LegacyMatchCard {
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

// Re-export position type
export type { PositionValue as Position } from '@/shared/config/match-constants';
