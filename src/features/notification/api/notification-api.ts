/**
 * Notification Service
 * 알림 관련 DB 접근을 캡슐화
 */
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/shared/types/database.types';
import { handleSupabaseError } from '@/shared/lib/errors';

export class NotificationService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * 사용자의 알림 목록 조회 (최신순)
   */
  async getNotifications(userId: string, limit: number = 50) {
    const { data, error } = await this.supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) handleSupabaseError(error, '알림 목록');
    return data!;
  }

  /**
   * 읽지 않은 알림 개수 조회
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) handleSupabaseError(error, '읽지 않은 알림 수');
    return count ?? 0;
  }

  /**
   * 단일 알림 읽음 처리
   */
  async markAsRead(notificationId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) handleSupabaseError(error, '알림 읽음 처리');
  }

  /**
   * 모든 알림 읽음 처리
   */
  async markAllAsRead(userId: string) {
    const { error } = await this.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) handleSupabaseError(error, '전체 알림 읽음 처리');
  }
}

/**
 * NotificationService 팩토리 함수
 */
export function createNotificationService(supabase: SupabaseClient<Database>) {
  return new NotificationService(supabase);
}
