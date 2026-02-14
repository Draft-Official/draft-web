/**
 * Notification Entity 타입 정의
 * FSD entities layer - 도메인 모델 타입
 */

import type { NotificationTypeValue } from '@/shared/config/match-constants';

export type NotificationReferenceType = 'APPLICATION' | 'MATCH' | 'ANNOUNCEMENT';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationTypeValue;
  referenceId: string;
  referenceType: NotificationReferenceType;
  matchId: string | null;
  actorId: string | null;
  isRead: boolean;
  createdAt: string;
}

