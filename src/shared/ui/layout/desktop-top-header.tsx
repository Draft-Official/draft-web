'use client';

import Link from 'next/link';
import { CreateMenuButton } from '@/features/create';
import { NotificationBell } from '@/features/notification/ui/notification-bell';
import { cn } from '@/shared/lib/utils';

interface DesktopTopHeaderProps {
  compact?: boolean;
  isSplitMode?: boolean;
}

export function DesktopTopHeader({
  compact = false,
  isSplitMode = false,
}: DesktopTopHeaderProps) {
  return (
    <header className="hidden lg:block fixed inset-x-0 top-0 z-40 h-14 bg-white">
      <div className="flex h-full">
        <div
          className={cn(
            'shrink-0 flex items-center px-6 transition-[width] duration-300 ease-in-out',
            compact
              ? 'w-(--layout-sidebar-width-compact)'
              : 'w-(--layout-sidebar-width)'
          )}
        >
          <Link href="/" className="text-2xl font-black italic tracking-tighter text-slate-900">
            {compact ? 'D.' : 'DRAFT.'}
          </Link>
        </div>

        <div className="flex-1 min-w-0 flex justify-center">
          <div
            className={cn(
              'app-content-container h-full px-6 flex items-center justify-end transition-[max-width] duration-300 ease-in-out',
              isSplitMode && 'app-content-container--split'
            )}
          >
            <div className="flex items-center gap-2">
              <CreateMenuButton />
              <NotificationBell mode="panel" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
