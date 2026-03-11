import { formatKSTDateISO, getKSTDateParts, parseKSTDateISO } from './datetime';

export interface DateOption {
  dateISO: string;
  dayStr: string;
  dayNum: number | string;
  label?: string;
  isToday?: boolean;
}

export function getNext14Days(): DateOption[] {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dates: DateOption[] = [];
  const today = parseKSTDateISO(formatKSTDateISO(new Date()));

  for (let i = 0; i < 14; i += 1) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const parts = getKSTDateParts(date);
    if (!parts) continue;

    const day = days[parts.weekday];
    dates.push({
      dateISO: formatKSTDateISO(date),
      label: `${parts.month}.${parts.day} (${day})`,
      dayNum: parts.day,
      dayStr: day,
      isToday: i === 0,
    });
  }

  return dates;
}
