/**
 * DateTime formatting utilities
 * Used across multiple features (match, team, application)
 */

/**
 * ISO timestamp에서 KST 시간 추출
 * @example "2026-02-14T10:00:00+00:00" => "19:00" (KST)
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * ISO timestamp에서 KST 날짜 추출
 * @example "2026-02-14T10:00:00+00:00" => "2026-02-14" (KST)
 */
export function formatDateISO(isoString: string): string {
  const date = new Date(isoString);
  const year = date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric' }).replace(/[^0-9]/g, '');
  const month = date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', month: '2-digit' }).replace(/[^0-9]/g, '');
  const day = date.toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', day: '2-digit' }).replace(/[^0-9]/g, '');
  return `${year}-${month}-${day}`;
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

