/**
 * Match Feature Formatting Utilities
 * Match-specific formatting (positions only)
 */

import type { PositionValue } from '@/shared/config/match-constants';
import type { RecruitmentSetup } from '@/shared/types/jsonb.types';

/**
 * 포지션 모집 현황 문자열 생성
 * @example "가드 1/3, 포워드 2/2"
 * @example "포지션 무관 3/5"
 */
export function formatPositions(recruitmentSetup: RecruitmentSetup): string {
  const { type } = recruitmentSetup;

  if (type === 'ANY') {
    const current = recruitmentSetup.current_count ?? 0;
    const max = recruitmentSetup.max_count;
    return `포지션 무관 ${current}/${max}`;
  }

  if (type === 'POSITION') {
    const positions = recruitmentSetup.positions;
    const positionLabels: Record<PositionValue, string> = {
      G: '가드',
      F: '포워드',
      C: '센터',
      B: '빅맨',
    };

    const formatted = (Object.keys(positions) as PositionValue[])
      .filter((pos) => {
        const quota = positions[pos];
        return quota && quota.max > 0;
      })
      .map((pos) => {
        const quota = positions[pos];
        if (!quota) return '';
        const { current = 0, max } = quota;
        return `${positionLabels[pos]} ${current}/${max}`;
      })
      .join(', ');

    return formatted || '모집 없음';
  }

  return '모집 없음';
}
