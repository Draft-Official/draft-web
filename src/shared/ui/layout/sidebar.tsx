'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, MessageCircle, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/shared/session';

interface SidebarProps {
  compact?: boolean;
}

export function Sidebar({ compact = false }: SidebarProps) {
  const pathname = usePathname() ?? '';
  const { isAuthenticated } = useAuth();
  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const NAV_ITEMS = [
    { label: '홈', href: '/', icon: Home },
    { label: '팀', href: '/team', icon: Users },
    { label: '경기관리', href: '/schedule', icon: Calendar },
    { label: '채팅', href: '/chat', icon: MessageCircle },
    { label: '마이', href: '/my', icon: User },
  ];

  if (compact) {
    return (
      <div className="flex h-full flex-col pt-3">
        <nav className="flex-1 flex flex-col items-center gap-1 px-2">
          {NAV_ITEMS.map((item) => {
            const isProtectedTab =
              item.href === '/team' || item.href === '/schedule' || item.href === '/chat';
            const href =
              isProtectedTab && !isAuthenticated
                ? `/auth/login?redirect=${encodeURIComponent(item.href)}`
                : item.href;
            const isActive = isActivePath(item.href);

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "w-full rounded-xl px-2 py-3 transition-colors duration-200",
                  "flex flex-col items-center justify-center gap-1.5 text-center",
                  isActive
                    ? "text-slate-900 font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[12px] leading-4 font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pb-2" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pt-6">
      {/* Menu */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isProtectedTab =
            item.href === '/team' || item.href === '/schedule' || item.href === '/chat';
          const href =
            isProtectedTab && !isAuthenticated
              ? `/auth/login?redirect=${encodeURIComponent(item.href)}`
              : item.href;
          const isActive = isActivePath(item.href);
          return (
            <Link
              key={item.href}
              href={href}
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
    </div>
  );
}
