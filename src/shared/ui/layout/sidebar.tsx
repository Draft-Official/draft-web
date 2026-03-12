'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, MessageCircle, User } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface SidebarProps {
  compact?: boolean;
  actionSlot?: ReactNode;
  unreadChatCount?: number;
}

export function Sidebar({ compact = false, actionSlot, unreadChatCount = 0 }: SidebarProps) {
  const pathname = usePathname() ?? '';
  const isActivePath = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const NAV_ITEMS = [
    { label: '홈', href: '/', icon: Home, unreadCount: 0 },
    { label: '팀', href: '/team', icon: Users, unreadCount: 0 },
    { label: '경기관리', href: '/schedule', icon: Calendar, unreadCount: 0 },
    { label: '채팅', href: '/chat', icon: MessageCircle, unreadCount: unreadChatCount },
    { label: '마이', href: '/my', icon: User, unreadCount: 0 },
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
            const href = item.href;
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
                  <div className="relative">
                    <item.icon className="i-lg" strokeWidth={isActive ? 2.5 : 1.8} />
                    {item.unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
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
          const href = item.href;
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
                  <div className="relative">
                    <item.icon className="i-xl" strokeWidth={isActive ? 2.5 : 1.5} />
                  </div>
                <span>{item.label}</span>
                {item.unreadCount > 0 && (
                  <span className="ml-auto inline-flex min-w-[20px] h-5 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary px-1.5 text-xs font-bold leading-none text-white">
                    {item.unreadCount > 99 ? '99+' : item.unreadCount}
                  </span>
                )}
              </Link>
            </Fragment>
          );
        })}
      </nav>
    </div>
  );
}
