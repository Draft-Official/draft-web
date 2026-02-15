'use client';

import { useAuth } from '@/shared/session';
import { useNotifications } from '../api/queries';
import { useMarkAllNotificationsAsRead } from '../api/mutations';
import { NotificationItem } from './notification-item';

export function NotificationList() {
  const { user } = useAuth();
  const { data: notifications, isLoading } = useNotifications(user?.id);
  const markAllAsRead = useMarkAllNotificationsAsRead();

  const hasUnread = notifications?.some((n) => !n.isRead);

  function handleMarkAllAsRead() {
    if (user?.id) {
      markAllAsRead.mutate({ userId: user.id });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <p className="text-lg font-medium">알림이 없습니다</p>
        <p className="text-sm mt-1">새로운 소식이 생기면 알려드릴게요</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
        <h2 className="text-sm font-medium text-slate-500">
          전체 {notifications.length}건
        </h2>
        {hasUnread && (
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
            className="text-sm text-[#FF6600] font-medium hover:text-[#FF6600]/80 disabled:opacity-50"
          >
            모두 읽음
          </button>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-slate-100">
        {notifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
      </div>
    </div>
  );
}
