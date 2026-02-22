// ============================================
// Base Participation Status (공통 참여 상태)
// ============================================
// 게스트 신청과 팀 투표에서 공통으로 사용하는 베이스 상태

export const BASE_PARTICIPATION_STATUS = [
  'PENDING',
  'CONFIRMED',
  'LATE',
  'NOT_ATTENDING',
] as const;
export type BaseParticipationStatus = (typeof BASE_PARTICIPATION_STATUS)[number];

// 베이스 상태 라벨 (공통)
export const BASE_PARTICIPATION_LABELS: Record<BaseParticipationStatus, string> = {
  PENDING: '대기',
  CONFIRMED: '확정',
  LATE: '늦참',
  NOT_ATTENDING: '불참',
};

// 베이스 상태 스타일 (공통)
export const BASE_PARTICIPATION_STYLES: Record<
  BaseParticipationStatus,
  { color: string; bgColor: string }
> = {
  PENDING: { color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  CONFIRMED: { color: 'text-green-600', bgColor: 'bg-green-50' },
  LATE: { color: 'text-brand', bgColor: 'bg-brand-weak' },
  NOT_ATTENDING: { color: 'text-gray-600', bgColor: 'bg-gray-100' },
};

// ============================================
// Guest Application Status (게스트 신청 상태)
// ============================================
// 베이스 + 게스트 전용 상태 (결제, 거절, 취소)

export const GUEST_ONLY_STATUS = [
  'PAYMENT_PENDING',
  'REJECTED',
  'CANCELED',
] as const;
export type GuestOnlyStatus = (typeof GUEST_ONLY_STATUS)[number];

export const APPLICATION_STATUS_VALUES = [
  ...BASE_PARTICIPATION_STATUS,
  ...GUEST_ONLY_STATUS,
] as const;
export type ApplicationStatusValue = (typeof APPLICATION_STATUS_VALUES)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatusValue, string> = {
  // 베이스 (게스트 맥락 라벨)
  PENDING: '승인 대기',
  CONFIRMED: '참여 확정',
  LATE: '늦참',
  NOT_ATTENDING: '불참',
  // 게스트 전용
  PAYMENT_PENDING: '입금 대기',
  REJECTED: '거절됨',
  CANCELED: '취소됨',
};

export const APPLICATION_STATUS_STYLES: Record<
  ApplicationStatusValue,
  { color: string; bgColor: string }
> = {
  // 베이스
  ...BASE_PARTICIPATION_STYLES,
  // 게스트 전용
  PAYMENT_PENDING: { color: 'text-blue-600', bgColor: 'bg-blue-50' },
  REJECTED: { color: 'text-red-600', bgColor: 'bg-red-50' },
  CANCELED: { color: 'text-slate-600', bgColor: 'bg-slate-100' },
};

export function getApplicationStatusLabel(value: string): string {
  return APPLICATION_STATUS_LABELS[value as ApplicationStatusValue] || value;
}
// ============================================
// Cancel Type (취소 유형)
// ============================================

export const CANCEL_TYPE_VALUES = ['USER_REQUEST', 'PAYMENT_TIMEOUT', 'FRAUDULENT_PAYMENT'] as const;
export type CancelTypeValue = (typeof CANCEL_TYPE_VALUES)[number];

export const CANCEL_TYPE_LABELS: Record<CancelTypeValue, string> = {
  USER_REQUEST: '상호 합의 취소',
  PAYMENT_TIMEOUT: '미송금 취소',
  FRAUDULENT_PAYMENT: '허위 송금 신고',
};

export const CANCEL_TYPE_DESCRIPTIONS: Record<CancelTypeValue, string> = {
  USER_REQUEST: '게스트 요청 등 상호 합의에 의한 취소',
  PAYMENT_TIMEOUT: '승인 후 기한 내 송금하지 않음',
  FRAUDULENT_PAYMENT: '송금 완료를 눌렀으나 실제 미입금 확인',
};
// Canceled By

export const CANCELED_BY_VALUES = ['HOST', 'GUEST', 'SYSTEM'] as const;
export type CanceledByValue = (typeof CANCELED_BY_VALUES)[number];

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
// Team Vote Status (팀 투표 상태)
// ============================================
// 베이스 참여 상태 + 팀 투표 전용 상태 (MAYBE)

export const TEAM_VOTE_ONLY_STATUS = ['MAYBE'] as const;
export type TeamVoteOnlyStatus = (typeof TEAM_VOTE_ONLY_STATUS)[number];

export const TEAM_VOTE_STATUS_VALUES = [
  ...BASE_PARTICIPATION_STATUS,
  ...TEAM_VOTE_ONLY_STATUS,
] as const;
export type TeamVoteStatusValue = BaseParticipationStatus | TeamVoteOnlyStatus;

export const TEAM_VOTE_STATUS_LABELS: Record<TeamVoteStatusValue, string> = {
  // 베이스 (팀 투표 맥락 라벨)
  PENDING: '미투표',
  CONFIRMED: '참석',
  LATE: '늦참',
  NOT_ATTENDING: '불참',
  // 팀 투표 전용
  MAYBE: '미정',
};

export const TEAM_VOTE_STATUS_DESCRIPTIONS: Record<TeamVoteStatusValue, string> = {
  PENDING: '아직 투표하지 않았습니다',
  CONFIRMED: '경기에 참석합니다',
  LATE: '늦은 참석입니다',
  NOT_ATTENDING: '경기에 참석하지 않습니다',
  MAYBE: '참석 여부가 불확실합니다',
};

export const TEAM_VOTE_STATUS_STYLES: Record<
  TeamVoteStatusValue,
  { color: string; bgColor: string; borderColor: string; icon: 'check' | 'clock' | 'x' | 'circle' }
> = {
  // 베이스 (borderColor, icon 추가)
  PENDING: { ...BASE_PARTICIPATION_STYLES.PENDING, borderColor: 'border-gray-300', icon: 'circle' },
  CONFIRMED: { ...BASE_PARTICIPATION_STYLES.CONFIRMED, borderColor: 'border-green-500', icon: 'check' },
  LATE: { ...BASE_PARTICIPATION_STYLES.LATE, borderColor: 'border-yellow-500', icon: 'clock' },
  NOT_ATTENDING: { ...BASE_PARTICIPATION_STYLES.NOT_ATTENDING, borderColor: 'border-red-300', icon: 'x' },
  // 팀 투표 전용
  MAYBE: { color: 'text-slate-600', bgColor: 'bg-slate-50', borderColor: 'border-slate-300', icon: 'circle' },
};

// 투표 선택 옵션 (PENDING 제외 - 사용자가 선택할 수 있는 옵션만)
export const TEAM_VOTE_SELECTABLE_STATUS = ['CONFIRMED', 'LATE', 'MAYBE', 'NOT_ATTENDING'] as const;
export const TEAM_VOTE_OPTIONS = TEAM_VOTE_SELECTABLE_STATUS.map((value) => ({
  value,
  label: TEAM_VOTE_STATUS_LABELS[value],
  description: TEAM_VOTE_STATUS_DESCRIPTIONS[value],
  ...TEAM_VOTE_STATUS_STYLES[value],
}));

export function getTeamVoteStatusLabel(value: string): string {
  return TEAM_VOTE_STATUS_LABELS[value as TeamVoteStatusValue] || value;
}
