'use client';

import Link from 'next/link';
import { Bell } from 'lucide-react';
import { useAuth } from '@/shared/session';
import { useUnreadNotificationCount } from '../api/queries';

export function NotificationBell() {
  const { user } = useAuth();
  const { data: unreadCount } = useUnreadNotificationCount(user?.id);

  return (
    <Link
      href="/notifications"
      className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-slate-100 transition-colors"
      aria-label="알림"
    >
      <Bell className="w-6 h-6 text-slate-700" strokeWidth={2} />
      {!!unreadCount && unreadCount > 0 && (
        <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[11px] font-bold text-white bg-primary rounded-full leading-none">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
