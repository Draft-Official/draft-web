/**
 * Notification Mapper
 * DB row를 entity 타입으로 변환
 */

import type { Notification as NotificationRow } from '@/shared/types/database.types';
import type { NotificationTypeValue } from '@/shared/config/match-constants';
import type { Notification as NotificationEntity, NotificationReferenceType } from '../model/types';

/**
 * Notification DB row를 entity 타입으로 변환
 */
export function notificationRowToEntity(row: NotificationRow): NotificationEntity {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as NotificationTypeValue,
    referenceId: row.reference_id,
    referenceType: row.reference_type as NotificationReferenceType,
    matchId: row.match_id,
    actorId: row.actor_id,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

