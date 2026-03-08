'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, MessageCircle, User } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { useAuth } from '@/shared/session';

interface SidebarProps {
  compact?: boolean;
  actionSlot?: ReactNode;
}

export function Sidebar({ compact = false, actionSlot }: SidebarProps) {
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
        <div className="px-2 pb-3">
          <Link
            href="/"
            className="flex h-10 w-full items-center justify-center rounded-xl text-xl font-black italic tracking-tighter text-slate-900 transition-colors hover:bg-slate-100"
          >
            D.
          </Link>
        </div>
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
              <Fragment key={item.href}>
                {item.href === '/my' && actionSlot && (
                  <div className="w-full pt-1">{actionSlot}</div>
                )}
                <Link
                  href={href}
                  className={cn(
                    "w-full rounded-xl px-2 py-3 transition-colors duration-200",
                    "flex items-center justify-center text-center",
                    isActive
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <item.icon className="i-lg" strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </Fragment>
            );
          })}
        </nav>

        <div className="mt-auto pb-2" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full pt-6">
      <div className="px-2 pb-4">
        <Link
          href="/"
          className="flex w-full items-center rounded-xl px-4 py-3 text-2xl font-black italic tracking-tighter text-slate-900 transition-colors hover:bg-slate-100"
        >
          DRAFT.
        </Link>
      </div>
      {/* Menu */}
      <nav className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const isProtectedTab =
            item.href === '/team' || item.href === '/schedule' || item.href === '/chat';
          const href =
            isProtectedTab && !isAuthenticated
              ? `/auth/login?redirect=${encodeURIComponent(item.href)}`
              : item.href;
          const isActive = isActivePath(item.href);
          return (
            <Fragment key={item.href}>
              {item.href === '/my' && actionSlot && (
                <div className="py-1">{actionSlot}</div>
              )}
              <Link
                href={href}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200 hover:bg-slate-100 w-full",
                  isActive ? "font-bold text-slate-900" : "text-slate-600"
                )}
              >
                  <item.icon className="i-xl" strokeWidth={isActive ? 2.5 : 1.5} />
                <span>{item.label}</span>
              </Link>
            </Fragment>
          );
        })}
      </nav>
    </div>
  );
}
