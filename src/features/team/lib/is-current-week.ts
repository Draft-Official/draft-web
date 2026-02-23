import { endOfWeek, isWithinInterval, startOfWeek } from 'date-fns';

/**
 * 매치 시작 시간이 기준일의 이번 주(월~일)에 포함되는지 확인한다.
 */
export function isCurrentWeekMatch(startTime: string, referenceDate: Date = new Date()): boolean {
  const matchDate = new Date(startTime);

  if (Number.isNaN(matchDate.getTime())) {
    return false;
  }

  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });

  return isWithinInterval(matchDate, {
    start: weekStart,
    end: weekEnd,
  });
}
