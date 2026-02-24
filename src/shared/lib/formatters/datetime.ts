/**
 * DateTime formatting utilities
 * Used across multiple features (match, team, application)
 */
import { formatKSTDateISO, formatKSTTime } from '@/shared/lib/datetime';

/**
 * ISO timestamp에서 KST 시간 추출
 * @example "2026-02-14T10:00:00+00:00" => "19:00" (KST)
 */
export function formatTime(isoString: string): string {
  return formatKSTTime(isoString);
}

/**
 * ISO timestamp에서 KST 날짜 추출
 * @example "2026-02-14T10:00:00+00:00" => "2026-02-14" (KST)
 */
export function formatDateISO(isoString: string): string {
  return formatKSTDateISO(isoString);
}

/**
 * 1시간 이내 생성된지 확인 (NEW 배지용)
 */
export function isWithin1Hour(createdAt: string | null): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diff = now.getTime() - created.getTime();
  return diff < 60 * 60 * 1000;
}
