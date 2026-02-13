'use client';

import { Phone, Mail, KeyRound, Link2 } from 'lucide-react';
import { MenuSection } from './menu-section';

const ACCOUNT_MENUS = [
  { label: '전화번호 변경', href: '/my/account/phone', icon: Phone },
  { label: '이메일 변경', href: '/my/account/email', icon: Mail },
  { label: '비밀번호 재설정', href: '/my/account/password', icon: KeyRound },
  { label: '연동된 소셜 계정 관리', href: '/my/account/social', icon: Link2 },
] as const;

export function AccountSection() {
  return <MenuSection title="계정" items={ACCOUNT_MENUS} />;
}
