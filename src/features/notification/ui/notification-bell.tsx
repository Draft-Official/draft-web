'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuth } from '@/shared/session';
import { cn } from '@/shared/lib/utils';
import { useMediaQuery } from '@/shared/lib/hooks/use-media-query';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/shadcn/popover';
import { Sheet, SheetContent, SheetTrigger } from '@/shared/ui/shadcn/sheet';
import { useUnreadNotifications } from '../api/queries';
import { NotificationPanel } from './notification-panel';

interface NotificationBellProps {
  className?: string;
  mode?: 'link' | 'panel';
}

export function NotificationBell({
  className,
  mode = 'link',
}: NotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const { user } = useAuth();
  const { data: unreadNotifications } = useUnreadNotifications(user?.id);
  const unreadCount = unreadNotifications?.length ?? 0;

  const bellButtonClassName = cn(
    'relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors',
    className
  );

  const indicator = !!unreadCount && unreadCount > 0 && (
    <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-primary rounded-full leading-none">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  );

  if (mode === 'panel') {
    const bellButton = (
      <button type="button" className={bellButtonClassName} aria-label="알림 패널 열기">
        <Bell className="w-6 h-6 text-slate-700" strokeWidth={2} />
        {indicator}
      </button>
    );

    if (!isDesktop) {
      return (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            {bellButton}
          </SheetTrigger>
          <SheetContent
            side="right"
            showCloseButton={false}
            className="w-full max-w-none p-0 gap-0 border-l border-slate-200"
          >
            <NotificationPanel
              onSettingsClick={() => {
                setOpen(false);
                router.push('/my');
              }}
            />
          </SheetContent>
        </Sheet>
      );
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
            onSettingsClick={() => {
              setOpen(false);
              router.push('/my');
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
      <Bell className="w-6 h-6 text-slate-700" strokeWidth={2} />
      {indicator}
    </Link>
  );
}
