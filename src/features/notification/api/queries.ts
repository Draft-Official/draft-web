/**
 * Notification Query Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import type { Database } from '@/shared/types/database.types';
import { createNotificationService, notificationRowToEntity } from '@/entities/notification';
import { toNotificationListItemDTO, toUnreadMatchNotificationDTO } from '../lib';
import type { NotificationListItemDTO, UnreadMatchNotificationDTO } from '../model/types';
import { notificationKeys } from './keys';

/**
 * 알림 목록 조회
 */
export function useNotifications(userId: string | undefined) {
  return useQuery({
    queryKey: notificationKeys.list(userId ?? ''),
    queryFn: async (): Promise<NotificationListItemDTO[]> => {
      const supabase = getSupabaseBrowserClient();
      const service = createNotificationService(supabase);
      const rows = await service.getNotifications(userId!);
      const notifications = rows.map(notificationRowToEntity);

      // HOST_ANNOUNCEMENT 알림에 공지 메시지 첨부
      const announcementIds = notifications
        .filter((n) => n.type === 'HOST_ANNOUNCEMENT' && n.referenceType === 'ANNOUNCEMENT')
        .map((n) => n.referenceId);

      const messageMap = new Map<string, string>();
      if (announcementIds.length > 0) {
        const { data: announcements } = await supabase
          .from('announcements')
          .select('id, message')
          .in('id', announcementIds);

        if (announcements) {
          (announcements as Pick<Database['public']['Tables']['announcements']['Row'], 'id' | 'message'>[])
            .forEach((announcement) => {
              messageMap.set(announcement.id, announcement.message);
            });
        }
      }

      return notifications.map((notification) => {
        const announcementMessage = messageMap.get(notification.referenceId);
        return toNotificationListItemDTO(notification, announcementMessage);
      });
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
    queryFn: async (): Promise<UnreadMatchNotificationDTO[]> => {
      const supabase = getSupabaseBrowserClient();
      const service = createNotificationService(supabase);
      const rows = await service.getUnreadNotifications(userId!);

      return rows
        .map(notificationRowToEntity)
        .map(toUnreadMatchNotificationDTO)
        .filter((notification): notification is UnreadMatchNotificationDTO => notification !== null);
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
