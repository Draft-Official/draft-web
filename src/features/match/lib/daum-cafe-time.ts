export interface DaumCafeTimeParts {
  hour: number;
  minute: number;
}

export function parseDaumCafeTimeParts(time: string): DaumCafeTimeParts {
  const [rawHour = '0', rawMinute = '0'] = time.split(':');
  const hour = Math.min(Math.max(Number.parseInt(rawHour, 10) || 0, 0), 23);
  const minute = Math.min(Math.max(Number.parseInt(rawMinute, 10) || 0, 0), 59);
  return { hour, minute };
}

export function formatDaumCafeHourMinute(hour24: number, minute: number): string {
  if (minute === 0) return `${hour24}시`;
  return `${hour24}시${minute}분`;
}
