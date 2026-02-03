import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, UserSettings, UserSettingsUpdate } from '@/shared/types/database.types';
import { handleSupabaseError } from '@/shared/lib/errors';

export class SettingsService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async getUserSettings(userId: string): Promise<UserSettings | null> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // PGRST116 = row not found → 설정이 아직 없음
      if (error.code === 'PGRST116') return null;
      handleSupabaseError(error, '알림 설정');
    }
    return data;
  }

  async upsertUserSettings(
    userId: string,
    updates: Omit<UserSettingsUpdate, 'user_id'>
  ): Promise<UserSettings> {
    const { data, error } = await this.supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...updates })
      .select()
      .single();

    if (error) handleSupabaseError(error, '알림 설정');
    return data!;
  }
}

export function createSettingsService(supabase: SupabaseClient<Database>) {
  return new SettingsService(supabase);
}
