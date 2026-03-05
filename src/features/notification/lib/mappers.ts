import type { NotificationTypeValue } from '@/shared/config/match-constants';
import {
  NOTIFICATION_TYPE_DESCRIPTIONS,
  NOTIFICATION_TYPE_LABELS,
} from '@/shared/config/match-constants';
import type { NotificationEntity, NotificationListItemDTO, UnreadMatchNotificationDTO } from '../model/types';

const HOST_NOTIFICATION_TYPES: ReadonlySet<NotificationTypeValue> = new Set([
  'NEW_APPLICATION',
  'GUEST_CANCELED',
  'GUEST_PAYMENT_CONFIRMED',
]);

interface NotificationMatchRouteInfo {
  publicId: string;
  managementType: 'guest_recruitment' | 'team_exercise' | 'tournament';
  teamCode?: string;
}

function resolveTargetPath(
  notification: NotificationEntity,
  matchRouteInfo?: NotificationMatchRouteInfo
): string | null {
  if (!notification.matchId) {
    return null;
  }

  const pathId = matchRouteInfo?.publicId ?? notification.matchId;
  const isTeamExercise = matchRouteInfo?.managementType === 'team_exercise';
  const teamCode = matchRouteInfo?.teamCode;

  if (notification.type === 'APPLICATION_CANCELED_FRAUDULENT_PAYMENT') {
    return '/chat';
  }

  if (HOST_NOTIFICATION_TYPES.has(notification.type)) {
    if (isTeamExercise && teamCode) {
      return `/team/${teamCode}/matches/${pathId}/manage`;
    }
    return `/matches/${pathId}/manage`;
  }

  if (isTeamExercise && teamCode) {
    return `/team/${teamCode}/matches/${pathId}`;
  }

  return `/matches/${pathId}`;
}

export function toNotificationListItemDTO(
  notification: NotificationEntity,
  announcementMessage?: string,
  matchRouteInfo?: NotificationMatchRouteInfo
): NotificationListItemDTO {
  const description = announcementMessage ?? NOTIFICATION_TYPE_DESCRIPTIONS[notification.type];

  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    referenceId: notification.referenceId,
    referenceType: notification.referenceType,
    matchId: notification.matchId,
    actorId: notification.actorId,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    title: NOTIFICATION_TYPE_LABELS[notification.type],
    description,
    ...(announcementMessage ? { announcementMessage } : {}),
    targetPath: resolveTargetPath(notification, matchRouteInfo),
  };
}

export function toUnreadMatchNotificationDTO(
  notification: NotificationEntity
): UnreadMatchNotificationDTO | null {
  if (!notification.matchId) {
    return null;
  }

  return {
    id: notification.id,
    type: notification.type,
    matchId: notification.matchId,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  };
}
