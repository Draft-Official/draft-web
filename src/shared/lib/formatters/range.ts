/**
 * Range formatting utilities
 * Used across multiple features (match, team)
 */

import type { LevelRange, AgeRange } from '@/shared/types/jsonb.types';
import { getLevelLabel } from '@/shared/config/constants';

/**
 * 레벨 범위 표시 문자열 생성
 * @example "중수(B) 이상"
 * @example "상수(C) ~ 고수(A)"
 */
export function formatLevelRange(levelRange: LevelRange | null): string | null {
  if (!levelRange) return null;

  const { min, max } = levelRange;
  const minLabel = getLevelLabel(min.toString(), '');
  const maxLabel = getLevelLabel(max.toString(), '');

  if (min === max) return `${minLabel} 이상`;
  return `${minLabel} ~ ${maxLabel}`;
}

/**
 * 나이 범위 표시 문자열 생성
 * @example "20대 ~ 30대"
 * @example "20대 이상"
 */
export function formatAgeRange(ageRange: AgeRange | null): string | null {
  if (!ageRange) return null;

  const { min, max } = ageRange;
  const minLabel = `${Math.floor(min / 10) * 10}대`;
  const maxLabel = max !== null ? `${Math.floor(max / 10) * 10}대` : null;

  if (max === null || Math.floor(min / 10) === Math.floor(max / 10)) {
    return `${minLabel} 이상`;
  }

  return `${minLabel} ~ ${maxLabel}`;
}
