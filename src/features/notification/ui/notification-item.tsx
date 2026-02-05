'use client';

import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Handshake,
  Clock,
  AlertTriangle,
  Ban,
  UserPlus,
  UserMinus,
  Banknote,
  Megaphone,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_DESCRIPTIONS,
  type NotificationTypeValue,
} from '@/shared/config/constants';
import { useMarkNotificationAsRead } from '../api/mutations';
import { formatRelativeTime } from '../lib/format-time';
import type { ClientNotification } from '../model/types';

const NOTIFICATION_ICONS: Record<NotificationTypeValue, LucideIcon> = {
  APPLICATION_APPROVED: CheckCircle,
  APPLICATION_REJECTED: XCircle,
  APPLICATION_CANCELED_USER_REQUEST: Handshake,
  APPLICATION_CANCELED_PAYMENT_TIMEOUT: Clock,
  APPLICATION_CANCELED_FRAUDULENT_PAYMENT: AlertTriangle,
  MATCH_CANCELED: Ban,
  NEW_APPLICATION: UserPlus,
  GUEST_CANCELED: UserMinus,
  GUEST_PAYMENT_CONFIRMED: Banknote,
  HOST_ANNOUNCEMENT: Megaphone,
};

interface NotificationItemProps {
  notification: ClientNotification;
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const router = useRouter();
  const markAsRead = useMarkNotificationAsRead();

  const Icon = NOTIFICATION_ICONS[notification.type];
  const label = NOTIFICATION_TYPE_LABELS[notification.type];
  const description = notification.announcementMessage
    ?? NOTIFICATION_TYPE_DESCRIPTIONS[notification.type];

  // 호스트가 받는 알림 → manage 페이지로 라우팅
  const HOST_NOTIFICATION_TYPES = new Set([
    'NEW_APPLICATION',
    'GUEST_CANCELED',
    'GUEST_PAYMENT_CONFIRMED',
  ]);

  function handleClick() {
    if (!notification.isRead) {
      markAsRead.mutate({ notificationId: notification.id });
    }

    if (notification.matchId) {
      const path = HOST_NOTIFICATION_TYPES.has(notification.type)
        ? `/matches/${notification.matchId}/manage`
        : `/matches/${notification.matchId}`;
      router.push(path);
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
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center mt-0.5">
        <Icon className="w-5 h-5 text-slate-600" aria-hidden />
      </div>

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
