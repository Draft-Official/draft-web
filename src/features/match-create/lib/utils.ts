// --- Date Utils for Match Create ---
import { formatKSTDateISO, getKSTDateParts, parseKSTDateISO } from '@/shared/lib/datetime';

const formatDateISO = (date: Date): string => {
  return formatKSTDateISO(date);
};

export interface DateOption {
  dateISO: string;
  label: string;
  dayNum: number | string;
  dayStr: string;
  isToday: boolean;
}

export const getNext14Days = (): DateOption[] => {
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const dates = [];
  const today = parseKSTDateISO(formatKSTDateISO(new Date()));

  for (let i = 0; i < 14; i++) {
    const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const parts = getKSTDateParts(d);
    if (!parts) continue;
    const month = parts.month;
    const date = parts.day;
    const day = days[parts.weekday];

    dates.push({
      dateISO: formatDateISO(d),
      label: `${month}.${date} (${day})`,
      dayNum: date,
      dayStr: day,
      isToday: i === 0,
    });
  }
  return dates;
};
