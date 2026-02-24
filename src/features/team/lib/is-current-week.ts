import { formatKSTDateISO, getKSTDateParts, parseKSTDateISO } from '@/shared/lib/datetime';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * 매치 시작 시간이 기준일의 이번 주(월~일)에 포함되는지 확인한다.
 */
export function isCurrentWeekMatch(startTime: string, referenceDate: Date = new Date()): boolean {
  const matchDateISO = formatKSTDateISO(startTime);
  const referenceDateISO = formatKSTDateISO(referenceDate);
  const referenceParts = getKSTDateParts(referenceDate);

  if (!matchDateISO || !referenceDateISO || !referenceParts) {
    return false;
  }

  const matchDate = parseKSTDateISO(matchDateISO);
  const referenceDateAtKST = parseKSTDateISO(referenceDateISO);

  const diffToMonday = (referenceParts.weekday + 6) % 7;
  const weekStart = new Date(referenceDateAtKST.getTime() - diffToMonday * DAY_IN_MS);
  const weekEnd = new Date(weekStart.getTime() + 6 * DAY_IN_MS);

  return matchDate.getTime() >= weekStart.getTime() && matchDate.getTime() <= weekEnd.getTime();
}
