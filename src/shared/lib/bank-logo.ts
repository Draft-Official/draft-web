const BANK_LOGO_PATH_BY_NAME: Record<string, string> = {
  'KB국민은행': '/banks/official/kb-kookmin-fill.png',
  신한은행: '/banks/official/shinhan-fill.png',
  우리은행: '/banks/official/woori-fill.png',
  하나은행: '/banks/official/hana-fill.png',
  'KEB하나은행': '/banks/official/hana-fill.png',
  'NH농협은행': '/banks/official/nh-nonghyup-fill.png',
  카카오뱅크: '/banks/official/kakao-bank-fill.png',
  토스뱅크: '/banks/official/toss-bank-fill.png',
  'IBK기업은행': '/banks/official/ibk-fill.png',
  'SC제일은행': '/banks/official/sc-standard-fill.png',
  씨티은행: '/banks/official/citi-fill.png',
  시티은행: '/banks/official/citi-fill.png',
  새마을금고: '/banks/official/mg-fill.png',
  'MG새마을금고': '/banks/official/mg-fill.png',
  신협: '/banks/official/shinhyup-fill.png',
  우체국: '/banks/official/korea-post-fill.png',
  수협: '/banks/official/suhyup-fill.png',
  수협은행: '/banks/official/suhyup-fill.png',
  부산은행: '/banks/official/bnk-busan-gyeongnam-fill.png',
  경남은행: '/banks/official/bnk-busan-gyeongnam-fill.png',
  광주은행: '/banks/official/gwangju-jeonbuk-fill.png',
  전북은행: '/banks/official/gwangju-jeonbuk-fill.png',
  제주은행: '/banks/official/shinhan-fill.png',
  케이뱅크: '/banks/official/kbank-fill.png',
  'KDB산업은행': '/banks/official/kdb-fill.png',
  대구은행: '/banks/official/im-bank-fill.png',
  'iM뱅크': '/banks/official/im-bank-fill.png',
  'IM뱅크': '/banks/official/im-bank-fill.png',
};

export function getBankLogoPath(bankName: string): string | null {
  return BANK_LOGO_PATH_BY_NAME[bankName] ?? null;
}

export function getBankBadgeText(bankName: string): string {
  const compact = bankName.replace(/\s+/g, '');
  const englishPrefix = compact.match(/^[A-Z]{2,3}/)?.[0];
  if (englishPrefix) return englishPrefix;
  return compact.charAt(0);
}
