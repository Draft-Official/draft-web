/**
 * 매치 관련 상수 및 UI 라벨 매핑
 *
 * 규칙:
 * - 서버(DB)와 클라이언트 값은 동일하게 대문자(UPPER_SNAKE_CASE) 사용
 * - 모든 매핑은 이 파일에서 단일 관리 (Single Source of Truth)
 * - UI 컴포넌트는 이 파일의 LABELS/STYLES를 import하여 사용
 */

// ============================================
// Gender (성별)
// ============================================

export const GENDER_VALUES = ['MALE', 'FEMALE', 'MIXED'] as const;
export type GenderValue = typeof GENDER_VALUES[number];

export const GENDER_LABELS: Record<GenderValue, string> = {
  MALE: '남성',
  FEMALE: '여성',
  MIXED: '성별 무관',
};

export const GENDER_STYLES: Record<GenderValue, { color: string; bgColor: string }> = {
  MALE: { color: 'text-blue-600', bgColor: 'bg-blue-50' },
  FEMALE: { color: 'text-pink-600', bgColor: 'bg-pink-50' },
  MIXED: { color: 'text-purple-600', bgColor: 'bg-purple-50' },
};

export const GENDER_OPTIONS = GENDER_VALUES.map(value => ({
  value,
  label: GENDER_LABELS[value],
}));

export const GENDER_DEFAULT: GenderValue = 'MALE';

export function getGenderLabel(value: string): string {
  return GENDER_LABELS[value as GenderValue] || value;
}

// ============================================
// Position (포지션)
// ============================================

export const POSITION_VALUES = ['G', 'F', 'C', 'B'] as const;
export type PositionValue = typeof POSITION_VALUES[number];

export const POSITION_LABELS: Record<PositionValue, { short: string; full: string }> = {
  G: { short: 'G', full: '가드' },
  F: { short: 'F', full: '포워드' },
  C: { short: 'C', full: '센터' },
  B: { short: 'F/C', full: '포워드/센터' },
};

export const POSITION_OPTIONS = POSITION_VALUES.map(value => ({
  value,
  label: POSITION_LABELS[value].full,
  shortLabel: POSITION_LABELS[value].short,
}));

export const POSITION_DEFAULT: PositionValue = 'G';

export function getPositionLabel(value: string, type: 'short' | 'full' | 'combined' = 'full'): string {
  const labels = POSITION_LABELS[value as PositionValue];
  if (!labels) return value;
  if (type === 'combined') return `${labels.full} (${labels.short})`;
  return labels[type];
}

// ============================================
// Recruitment Type (모집 방식)
// ============================================

export const RECRUITMENT_TYPE_VALUES = ['ANY', 'POSITION'] as const;
export type RecruitmentTypeValue = typeof RECRUITMENT_TYPE_VALUES[number];

export const RECRUITMENT_TYPE_LABELS: Record<RecruitmentTypeValue, string> = {
  ANY: '포지션 무관',
  POSITION: '포지션별 모집',
};

// ============================================
// Cost Type (참가비 유형)
// ============================================

export const CostType = {
  MONEY: 'MONEY',
  FREE: 'FREE',
  BEVERAGE: 'BEVERAGE',
} as const;
export type CostTypeValue = typeof CostType[keyof typeof CostType];

export const COST_TYPE_LABELS: Record<CostTypeValue, string> = {
  MONEY: '유료',
  FREE: '무료',
  BEVERAGE: '음료수',
};

export function getCostTypeLabel(value: string): string {
  return COST_TYPE_LABELS[value as CostTypeValue] || value;
}

// ============================================
// Play Style (경기 형태)
// ============================================

export const PLAY_STYLE_VALUES = ['INTERNAL_2WAY', 'INTERNAL_3WAY', 'EXCHANGE'] as const;
export type PlayStyleValue = typeof PLAY_STYLE_VALUES[number];

export const PLAY_STYLE_LABELS: Record<PlayStyleValue, string> = {
  INTERNAL_2WAY: '자체전 (2파전)',
  INTERNAL_3WAY: '자체전 (3파전)',
  EXCHANGE: '팀 교류전',
};

export const PLAY_STYLE_OPTIONS = PLAY_STYLE_VALUES.map(value => ({
  value,
  label: PLAY_STYLE_LABELS[value],
}));

export const PLAY_STYLE_DEFAULT: PlayStyleValue = 'INTERNAL_2WAY';

export function getPlayStyleLabel(code: string): string {
  return PLAY_STYLE_LABELS[code as PlayStyleValue] || code;
}

// ============================================
// Referee Type (심판 방식)
// ============================================

export const REFEREE_TYPE_VALUES = ['SELF', 'STAFF', 'PRO'] as const;
export type RefereeTypeValue = typeof REFEREE_TYPE_VALUES[number];

export const REFEREE_TYPE_LABELS: Record<RefereeTypeValue, string> = {
  SELF: '자체콜',
  STAFF: '게스트/팀원',
  PRO: '전문 심판',
};

export const REFEREE_TYPE_OPTIONS = REFEREE_TYPE_VALUES.map(value => ({
  value,
  label: REFEREE_TYPE_LABELS[value],
}));

export const REFEREE_TYPE_DEFAULT: RefereeTypeValue = 'SELF';

export function getRefereeTypeLabel(code: string): string {
  return REFEREE_TYPE_LABELS[code as RefereeTypeValue] || code;
}

// ============================================
// Requirements (준비물)
// ============================================

export const REQUIREMENTS_VALUES = ['INDOOR_SHOES', 'WHITE_BLACK_JERSEY', 'TOWEL', 'WATER_BOTTLE'] as const;
export type RequirementsValue = typeof REQUIREMENTS_VALUES[number];

export const REQUIREMENTS_LABELS: Record<RequirementsValue, string> = {
  INDOOR_SHOES: '실내 농구화',
  WHITE_BLACK_JERSEY: '흰색/검은색 상의',
  TOWEL: '개인 수건',
  WATER_BOTTLE: '개인 물병',
};

export function getRequirementLabel(code: string): string {
  return REQUIREMENTS_LABELS[code as RequirementsValue] || code;
}

export function getRequirementLabels(codes: string[]): string[] {
  return codes.map(getRequirementLabel);
}

// ============================================
// Court Size (코트 크기)
// ============================================

export const COURT_SIZE_VALUES = ['REGULAR', 'SHORT', 'NARROW'] as const;
export type CourtSizeValue = typeof COURT_SIZE_VALUES[number];

export const COURT_SIZE_LABELS: Record<CourtSizeValue, { label: string; description: string }> = {
  REGULAR: { label: '정규 사이즈', description: '표준 코트입니다' },
  SHORT: { label: '세로가 좀 짧아요', description: '정규보다 짧습니다' },
  NARROW: { label: '가로가 좀 좁아요', description: '정규보다 좁습니다' },
};

export const COURT_SIZE_OPTIONS = COURT_SIZE_VALUES.map(value => ({
  value,
  label: COURT_SIZE_LABELS[value].label,
  description: COURT_SIZE_LABELS[value].description,
}));

export const COURT_SIZE_DEFAULT: CourtSizeValue = 'REGULAR';

// ============================================
// Match Format (경기 방식) - 5vs5, 3vs3
// ============================================

export const MATCH_FORMAT_VALUES = ['FIVE_ON_FIVE', 'THREE_ON_THREE'] as const;
export type MatchFormatValue = typeof MATCH_FORMAT_VALUES[number];

export const MATCH_FORMAT_LABELS: Record<MatchFormatValue, string> = {
  FIVE_ON_FIVE: '5vs5',
  THREE_ON_THREE: '3vs3',
};

export const MATCH_FORMAT_OPTIONS = MATCH_FORMAT_VALUES.map(value => ({
  value,
  label: MATCH_FORMAT_LABELS[value],
}));

export const MATCH_FORMAT_DEFAULT: MatchFormatValue = 'FIVE_ON_FIVE';

// ============================================
// Age (연령대)
// ============================================

export const AGE_VALUES = ['20', '30', '40', '50+'] as const;
export type AgeValue = typeof AGE_VALUES[number];

export const AGE_LABELS: Record<AgeValue, string> = {
  '20': '20대',
  '30': '30대',
  '40': '40대',
  '50+': '50대 이상',
};

export const AGE_OPTIONS = AGE_VALUES.map(value => ({
  value,
  label: AGE_LABELS[value],
}));

/**
 * 나이 range 표시 로직
 * @param range { min: number, max: number | null } | null
 * @returns 표시 문자열
 *
 * 예시:
 * - null → "나이 무관"
 * - { min: 20, max: null } → "20대 이상"
 * - { min: 30, max: 40 } → "30~40대"
 * - { min: 30, max: 30 } → "30대"
 */
export function getAgeRangeLabel(range: { min: number; max: number | null } | null): string {
  if (!range) return '나이 무관';
  if (range.max === null) return `${range.min}대 이상`;
  if (range.min === range.max) return `${range.min}대`;
  return `${range.min}~${range.max}대`;
}

// ============================================
// Match Type (경기 목적) - 용병모집, 픽업게임 등
// ============================================

export const MATCH_TYPE_VALUES = [
  'GUEST_RECRUIT',
  'PICKUP',
  'TOURNAMENT',
] as const;
export type MatchTypeValue = (typeof MATCH_TYPE_VALUES)[number];

export const MATCH_TYPE_LABELS: Record<MatchTypeValue, string> = {
  GUEST_RECRUIT: '게스트 모집',
  PICKUP: '픽업 게임',
  TOURNAMENT: '토너먼트',
};

// ============================================
// Match Status (경기 상태)
// ============================================

export const MATCH_STATUS_VALUES = [
  'RECRUITING',
  'CLOSING_SOON',
  'CLOSED',
  'FINISHED',
  'CANCELED',
] as const;
export type MatchStatusValue = (typeof MATCH_STATUS_VALUES)[number];

export const MATCH_STATUS_LABELS: Record<MatchStatusValue, string> = {
  RECRUITING: '모집 중',
  CLOSING_SOON: '마감 임박',
  CLOSED: '모집 마감',
  FINISHED: '경기 종료',
  CANCELED: '경기 취소',
};

export const MATCH_STATUS_STYLES: Record<
  MatchStatusValue,
  { color: string; bgColor: string }
> = {
  RECRUITING: { color: 'text-green-600', bgColor: 'bg-green-50' },
  CLOSING_SOON: { color: 'text-brand', bgColor: 'bg-brand-weak' },
  CLOSED: { color: 'text-gray-600', bgColor: 'bg-gray-100' },
  FINISHED: { color: 'text-gray-500', bgColor: 'bg-gray-50' },
  CANCELED: { color: 'text-red-600', bgColor: 'bg-red-50' },
};

export function getMatchStatusLabel(value: string): string {
  return MATCH_STATUS_LABELS[value as MatchStatusValue] || value;
}

// ============================================
// Parking Type (주차 유형)
// ============================================

export const PARKING_TYPE_VALUES = ['FREE', 'PAID', 'IMPOSSIBLE'] as const;
export type ParkingTypeValue = (typeof PARKING_TYPE_VALUES)[number];

export const PARKING_TYPE_LABELS: Record<ParkingTypeValue, string> = {
  FREE: '무료',
  PAID: '유료',
  IMPOSSIBLE: '불가',
};

// ============================================
// Ball (공 제공)
// ============================================

export const BALL_VALUES = ['PROVIDED', 'NOT_PROVIDED'] as const;
export type BallValue = (typeof BALL_VALUES)[number];

export const BALL_LABELS: Record<BallValue, string> = {
  PROVIDED: '제공',
  NOT_PROVIDED: '미제공',
};

// ============================================
// Contact Type (연락 방식)
// ============================================

export const CONTACT_TYPE_VALUES = ['PHONE', 'KAKAO_OPEN_CHAT'] as const;
export type ContactTypeValue = (typeof CONTACT_TYPE_VALUES)[number];

export const CONTACT_TYPE_LABELS: Record<ContactTypeValue, string> = {
  PHONE: '전화',
  KAKAO_OPEN_CHAT: '카카오 오픈채팅',
};

export const CONTACT_TYPE_DEFAULT: ContactTypeValue = 'PHONE';

// ============================================
// Notification Type (알림 유형)
// ============================================

export const NOTIFICATION_TYPE_VALUES = [
  'APPLICATION_APPROVED',
  'APPLICATION_REJECTED',
  'APPLICATION_CANCELED_USER_REQUEST',
  'APPLICATION_CANCELED_PAYMENT_TIMEOUT',
  'APPLICATION_CANCELED_FRAUDULENT_PAYMENT',
  'MATCH_CANCELED',
  'NEW_APPLICATION',
  'GUEST_CANCELED',
  'GUEST_PAYMENT_CONFIRMED',
  'HOST_ANNOUNCEMENT',
] as const;
export type NotificationTypeValue = (typeof NOTIFICATION_TYPE_VALUES)[number];

export const NOTIFICATION_TYPE_LABELS: Record<NotificationTypeValue, string> = {
  APPLICATION_APPROVED: '신청 승인',
  APPLICATION_REJECTED: '신청 거절',
  APPLICATION_CANCELED_USER_REQUEST: '합의 취소',
  APPLICATION_CANCELED_PAYMENT_TIMEOUT: '미송금 취소',
  APPLICATION_CANCELED_FRAUDULENT_PAYMENT: '허위 송금 신고',
  MATCH_CANCELED: '경기 취소',
  NEW_APPLICATION: '새 신청',
  GUEST_CANCELED: '게스트 취소',
  GUEST_PAYMENT_CONFIRMED: '송금 완료',
  HOST_ANNOUNCEMENT: '호스트 공지',
};

export const NOTIFICATION_TYPE_DESCRIPTIONS: Record<NotificationTypeValue, string> = {
  APPLICATION_APPROVED: '신청이 승인되었습니다. 입금을 진행해주세요.',
  APPLICATION_REJECTED: '신청이 거절되었습니다.',
  APPLICATION_CANCELED_USER_REQUEST: '호스트와 합의하여 취소되었습니다.',
  APPLICATION_CANCELED_PAYMENT_TIMEOUT: '기한 내 미송금으로 취소되었습니다.',
  APPLICATION_CANCELED_FRAUDULENT_PAYMENT: '허위 송금 신고로 취소되었습니다.',
  MATCH_CANCELED: '경기가 취소되었습니다.',
  NEW_APPLICATION: '새로운 경기 신청이 접수되었습니다.',
  GUEST_CANCELED: '게스트가 신청을 취소했습니다.',
  GUEST_PAYMENT_CONFIRMED: '게스트가 송금 완료를 알렸습니다.',
  HOST_ANNOUNCEMENT: '호스트가 공지를 등록했습니다.',
};

