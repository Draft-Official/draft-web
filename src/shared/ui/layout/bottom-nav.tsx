'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

import { useScrollDirection } from '@/shared/lib/hooks/use-scroll-direction';

export function BottomNav() {
  const pathname = usePathname();
  const isScrolledDown = useScrollDirection(); // Shared scroll logic

  const NAV_ITEMS = [
    { label: '홈', href: '/', icon: Home },
    { label: '팀', href: '/team', icon: Users },
    { label: '경기관리', href: '/schedule', icon: Calendar },
    { label: '마이', href: '/my', icon: User },
  ];

  // Pages where bottom nav should be visible
  const showNavOnPages = ['/', '/team', '/schedule', '/my', '/notifications'];
  const shouldShowNav = showNavOnPages.includes(pathname);

  if (!shouldShowNav) return null;

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 w-full h-[60px] bg-white border-t border-slate-100 flex items-center justify-around z-50 lg:hidden pb-safe transition-transform duration-300 ease-in-out",
        isScrolledDown ? "translate-y-full" : "translate-y-0"
      )}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform",
              isActive ? "text-slate-900" : "text-slate-400"
            )}
          >
            <item.icon className={cn("w-6 h-6", isActive && "fill-slate-900")} strokeWidth={isActive ? 2.5 : 2} />
            {/* Optional: Label can be hidden for pure Instagram style, or kept small */}
            {/* <span className="text-[10px] font-medium">{item.label}</span> */}
          </Link>
        );
      })}
    </div>
  );
}
