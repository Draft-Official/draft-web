'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, User } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: '홈', href: '/', icon: Home },
    { label: '팀', href: '/team', icon: Users },
    { label: '일정', href: '/schedule', icon: Calendar },
    { label: '마이', href: '/my', icon: User },
  ];

  // Hide bottom nav on detail pages (e.g. /match/create, /guest/123)
  const isDetailPage = pathname.split('/').filter(Boolean).length > 1;

  if (isDetailPage) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full h-[60px] bg-white border-t border-slate-100 flex items-center justify-around z-50 md:hidden pb-safe">
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
