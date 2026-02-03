'use client';

import Link from 'next/link';
import { Phone, Mail, KeyRound, Link2, ChevronRight } from 'lucide-react';
import { Card } from '@/shared/ui/base/card';

const ACCOUNT_MENUS = [
  { label: '전화번호 변경', href: '/my/account/phone', icon: Phone },
  { label: '이메일 변경', href: '/my/account/email', icon: Mail },
  { label: '비밀번호 재설정', href: '/my/account/password', icon: KeyRound },
  { label: '연동된 소셜 계정 관리', href: '/my/account/social', icon: Link2 },
] as const;

export function AccountSection() {
  return (
    <div className="space-y-3">
      <h2 className="font-bold text-lg text-foreground">계정</h2>
      <Card className="p-0 overflow-hidden border-border">
        <div className="divide-y divide-border">
          {ACCOUNT_MENUS.map(({ label, href, icon: Icon }) => (
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
