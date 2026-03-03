'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Users, Calendar, User } from 'lucide-react';
import { Button } from '@/shared/ui/shadcn/button';
import { cn } from '@/shared/lib/utils';
import { useAuth, useRequireAuth } from '@/shared/session';
import { LoginRequiredModal } from '@/features/auth';
import type { ReactNode } from 'react';

interface SidebarProps {
  notificationSlot?: ReactNode;
  compact?: boolean;
}

export function Sidebar({ notificationSlot, compact = false }: SidebarProps) {
  const pathname = usePathname() ?? '';
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { requireAuth, modalProps } = useRequireAuth({
    redirectTo: '/matches/create',
    description: '모집글을 작성하려면 로그인이 필요합니다.\n로그인 후 이용해 주세요.',
  });

  const handleCreateMatch = () => {
    if (requireAuth()) {
      router.push('/matches/create');
    }
  };

  const NAV_ITEMS = [
    { label: '홈', href: '/', icon: Home },
    { label: '팀', href: '/team', icon: Users },
    { label: '경기관리', href: '/schedule', icon: Calendar },
    { label: '마이', href: '/my', icon: User },
  ];

  if (compact) {
    return (
      <>
        <div className="flex h-full flex-col">
          <div className="h-14 flex items-center justify-center pt-4 mb-4">
            <Link href="/" className="text-lg font-black italic tracking-tighter text-slate-900">
              D.
            </Link>
          </div>

          <nav className="flex-1 flex flex-col items-center gap-1 px-2">
            {NAV_ITEMS.map((item) => {
              const isProtectedTab = item.href === '/team' || item.href === '/schedule';
              const href =
                isProtectedTab && !isAuthenticated
                  ? `/auth/login?redirect=${encodeURIComponent(item.href)}`
                  : item.href;
              const isActive = pathname === item.href;

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
        <LoginRequiredModal {...modalProps} />
      </>
    );
  }

  return (
    <>
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
            const isProtectedTab = item.href === '/team' || item.href === '/schedule';
            const href =
              isProtectedTab && !isAuthenticated
                ? `/auth/login?redirect=${encodeURIComponent(item.href)}`
                : item.href;
            const isActive = pathname === item.href;
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

        {/* Action Button - Only visible on Home Tab (Match List) */}
        {pathname === '/' && (
          <div className="mt-auto px-6 pb-6">
            <Button
              onClick={handleCreateMatch}
              className="w-full h-14 rounded-full bg-primary hover:bg-primary/90 text-white text-lg font-bold shadow-lg shadow-draft-200"
            >
              경기 개설하기
            </Button>
          </div>
        )}
      </div>
      <LoginRequiredModal {...modalProps} />
    </>
  );
}
