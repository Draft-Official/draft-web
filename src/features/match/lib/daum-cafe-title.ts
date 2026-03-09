import { getKSTDateParts } from '@/shared/lib/datetime';

const FULL_WEEKDAY_LABELS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'] as const;

const CITY_ALIAS_MAP: Record<string, string> = {
  서울특별시: '서울',
  부산광역시: '부산',
  대구광역시: '대구',
  인천광역시: '인천',
  광주광역시: '광주',
  대전광역시: '대전',
  울산광역시: '울산',
  세종특별자치시: '세종',
  강원특별자치도: '강원',
  경기도: '경기',
  충청북도: '충북',
  충청남도: '충남',
  전북특별자치도: '전북',
  전라북도: '전북',
  전라남도: '전남',
  경상북도: '경북',
  경상남도: '경남',
  제주특별자치도: '제주',
};

interface DateParts {
  month: number;
  day: number;
  weekday: string;
}

interface TimeParts {
  hour: number;
  minute: number;
}

export interface DaumCafeRecruitTitleInput {
  dateISO: string;
  startTime: string;
  endTime: string;
  placeName: string;
  address?: string | null;
}

function normalizeCity(token: string): string {
  if (!token) return '지역미정';
  if (CITY_ALIAS_MAP[token]) return CITY_ALIAS_MAP[token];

  return token
    .replace(/(특별자치도|특별자치시|특별시|광역시|자치시|자치도|도|시)$/u, '')
    .trim() || '지역미정';
}

function extractRegion(address: string | null | undefined): { city: string; district: string } {
  const tokens = (address ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) {
    return { city: '지역미정', district: '장소미정' };
  }

  const [cityToken = '', secondToken = ''] = tokens;
  const city = normalizeCity(cityToken);

  const districtCandidate = /(구|군|시)$/u.test(secondToken)
    ? secondToken
    : tokens.find((token, index) => index > 0 && /(구|군|시)$/u.test(token)) ?? '';

  return {
    city,
    district: districtCandidate || '장소미정',
  };
}

function parseDateParts(dateISO: string): DateParts {
  const parsed = getKSTDateParts(`${dateISO}T12:00:00+09:00`);
  if (parsed) {
    return {
      month: parsed.month,
      day: parsed.day,
      weekday: FULL_WEEKDAY_LABELS[parsed.weekday] ?? '요일미정',
    };
  }

  const match = dateISO.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/u);
  if (!match) {
    return { month: 0, day: 0, weekday: '요일미정' };
  }

  return {
    month: Number(match[2]),
    day: Number(match[3]),
    weekday: '요일미정',
  };
}

function parseTimeParts(time: string): TimeParts {
  const [rawHour = '0', rawMinute = '0'] = time.split(':');
  const hour = Math.min(Math.max(Number.parseInt(rawHour, 10) || 0, 0), 23);
  const minute = Math.min(Math.max(Number.parseInt(rawMinute, 10) || 0, 0), 59);
  return { hour, minute };
}

function formatHourMinute(hour24: number, minute: number): string {
  if (minute === 0) return `${hour24}시`;
  return `${hour24}시${minute}분`;
}

function formatTimeRange(startTime: string, endTime: string): string {
  const start = parseTimeParts(startTime);
  const end = parseTimeParts(endTime);

  return `${formatHourMinute(start.hour, start.minute)}~${formatHourMinute(end.hour, end.minute)}`;
}

export function buildDaumCafeRecruitTitle({
  dateISO,
  startTime,
  endTime,
  placeName,
  address,
}: DaumCafeRecruitTitleInput): string {
  const { city, district } = extractRegion(address);
  const { month, day, weekday } = parseDateParts(dateISO);
  const safePlaceName = placeName.trim() || '장소미정';
  const timeRange = formatTimeRange(startTime, endTime);

  return `[${city}][${district}] ${month}월${day}일 ${weekday} ${timeRange} ${safePlaceName}에서 게스트 모집합니다.`;
}
