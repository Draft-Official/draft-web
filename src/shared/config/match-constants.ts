/**
 * 매치 관련 상수 및 UI 라벨 매핑
 */

// ============================================
// 준비물 (Requirements)
// ============================================

export const REQUIREMENTS_MAP: Record<string, string> = {
  INDOOR_SHOES: '실내 농구화',
  WHITE_BLACK_JERSEY: '흰색/검은색 상의',
  TOWEL: '개인 수건',
  WATER_BOTTLE: '개인 물병',
};

/**
 * 준비물 코드를 UI 텍스트로 변환
 */
export function getRequirementLabel(code: string): string {
  return REQUIREMENTS_MAP[code] || code;
}

/**
 * 준비물 배열을 UI 텍스트 배열로 변환
 */
export function getRequirementLabels(codes: string[]): string[] {
  return codes.map(getRequirementLabel);
}

// ============================================
// 경기 형태 (Play Style)
// ============================================

export const PLAY_STYLE_MAP: Record<string, string> = {
  INTERNAL_2WAY: '자체전 (2파전)',
  INTERNAL_3WAY: '자체전 (3파전)',
  EXCHANGE: '팀 교류전',
  PRACTICE: '연습/레슨',
};

/**
 * 경기 형태 코드를 UI 텍스트로 변환
 */
export function getPlayStyleLabel(code: string): string {
  return PLAY_STYLE_MAP[code] || code;
}

// ============================================
// 심판 방식 (Referee Type)
// ============================================

export const REFEREE_TYPE_MAP: Record<string, string> = {
  SELF: '자체콜',
  STAFF: '게스트/팀원',
  PRO: '전문 심판',
};

/**
 * 심판 방식 코드를 UI 텍스트로 변환
 */
export function getRefereeTypeLabel(code: string): string {
  return REFEREE_TYPE_MAP[code] || code;
}

// ============================================
// 레벨 (Skill Level)
// ============================================

// skill-constants.ts의 SKILL_LEVEL_NAMES 재사용
// 또는 직접 매핑
export const LEVEL_MAP: Record<string, string> = {
  '1': '초보1',
  '2': '초보2',
  '3': '중급1',
  '4': '중급2',
  '5': '상급1',
  '6': '상급2',
  '7': '선출',
};

/**
 * 레벨 코드를 UI 텍스트로 변환
 * @param code 레벨 코드 (예: "3", "중급1")
 * @param suffix 접미사 추가 여부 (예: "이상")
 */
export function getLevelLabel(code: string, suffix: string = '이상'): string {
  const label = LEVEL_MAP[code] || code;
  return suffix ? `${label} ${suffix}` : label;
}

// ============================================
// Form/Filter Options (for UI selects)
// ============================================

export const MATCH_TYPE_OPTIONS = [
  { value: '5vs5', label: '5vs5' },
  { value: '3vs3', label: '3vs3' }
] as const;

export const GENDER_OPTIONS = [
  { value: 'men', label: '남성' },
  { value: 'women', label: '여성' },
  { value: 'mixed', label: '성별 무관' }
] as const;

export const LEVEL_OPTIONS = [
  { value: 'low', label: '초보', color: '#22C55E' },
  { value: 'middle', label: '중급', color: '#EAB308' },
  { value: 'high', label: '상급', color: '#FF6600' },
  { value: 'pro', label: '프로', color: '#EF4444' }
] as const;

export const AGE_OPTIONS = [
  { value: '20', label: '20대' },
  { value: '30', label: '30대' },
  { value: '40', label: '40대' },
  { value: '50', label: '50대' },
  { value: '60', label: '60대' },
  { value: '70', label: '70대' }
] as const;

export const GAME_FORMAT_OPTIONS = [
  { value: 'internal_2', label: '자체전(2파전)' },
  { value: 'internal_3', label: '자체전(3파전)' },
  { value: 'exchange', label: '팀 교류전' }
] as const;

export const REFEREE_OPTIONS = [
  { value: 'self', label: '자체콜' },
  { value: 'member', label: '게스트/팀원' },
  { value: 'pro', label: '전문 심판' }
] as const;

export const COURT_SIZE_OPTIONS = [
  { value: 'regular', label: '정규 사이즈', description: '표준 코트입니다' },
  { value: 'short', label: '세로가 좀 짧아요', description: '정규보다 짧습니다' },
  { value: 'narrow', label: '가로가 좀 좁아요', description: '정규보다 좁습니다' }
] as const;
