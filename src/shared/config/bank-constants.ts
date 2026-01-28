/**
 * 한국 주요 은행 및 증권사 목록
 * 자주 사용되는 은행이 상단에 위치
 */

export type BankCategory = 'bank' | 'securities';

export interface BankItem {
  value: string;
  label: string;
  popular: boolean;
  category: BankCategory;
}

export const BANKS: readonly BankItem[] = [
  // 자주 사용되는 은행 (상단 배치)
  { value: 'KB국민은행', label: 'KB국민은행', popular: true, category: 'bank' },
  { value: '신한은행', label: '신한은행', popular: true, category: 'bank' },
  { value: '우리은행', label: '우리은행', popular: true, category: 'bank' },
  { value: '하나은행', label: '하나은행', popular: true, category: 'bank' },
  { value: 'NH농협은행', label: 'NH농협은행', popular: true, category: 'bank' },
  { value: '카카오뱅크', label: '카카오뱅크', popular: true, category: 'bank' },
  { value: '토스뱅크', label: '토스뱅크', popular: true, category: 'bank' },

  // 기타 은행
  { value: 'IBK기업은행', label: 'IBK기업은행', popular: false, category: 'bank' },
  { value: 'SC제일은행', label: 'SC제일은행', popular: false, category: 'bank' },
  { value: '씨티은행', label: '씨티은행', popular: false, category: 'bank' },
  { value: '새마을금고', label: '새마을금고', popular: false, category: 'bank' },
  { value: '신협', label: '신협', popular: false, category: 'bank' },
  { value: '우체국', label: '우체국', popular: false, category: 'bank' },
  { value: '수협', label: '수협', popular: false, category: 'bank' },
  { value: '부산은행', label: '부산은행', popular: false, category: 'bank' },
  { value: '경남은행', label: '경남은행', popular: false, category: 'bank' },
  { value: '대구은행', label: '대구은행', popular: false, category: 'bank' },
  { value: '광주은행', label: '광주은행', popular: false, category: 'bank' },
  { value: '전북은행', label: '전북은행', popular: false, category: 'bank' },
  { value: '제주은행', label: '제주은행', popular: false, category: 'bank' },
  { value: '케이뱅크', label: '케이뱅크', popular: false, category: 'bank' },
  { value: 'KDB산업은행', label: 'KDB산업은행', popular: false, category: 'bank' },
  { value: '산림조합', label: '산림조합', popular: false, category: 'bank' },

  // 증권사
  { value: '키움증권', label: '키움증권', popular: false, category: 'securities' },
  { value: '미래에셋증권', label: '미래에셋증권', popular: false, category: 'securities' },
  { value: '삼성증권', label: '삼성증권', popular: false, category: 'securities' },
  { value: '한국투자증권', label: '한국투자증권', popular: false, category: 'securities' },
  { value: 'NH투자증권', label: 'NH투자증권', popular: false, category: 'securities' },
  { value: 'KB증권', label: 'KB증권', popular: false, category: 'securities' },
  { value: '신한투자증권', label: '신한투자증권', popular: false, category: 'securities' },
  { value: '대신증권', label: '대신증권', popular: false, category: 'securities' },
  { value: '메리츠증권', label: '메리츠증권', popular: false, category: 'securities' },
  { value: '유안타증권', label: '유안타증권', popular: false, category: 'securities' },
  { value: '유진투자증권', label: '유진투자증권', popular: false, category: 'securities' },
  { value: '카카오페이증권', label: '카카오페이증권', popular: false, category: 'securities' },
  { value: '토스증권', label: '토스증권', popular: false, category: 'securities' },
  { value: '하나증권', label: '하나증권', popular: false, category: 'securities' },
  { value: '하이투자증권', label: '하이투자증권', popular: false, category: 'securities' },
  { value: '현대차증권', label: '현대차증권', popular: false, category: 'securities' },
  { value: '한화투자증권', label: '한화투자증권', popular: false, category: 'securities' },
  { value: 'DB금융투자', label: 'DB금융투자', popular: false, category: 'securities' },
  { value: 'IBK투자증권', label: 'IBK투자증권', popular: false, category: 'securities' },
  { value: 'SK증권', label: 'SK증권', popular: false, category: 'securities' },
  { value: '교보증권', label: '교보증권', popular: false, category: 'securities' },
  { value: '신영증권', label: '신영증권', popular: false, category: 'securities' },
  { value: 'LS증권', label: 'LS증권', popular: false, category: 'securities' },
] as const;

export type BankValue = typeof BANKS[number]['value'];

export const BANK_VALUES = BANKS.map(b => b.value);

// 분류별 필터
export const POPULAR_BANKS = BANKS.filter(b => b.popular);
export const OTHER_BANKS = BANKS.filter(b => !b.popular && b.category === 'bank');
export const SECURITIES = BANKS.filter(b => b.category === 'securities');
