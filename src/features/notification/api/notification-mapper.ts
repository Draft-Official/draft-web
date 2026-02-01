/**
 * Notification Mapper
 * DB Row → ClientNotification 타입 변환
 */
import type { NotificationTypeValue } from '@/shared/config/constants';
import type { ClientNotification } from '../model/types';

interface NotificationRow {
  id: string;
  user_id: string;
  type: string;
  reference_id: string;
  reference_type: string;
  match_id: string | null;
  actor_id: string | null;
  is_read: boolean;
  created_at: string;
}

export function notificationRowToClient(row: NotificationRow): ClientNotification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as NotificationTypeValue,
    referenceId: row.reference_id,
    referenceType: row.reference_type as 'APPLICATION' | 'MATCH',
    matchId: row.match_id,
    actorId: row.actor_id,
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}
