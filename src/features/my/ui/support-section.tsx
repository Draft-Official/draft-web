'use client';

import { HelpCircle, MessageSquare, Megaphone } from 'lucide-react';
import { MenuSection } from './menu-section';

const SUPPORT_MENUS = [
  { label: 'FAQ', href: '/my/faq', icon: HelpCircle },
  { label: '채팅 문의', href: '/chat', icon: MessageSquare },
  { label: '공지사항', href: '/my/notices', icon: Megaphone },
] as const;

export function SupportSection() {
  return <MenuSection title="고객지원" items={SUPPORT_MENUS} />;
}
