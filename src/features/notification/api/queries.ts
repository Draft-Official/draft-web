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

      const matchRouteInfoMap = new Map<string, {
        publicId: string;
        managementType: 'guest_recruitment' | 'team_exercise' | 'tournament';
        teamCode?: string;
      }>();
      const matchIds = [...new Set(notifications
        .map((notification) => notification.matchId)
        .filter((matchId): matchId is string => !!matchId))];

      if (matchIds.length > 0) {
        const { data: matches } = await supabase
          .from('matches')
          .select('id, short_id, match_type, team:teams!team_id(code)')
          .in('id', matchIds);

        if (matches) {
          (matches as Array<
            Pick<Database['public']['Tables']['matches']['Row'], 'id' | 'short_id' | 'match_type'> & {
              team?: { code?: string | null } | null;
            }
          >)
            .forEach((match) => {
              const managementType =
                match.match_type === 'TEAM_MATCH'
                  ? 'team_exercise'
                  : match.match_type === 'TOURNAMENT' || match.match_type === 'TOURNAMENT_MATCH'
                    ? 'tournament'
                    : 'guest_recruitment';

              matchRouteInfoMap.set(match.id, {
                publicId: match.short_id,
                managementType,
                teamCode: match.team?.code ?? undefined,
              });
            });
        }
      }

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
        const matchRouteInfo = notification.matchId
          ? matchRouteInfoMap.get(notification.matchId)
          : undefined;
        return toNotificationListItemDTO(notification, announcementMessage, matchRouteInfo);
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
