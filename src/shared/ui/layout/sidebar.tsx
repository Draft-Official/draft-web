'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, User } from 'lucide-react';
import { Button } from '@/shared/ui/base/button';
import { cn } from '@/shared/lib/utils';
import type { ReactNode } from 'react';

interface SidebarProps {
  notificationSlot?: ReactNode;
}

export function Sidebar({ notificationSlot }: SidebarProps) {
  const pathname = usePathname() ?? '';

  const NAV_ITEMS = [
    { label: '홈', href: '/', icon: Home },
    { label: '팀', href: '/team', icon: Users },
    { label: '경기관리', href: '/schedule', icon: Calendar },
    { label: '마이', href: '/my', icon: User },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Logo + Notification */}
      <div className="h-14 flex items-center justify-between px-6 pt-6 mb-6">
        <Link href="/" className="text-2xl font-black italic tracking-tighter text-slate-900">
          DRAFT.
        </Link>
        {notificationSlot}
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-6 py-3 rounded-sm text-xl font-medium transition-all duration-200 hover:bg-slate-100 w-full",
                isActive ? "font-bold text-slate-900" : "text-slate-600"
              )}
            >
              <item.icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 1.5} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Action Button - Only visible on Home Tab (Match List) */}
      {pathname === '/' && (
        <div className="mt-auto px-6 pb-6">
          <Link href="/matches/create" className="block w-full">
            <Button
              className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-white text-lg font-bold shadow-lg shadow-draft-200"
            >
              경기 개설하기
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
