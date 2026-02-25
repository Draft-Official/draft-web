import { REGULAR_DAY_SHORT_LABELS, type RegularDayValue } from '@/shared/config/team-constants';
import { getLevelLabel } from '@/shared/config/skill-constants';
import type { AgeRange, LevelRange } from '@/shared/types/jsonb.types';
import { formatKSTTime, getKSTDateParts } from '@/shared/lib/datetime';

/**
 * 팀 지역 표시 문자열 생성
 */
export function formatTeamRegion(
  regionDepth1: string | null,
  regionDepth2: string | null
): string | null {
  if (!regionDepth1) return null;
  return regionDepth2 ? `${regionDepth1} ${regionDepth2}` : regionDepth1;
}

/**
 * 팀 정기운동 스케줄 표시 문자열 생성 (복수 요일 지원)
 */
export function formatTeamRegularSchedule(
  regularDays: RegularDayValue[] | null,
  regularStartTime: string | null,
  regularEndTime: string | null
): string | null {
  if (!regularDays || regularDays.length === 0) return null;

  // 1개: "화요일", 2개 이상: "화, 목"
  const dayStr = regularDays.length === 1
    ? `${REGULAR_DAY_SHORT_LABELS[regularDays[0]]}요일`
    : regularDays.map((d) => REGULAR_DAY_SHORT_LABELS[d]).join(', ');

  if (!regularStartTime) return dayStr;

  const start = regularStartTime.slice(0, 5);
  if (!regularEndTime) return `${dayStr} ${start}`;

  const end = regularEndTime.slice(0, 5);
  return `${dayStr} ${start} ~ ${end}`;
}

/**
 * 팀 레벨 범위 표시 문자열 생성
 */
export function formatTeamLevelRange(levelRange: LevelRange | null): string | null {
  if (!levelRange) return null;

  const minLabel = getLevelLabel(levelRange.min, '');
  const maxLabel = getLevelLabel(levelRange.max, '');

  if (levelRange.min === levelRange.max) {
    return minLabel || `레벨 ${levelRange.min}`;
  }

  const min = minLabel || `레벨 ${levelRange.min}`;
  const max = maxLabel || `레벨 ${levelRange.max}`;
  return `${min} ~ ${max}`;
}

/**
 * 팀 나이 범위 표시 문자열 생성
 */
export function formatTeamAgeRange(ageRange: AgeRange | null): string | null {
  if (!ageRange) return null;

  if (ageRange.max === null) return `${ageRange.min}대 이상`;
  if (ageRange.min === ageRange.max) return `${ageRange.min}대`;
  return `${ageRange.min}대~${ageRange.max}대`;
}

/**
 * 팀 매치 날짜 표시 문자열 생성
 * @example 2026. 2. 14 (토)
 */
export function formatTeamMatchDate(dateISO: string): string {
  const parts = getKSTDateParts(dateISO);
  if (!parts) return '';
  return `${parts.year}. ${parts.month}. ${parts.day} (${parts.weekdayLabel})`;
}

/**
 * 팀 매치 시간 표시 문자열 생성
 * @example 19:00
 */
export function formatTeamMatchTime(dateISO: string): string {
  return formatKSTTime(dateISO);
}
