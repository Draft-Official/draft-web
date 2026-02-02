/**
 * Notification Mutation Hooks
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createNotificationService } from './notification-api';
import { notificationKeys } from './keys';

/**
 * 단일 알림 읽음 처리
 */
export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ notificationId }: { notificationId: string }) => {
      const supabase = getSupabaseBrowserClient();
      const service = createNotificationService(supabase);
      return service.markAsRead(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * 특정 경기의 알림 일괄 읽음 처리
 */
export function useMarkNotificationsAsReadByMatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, matchId }: { userId: string; matchId: string }) => {
      const supabase = getSupabaseBrowserClient();
      const service = createNotificationService(supabase);
      return service.markAsReadByMatchId(userId, matchId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

/**
 * 모든 알림 읽음 처리
 */
export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const supabase = getSupabaseBrowserClient();
      const service = createNotificationService(supabase);
      return service.markAllAsRead(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
