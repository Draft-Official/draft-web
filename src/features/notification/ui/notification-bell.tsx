'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/shared/session';
import { cn } from '@/shared/lib/utils';
import { useMediaQuery } from '@/shared/lib/hooks/use-media-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/shared/ui/shadcn/sheet';
import { useUnreadNotifications } from '../api/queries';
import { useNotificationRealtime } from '../lib/use-notification-realtime';
import { NotificationPanel } from './notification-panel';

interface NotificationBellProps {
  className?: string;
  mode?: 'link' | 'panel';
  desktopPresentation?: 'popover' | 'left-sheet' | 'right-sheet';
  variant?: 'icon' | 'sidebar';
  compact?: boolean;
}

export function NotificationBell({
  className,
  mode = 'link',
  desktopPresentation = 'popover',
  variant = 'icon',
  compact = false,
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { user } = useAuth();
  const { data: unreadNotifications } = useUnreadNotifications(user?.id);
  const unreadCount = unreadNotifications?.length ?? 0;
  useNotificationRealtime();

  const bellButtonClassName = cn(
    variant === 'icon' &&
      'relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors',
    variant === 'sidebar' &&
      'relative flex w-full rounded-xl text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900',
    variant === 'sidebar' &&
      (compact
        ? 'items-center justify-center px-2 py-3'
        : 'items-center gap-4 px-4 py-3 text-lg font-medium'),
    className
  );

  const iconClassName = cn(
    variant === 'sidebar' ? (compact ? 'w-6 h-6' : 'w-7 h-7') : 'w-6 h-6 text-slate-700'
  );

  const indicator =
    !!unreadCount &&
    unreadCount > 0 &&
    (variant === 'sidebar' && !compact ? (
      <span className="ml-auto inline-flex min-w-[20px] h-5 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary px-1.5 text-xs font-bold leading-none text-white">
        {unreadCount > 99 ? '99+' : unreadCount}
      </span>
    ) : (
      <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
    ));

  if (mode === 'panel') {
    const bellButton = (
      <button type="button" className={bellButtonClassName} aria-label="알림 패널 열기">
        <div className="relative">
          <Bell className={iconClassName} strokeWidth={2} />
          {(variant === 'icon' || compact) && indicator}
        </div>
        {variant === 'sidebar' && !compact && (
          <span className="leading-none">알림</span>
        )}
        {variant === 'sidebar' && !compact && indicator}
      </button>
    );

    const renderSheet = (side: 'left' | 'right', fullWidth: boolean) => (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          {bellButton}
        </SheetTrigger>
        <SheetContent
          side={side}
          showCloseButton={false}
          className={cn(
            fullWidth ? "w-full max-w-none" : "w-[420px] max-w-[calc(100vw-24px)]",
            "p-0 gap-0",
            side === 'left' ? "border-r border-slate-200" : "border-l border-slate-200"
          )}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>알림</SheetTitle>
          </SheetHeader>
          <NotificationPanel
            mode="sheet"
            onCloseClick={() => {
              setOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>
    );

    if (!isDesktop) {
      return renderSheet('right', true);
    }

    if (desktopPresentation === 'left-sheet') {
      return renderSheet('left', false);
    }

    if (desktopPresentation === 'right-sheet') {
      return renderSheet('right', false);
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          {bellButton}
        </PopoverTrigger>
        <PopoverContent
          align="end"
          sideOffset={12}
          className="w-[420px] max-w-[calc(100vw-24px)] rounded-2xl border border-slate-200 bg-white p-0 gap-0 shadow-2xl"
        >
          <NotificationPanel
            mode="popover"
            onCloseClick={() => {
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Link
      href="/notifications"
      className={bellButtonClassName}
      aria-label="알림"
    >
      <div className="relative">
        <Bell className={iconClassName} strokeWidth={2} />
        {(variant === 'icon' || compact) && indicator}
      </div>
      {variant === 'sidebar' && !compact && (
        <span className="leading-none">알림</span>
      )}
      {variant === 'sidebar' && !compact && indicator}
    </Link>
  );
}
