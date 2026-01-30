/**
 * 날짜/시간 포맷 유틸리티
 * KST 기준으로 일관된 포맷을 제공합니다.
 */

export function formatMatchDate(dateString: string): string {
  const date = new Date(dateString);

  // KST 기준으로 날짜 포맷 (SSR/CSR 간 일관성 보장)
  const kstFormatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  });

  const parts = kstFormatter.formatToParts(date);
  const year = parts.find(p => p.type === 'year')?.value || '';
  const month = parts.find(p => p.type === 'month')?.value || '';
  const day = parts.find(p => p.type === 'day')?.value || '';
  const weekday = parts.find(p => p.type === 'weekday')?.value || '';

  return `${year}. ${month}. ${day} (${weekday})`;
}

export function formatMatchTime(dateString: string): string {
  const date = new Date(dateString);

  // KST 기준으로 시간 포맷 (SSR/CSR 간 일관성 보장)
  return date.toLocaleTimeString('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}
