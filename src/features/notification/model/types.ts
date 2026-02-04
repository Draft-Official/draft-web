import type { NotificationTypeValue } from '@/shared/config/constants';

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
