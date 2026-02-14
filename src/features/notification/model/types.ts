import type { NotificationTypeValue } from '@/shared/config/match-constants';
import type { Notification as NotificationEntity, NotificationReferenceType } from '@/entities/notification';

export interface NotificationListItemDTO {
  id: string;
  userId: string;
  type: NotificationTypeValue;
  referenceId: string;
  referenceType: NotificationReferenceType;
  matchId: string | null;
  actorId: string | null;
  isRead: boolean;
  createdAt: string;
  announcementMessage?: string;
  targetPath?: string | null;
}

export interface UnreadMatchNotificationDTO {
  id: string;
  type: NotificationTypeValue;
  matchId: string;
  isRead: boolean;
  createdAt: string;
}

/**
 * @deprecated Use NotificationListItemDTO instead.
 */
export type ClientNotification = NotificationListItemDTO;

export type { NotificationEntity };
