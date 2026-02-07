/**
 * 팀 관련 상수 및 UI 라벨 매핑
 *
 * 규칙:
 * - 서버(DB)와 클라이언트 값은 동일하게 대문자(UPPER_SNAKE_CASE) 사용
 * - 모든 매핑은 이 파일에서 단일 관리 (Single Source of Truth)
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
  LEADER: { color: 'text-primary', bgColor: 'bg-orange-50' },
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
// Application Source (신청 출처)
// ============================================

export const APPLICATION_SOURCE_VALUES = ['GUEST_APPLICATION', 'TEAM_VOTE'] as const;
export type ApplicationSourceValue = (typeof APPLICATION_SOURCE_VALUES)[number];

export const APPLICATION_SOURCE_LABELS: Record<ApplicationSourceValue, string> = {
  GUEST_APPLICATION: '게스트 신청',
  TEAM_VOTE: '팀 투표',
};

export function getApplicationSourceLabel(value: string): string {
  return APPLICATION_SOURCE_LABELS[value as ApplicationSourceValue] || value;
}

// ============================================
// Team Vote Status (팀 투표 상태) - Application Status 기반
// ============================================

export const TEAM_VOTE_STATUS_VALUES = [
  'CONFIRMED',
  'LATE',
  'MAYBE',
  'NOT_ATTENDING',
  'PENDING',
] as const;
export type TeamVoteStatusValue = (typeof TEAM_VOTE_STATUS_VALUES)[number];

export const TEAM_VOTE_STATUS_LABELS: Record<TeamVoteStatusValue, string> = {
  CONFIRMED: '참석',
  LATE: '늦참',
  MAYBE: '미정',
  NOT_ATTENDING: '불참',
  PENDING: '미투표',
};

export const TEAM_VOTE_STATUS_DESCRIPTIONS: Record<TeamVoteStatusValue, string> = {
  CONFIRMED: '경기에 참석합니다',
  LATE: '늦은 참석입니다',
  MAYBE: '참석 여부가 불확실합니다',
  NOT_ATTENDING: '경기에 참석하지 않습니다',
  PENDING: '아직 투표하지 않았습니다',
};

export const TEAM_VOTE_STATUS_STYLES: Record<
  TeamVoteStatusValue,
  { color: string; bgColor: string; borderColor: string; icon: 'check' | 'clock' | 'x' | 'circle' }
> = {
  CONFIRMED: { color: 'text-green-600', bgColor: 'bg-green-50', borderColor: 'border-green-500', icon: 'check' },
  LATE: { color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-500', icon: 'clock' },
  MAYBE: { color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-300', icon: 'circle' },
  NOT_ATTENDING: { color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-300', icon: 'x' },
  PENDING: { color: 'text-gray-600', bgColor: 'bg-gray-100', borderColor: 'border-gray-300', icon: 'circle' },
};

// 투표 선택 옵션 (PENDING 제외 - 사용자가 선택할 수 있는 옵션만)
export const TEAM_VOTE_OPTIONS = (['CONFIRMED', 'LATE', 'MAYBE', 'NOT_ATTENDING'] as const).map(
  (value) => ({
    value,
    label: TEAM_VOTE_STATUS_LABELS[value],
    description: TEAM_VOTE_STATUS_DESCRIPTIONS[value],
    ...TEAM_VOTE_STATUS_STYLES[value],
  })
);

export function getTeamVoteStatusLabel(value: string): string {
  return TEAM_VOTE_STATUS_LABELS[value as TeamVoteStatusValue] || value;
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
