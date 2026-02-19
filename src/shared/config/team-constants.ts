/**
 * 팀 관련 상수 및 UI 라벨 매핑
 *
 * 규칙:
 * - 서버(DB)와 클라이언트 값은 동일하게 대문자(UPPER_SNAKE_CASE) 사용
 * - 모든 매핑은 이 파일에서 단일 관리 (Single Source of Truth)
 *
 * NOTE: 팀 투표 상태(TEAM_VOTE_STATUS)는 application-constants.ts에 정의
 * (applications 테이블 기반이므로)
 */

// ============================================
// Team Role (팀 역할)
// ============================================

export const TEAM_ROLE_VALUES = ['LEADER', 'MANAGER', 'MEMBER'] as const;
export type TeamRoleValue = (typeof TEAM_ROLE_VALUES)[number];

export const TEAM_ROLE_LABELS: Record<TeamRoleValue, string> = {
  LEADER: '팀장',
  MANAGER: '매니저',
  MEMBER: '팀원',
};

export const TEAM_ROLE_STYLES: Record<TeamRoleValue, { color: string; bgColor: string }> = {
  LEADER: { color: 'text-primary', bgColor: 'bg-brand-weak' },
  MANAGER: { color: 'text-blue-600', bgColor: 'bg-blue-50' },
  MEMBER: { color: 'text-gray-600', bgColor: 'bg-gray-50' },
};

export function getTeamRoleLabel(value: string): string {
  return TEAM_ROLE_LABELS[value as TeamRoleValue] || value;
}

// ============================================
// Team Member Status (팀원 상태)
// ============================================

export const TEAM_MEMBER_STATUS_VALUES = ['PENDING', 'ACCEPTED', 'REJECTED'] as const;
export type TeamMemberStatusValue = (typeof TEAM_MEMBER_STATUS_VALUES)[number];

export const TEAM_MEMBER_STATUS_LABELS: Record<TeamMemberStatusValue, string> = {
  PENDING: '승인 대기',
  ACCEPTED: '가입 완료',
  REJECTED: '가입 거절',
};

export const TEAM_MEMBER_STATUS_STYLES: Record<
  TeamMemberStatusValue,
  { color: string; bgColor: string }
> = {
  PENDING: { color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  ACCEPTED: { color: 'text-green-600', bgColor: 'bg-green-50' },
  REJECTED: { color: 'text-red-600', bgColor: 'bg-red-50' },
};

export function getTeamMemberStatusLabel(value: string): string {
  return TEAM_MEMBER_STATUS_LABELS[value as TeamMemberStatusValue] || value;
}

// ============================================
// Regular Day (정기 운동 요일)
// ============================================

export const REGULAR_DAY_VALUES = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const;
export type RegularDayValue = (typeof REGULAR_DAY_VALUES)[number];

export const REGULAR_DAY_LABELS: Record<RegularDayValue, string> = {
  MON: '월요일',
  TUE: '화요일',
  WED: '수요일',
  THU: '목요일',
  FRI: '금요일',
  SAT: '토요일',
  SUN: '일요일',
};

export const REGULAR_DAY_SHORT_LABELS: Record<RegularDayValue, string> = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
};

export const REGULAR_DAY_OPTIONS = REGULAR_DAY_VALUES.map((value) => ({
  value,
  label: REGULAR_DAY_LABELS[value],
  shortLabel: REGULAR_DAY_SHORT_LABELS[value],
}));

export function getRegularDayLabel(value: string, type: 'full' | 'short' = 'full'): string {
  const labels = type === 'short' ? REGULAR_DAY_SHORT_LABELS : REGULAR_DAY_LABELS;
  return labels[value as RegularDayValue] || value;
}

// ============================================
// Team Code Validation
// ============================================

/**
 * 팀 코드 유효성 검사
 * - 영문 소문자, 숫자, 하이픈만 허용
 * - 3-30자 길이
 */
export const TEAM_CODE_REGEX = /^[a-z0-9-]{3,30}$/;

export function isValidTeamCode(code: string): boolean {
  return TEAM_CODE_REGEX.test(code);
}

export const TEAM_CODE_ERROR_MESSAGE = '영문 소문자, 숫자, 하이픈만 사용 가능합니다 (3-30자)';

// ============================================
// Re-exports from application-constants
// ============================================
// 팀 투표 관련 상수는 application-constants.ts에서 관리
// 기존 import 호환성을 위해 re-export
export {
  // Application Source
  APPLICATION_SOURCE_VALUES,
  APPLICATION_SOURCE_LABELS,
  getApplicationSourceLabel,
  type ApplicationSourceValue,
  // Team Vote Status
  TEAM_VOTE_STATUS_VALUES,
  TEAM_VOTE_STATUS_LABELS,
  TEAM_VOTE_STATUS_DESCRIPTIONS,
  TEAM_VOTE_STATUS_STYLES,
  TEAM_VOTE_OPTIONS,
  getTeamVoteStatusLabel,
  type TeamVoteStatusValue,
} from './application-constants';
