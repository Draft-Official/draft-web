'use client';

import { Bell } from 'lucide-react';
import { useAuth } from '@/shared/session';
import { useNotifications } from '../api/queries';
import { useMarkAllNotificationsAsRead } from '../api/mutations';
import { NotificationItem } from './notification-item';
import { Spinner } from '@/shared/ui/shadcn/spinner';

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
        <Spinner className="w-6 h-6 text-muted-foreground" />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 py-24 text-center text-slate-500">
        <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center mb-8">
          <Bell className="w-12 h-12 text-slate-400" />
        </div>
        <p className="text-2xl font-semibold text-slate-700">여기에 알림이 표시됩니다.</p>
        <p className="text-base mt-4 leading-relaxed">
          새로운 모집/신청 소식이 생기면
          <br />
          바로 알려드릴게요.
        </p>
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
            className="text-sm text-muted-foreground font-medium hover:text-muted-foreground/80 disabled:opacity-50"
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
