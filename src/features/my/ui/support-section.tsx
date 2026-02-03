'use client';

import Link from 'next/link';
import {
  HelpCircle,
  MessageSquare,
  Megaphone,
  FileText,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/shared/ui/base/card';

const SUPPORT_MENUS = [
  { label: 'FAQ', href: '/my/faq', icon: HelpCircle },
  { label: '문의하기', href: '/my/contact', icon: MessageSquare },
  { label: '공지사항', href: '/my/notices', icon: Megaphone },
  { label: '서비스 이용약관', href: '/my/terms', icon: FileText },
  { label: '개인정보 처리 방침', href: '/my/privacy', icon: Shield },
] as const;

export function SupportSection() {
  return (
    <div className="space-y-3">
      <h2 className="font-bold text-lg text-foreground">고객지원</h2>
      <Card className="p-0 overflow-hidden border-border">
        <div className="divide-y divide-border">
          {SUPPORT_MENUS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
