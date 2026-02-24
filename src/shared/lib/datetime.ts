const KST_TIME_ZONE = 'Asia/Seoul';
const KST_OFFSET = '+09:00';

type DateInput = string | Date;

const EN_WEEKDAY_TO_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function toDate(value: DateInput): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toDateISOFromParts(parts: {
  year: number;
  month: number;
  day: number;
}): string {
  return `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`;
}

export interface KSTDateParts {
  year: number;
  month: number;
  day: number;
  weekday: number;
  weekdayLabel: string;
}

export function normalizeHHMM(value: string): string {
  const [rawHour = '0', rawMinute = '0'] = value.split(':');
  const hourNum = Number.parseInt(rawHour, 10);
  const minuteNum = Number.parseInt(rawMinute, 10);

  const hour = Number.isNaN(hourNum) ? 0 : Math.min(Math.max(hourNum, 0), 23);
  const minute = Number.isNaN(minuteNum) ? 0 : Math.min(Math.max(minuteNum, 0), 59);

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function toKSTDateTimeISO(dateISO: string, timeHHMM: string): string {
  return `${dateISO}T${normalizeHHMM(timeHHMM)}:00${KST_OFFSET}`;
}

export function parseKSTDateTime(dateISO: string, timeHHMM: string): Date {
  return new Date(toKSTDateTimeISO(dateISO, timeHHMM));
}

export function parseKSTDateISO(dateISO: string): Date {
  return parseKSTDateTime(dateISO, '12:00');
}

export function formatKSTTime(value: DateInput): string {
  const date = toDate(value);
  if (!date) return '';

  return date.toLocaleTimeString('ko-KR', {
    timeZone: KST_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function getKSTDateParts(value: DateInput): KSTDateParts | null {
  const date = toDate(value);
  if (!date) return null;

  const dateParts = new Intl.DateTimeFormat('en-US', {
    timeZone: KST_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = Number(dateParts.find((part) => part.type === 'year')?.value ?? '0');
  const month = Number(dateParts.find((part) => part.type === 'month')?.value ?? '0');
  const day = Number(dateParts.find((part) => part.type === 'day')?.value ?? '0');

  if (!year || !month || !day) return null;

  const weekdayLabel = new Intl.DateTimeFormat('ko-KR', {
    timeZone: KST_TIME_ZONE,
    weekday: 'short',
  }).format(date).replace('.', '');

  const weekdayEn = new Intl.DateTimeFormat('en-US', {
    timeZone: KST_TIME_ZONE,
    weekday: 'short',
  }).format(date);

  return {
    year,
    month,
    day,
    weekday: EN_WEEKDAY_TO_INDEX[weekdayEn] ?? 0,
    weekdayLabel,
  };
}

export function formatKSTDateISO(value: DateInput): string {
  const parts = getKSTDateParts(value);
  if (!parts) return '';
  return toDateISOFromParts(parts);
}

export function getKSTStartOfTodayISO(referenceDate: Date = new Date()): string {
  const todayISO = formatKSTDateISO(referenceDate);
  return toKSTDateTimeISO(todayISO, '00:00');
}

export function formatMatchDate(dateString: string): string {
  const parts = getKSTDateParts(dateString);
  if (!parts) return '';
  return `${parts.year}. ${String(parts.month).padStart(2, '0')}. ${String(parts.day).padStart(2, '0')} (${parts.weekdayLabel})`;
}

export function formatMatchTime(dateString: string): string {
  return formatKSTTime(dateString);
}
