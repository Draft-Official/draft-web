'use client';

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
      <div className="flex items-center justify-between px-(--dimension-spacing-x-global-gutter) h-(--dimension-x14) w-full bg-white">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          게스트 모집
        </h1>
        <div className="flex items-center gap-(--dimension-x3)">
          {notificationSlot}
        </div>
      </div>
    </div>
  );
}
