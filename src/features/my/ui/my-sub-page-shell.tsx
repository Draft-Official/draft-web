'use client';

import { usePathname } from 'next/navigation';
import { SubPageHeader } from './sub-page-header';

const TITLE_MAP: Record<string, string> = {
  '/my/contact': '문의하기',
  '/my/faq': 'FAQ',
  '/my/notices': '공지사항',
  '/my/account/phone': '전화번호 인증',
  '/my/account/password': '비밀번호 재설정',
  '/my/account/email': '이메일 변경',
  '/my/account/social': '소셜 계정 관리',
  '/my/payment/bank-account': '계좌 관리',
  '/my/terms': '서비스 이용약관',
  '/my/privacy': '개인정보 처리방침',
};

export function MySubPageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';

  if (pathname === '/my') return <>{children}</>;

  const title = TITLE_MAP[pathname] ?? '';

  return (
    <div className="min-h-full bg-white">
      <SubPageHeader title={title} />
      {children}
    </div>
  );
}
