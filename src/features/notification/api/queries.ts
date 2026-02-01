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
      return rows.map(notificationRowToClient);
    },
    enabled: !!userId,
    staleTime: 30_000,
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
