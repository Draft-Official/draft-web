/**
 * Notification Query Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createNotificationService } from './notification-api';
import { notificationRowToClient } from './notification-mapper';
import { notificationKeys } from './keys';

/**
 * 알림 목록 조회
 */
export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: notificationKeys.list(userId ?? ''),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const service = createNotificationService(supabase);
      const rows = await service.getNotifications(userId!);
      const notifications = rows.map(notificationRowToClient);

      // HOST_ANNOUNCEMENT 알림에 공지 메시지 첨부
      const announcementIds = notifications
        .filter((n) => n.type === 'HOST_ANNOUNCEMENT' && n.referenceType === 'ANNOUNCEMENT')
        .map((n) => n.referenceId);

      if (announcementIds.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: announcements } = await (supabase as any)
          .from('announcements')
          .select('id, message')
          .in('id', announcementIds);

        if (announcements) {
          const messageMap = new Map(
            announcements.map((a: { id: string; message: string }) => [a.id, a.message])
          );
          notifications.forEach((n) => {
            if (n.type === 'HOST_ANNOUNCEMENT' && messageMap.has(n.referenceId)) {
              n.announcementMessage = messageMap.get(n.referenceId) as string;
            }
          });
        }
      }

      return notifications;
    },
    enabled: !!userId,
    staleTime: 30_000,
  });
}

/**
 * 읽지 않은 알림 목록 조회 (match_id 기준, polling)
 */
export function useUnreadNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: notificationKeys.unread(userId ?? ''),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const service = createNotificationService(supabase);
      const rows = await service.getUnreadNotifications(userId!);
      return rows.map(notificationRowToClient);
    },
    enabled: !!userId,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

/**
 * 읽지 않은 알림 개수 조회 (polling)
 */
export function useUnreadNotificationCount(userId: string | undefined) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(userId ?? ''),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const service = createNotificationService(supabase);
      return service.getUnreadCount(userId!);
    },
    enabled: !!userId,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}
