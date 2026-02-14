import { REGULAR_DAY_SHORT_LABELS, type RegularDayValue } from '@/shared/config/team-constants';
import { getLevelLabel } from '@/shared/config/skill-constants';
import type { AgeRange, LevelRange } from '@/shared/types/jsonb.types';

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;

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
 * 팀 정기운동 스케줄 표시 문자열 생성
 */
export function formatTeamRegularSchedule(
  regularDay: RegularDayValue | null,
  regularStartTime: string | null,
  regularEndTime: string | null
): string | null {
  if (!regularDay) return null;

  const day = REGULAR_DAY_SHORT_LABELS[regularDay];

  if (!regularStartTime) return `${day}요일`;

  const start = regularStartTime.slice(0, 5);
  if (!regularEndTime) return `${day}요일 ${start}`;

  const end = regularEndTime.slice(0, 5);
  return `${day}요일 ${start} ~ ${end}`;
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
  const date = new Date(dateISO);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayLabel = DAY_LABELS[date.getDay()];
  return `${year}. ${month}. ${day} (${dayLabel})`;
}

/**
 * 팀 매치 시간 표시 문자열 생성
 * @example 19:00
 */
export function formatTeamMatchTime(dateISO: string): string {
  const date = new Date(dateISO);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
