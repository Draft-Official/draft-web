'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Calendar, User, Plus } from 'lucide-react';
import { Button } from '@/shared/ui/base/button';
import { cn } from '@/shared/lib/utils';

export function Sidebar() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { label: '홈', href: '/', icon: Home },
    { label: '팀', href: '/team', icon: Users },
    { label: '경기관리', href: '/schedule', icon: Calendar },
    { label: '마이', href: '/my', icon: User },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center mb-6">
        <Link href="/" className="text-2xl font-black italic tracking-tighter text-slate-900">
          DRAFT.
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-full text-xl font-medium transition-colors hover:bg-slate-100",
                isActive ? "font-bold text-slate-900" : "text-slate-600"
              )}
            >
              <item.icon className={cn("w-7 h-7", isActive && "fill-slate-900")} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Action Button - Only visible on Home Tab (Match List) */}
      {pathname === '/' && (
        <div className="mt-auto pb-6">
          <Link href="/matches/create" className="block w-full">
            <Button 
              className="w-full h-14 rounded-full bg-[#FF6600] hover:bg-[#FF6600]/90 text-white text-lg font-bold shadow-lg shadow-orange-200"
            >
              경기 개설하기
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
