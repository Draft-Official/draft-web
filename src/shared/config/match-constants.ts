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
