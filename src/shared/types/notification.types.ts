import type { NotificationTypeValue } from '@/shared/config/constants';

/**
 * 클라이언트 알림 타입
 * notification feature와 다른 feature 간 공유용
 */
export interface ClientNotification {
  id: string;
  userId: string;
  type: NotificationTypeValue;
  referenceId: string;
  referenceType: 'APPLICATION' | 'MATCH' | 'ANNOUNCEMENT';
  matchId: string | null;
  actorId: string | null;
  isRead: boolean;
  createdAt: string;
  announcementMessage?: string;
}
