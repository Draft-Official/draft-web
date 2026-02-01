'use client';

import { useRouter } from 'next/navigation';
import { cn } from '@/shared/lib/utils';
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_DESCRIPTIONS,
  NOTIFICATION_TYPE_ICONS,
} from '@/shared/config/constants';
import { useMarkNotificationAsRead } from '../api/mutations';
import { formatRelativeTime } from '../lib/format-time';
import type { ClientNotification } from '../model/types';

interface NotificationItemProps {
  notification: ClientNotification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const markAsRead = useMarkNotificationAsRead();

  const icon = NOTIFICATION_TYPE_ICONS[notification.type];
  const label = NOTIFICATION_TYPE_LABELS[notification.type];
  const description = NOTIFICATION_TYPE_DESCRIPTIONS[notification.type];

  function handleClick() {
    // 읽음 처리
    if (!notification.isRead) {
      markAsRead.mutate({ notificationId: notification.id });
    }

    // 네비게이션
    if (notification.matchId) {
      router.push(`/matches/${notification.matchId}`);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'w-full flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50',
        !notification.isRead && 'bg-orange-50/50'
      )}
    >
      {/* Icon */}
      <span className="flex-shrink-0 text-xl mt-0.5" aria-hidden>
        {icon}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm',
          !notification.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'
        )}>
          {label}
        </p>
        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">
          {description}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-[#FF6600] mt-2" />
      )}
    </button>
  );
}
