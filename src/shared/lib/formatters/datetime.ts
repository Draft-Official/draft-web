/**
 * DateTime formatting utilities
 * Used across multiple features (match, team, application)
 */

/**
 * ISO timestamp에서 시간 추출
 * @example "2026-02-14T19:00:00Z" => "19:00"
 */
export function formatTime(isoString: string): string {
  return isoString.split('T')[1]?.substring(0, 5) ?? '';
}

/**
 * ISO timestamp에서 날짜 추출
 * @example "2026-02-14T19:00:00Z" => "2026-02-14"
 */
export function formatDateISO(isoString: string): string {
  return isoString.split('T')[0] ?? '';
}

/**
 * 24시간 이내 생성된지 확인 (NEW 배지용)
 */
export function isWithin24Hours(createdAt: string | null): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diff = now.getTime() - created.getTime();
  return diff < 24 * 60 * 60 * 1000;
}
