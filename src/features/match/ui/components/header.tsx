'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface HeaderProps {
  isHidden?: boolean;
  hasScrolled?: boolean;
  notificationSlot?: React.ReactNode;
}

export function Header({
  isHidden = false,
  hasScrolled = false,
  notificationSlot,
}: HeaderProps) {
  return (
    <div
      className={cn(
        'bg-white sticky top-0 z-20 border-b border-slate-100 transition-transform duration-300',
        isHidden && 'transform -translate-y-full'
      )}
      style={hasScrolled ? { boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)' } : {}}
    >
      <div className="flex items-center justify-between px-4 h-14 w-full bg-white">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          게스트 모집
        </h1>
        <div className="flex items-center gap-3">
          <Link
            href="/matches/create"
            className="lg:hidden px-3 py-1.5 bg-[#FF6600] text-white text-xs font-bold rounded-full shadow-sm hover:bg-[#FF6600]/90 active:scale-95 transition-all mr-1"
          >
            경기 개설하기
          </Link>
          <Search className="w-6 h-6 text-slate-900" />
          {notificationSlot}
        </div>
      </div>
    </div>
  );
}
