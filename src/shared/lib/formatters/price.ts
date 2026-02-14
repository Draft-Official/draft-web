/**
 * Price formatting utilities
 * Used across multiple features (match, team)
 */

import type { CostTypeValue } from '@/shared/config/match-constants';

/**
 * 가격 표시 문자열 생성
 * @example formatPrice('FREE', 0) => "무료"
 * @example formatPrice('MONEY', 10000) => "10,000원"
 * @example formatPrice('BEVERAGE', 2) => "음료수 2병"
 */
export function formatPrice(costType: CostTypeValue, amount: number | null): string {
  if (costType === 'FREE') return '무료';
  if (costType === 'BEVERAGE') return `음료수 ${amount ?? 0}병`;
  return `${(amount ?? 0).toLocaleString()}원`;
}
