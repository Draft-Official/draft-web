import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createSettingsService } from './settings-api';
import { settingsKeys } from './keys';
import type { UserSettings } from '@/shared/types/database.types';

const DEFAULT_SETTINGS: Omit<UserSettings, 'user_id' | 'created_at' | 'updated_at'> = {
  notify_announcement: true,
  notify_application: true,
  notify_match: true,
  notify_payment: true,
};

export function useUserSettings() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: settingsKeys.byUser(userId!),
    queryFn: async () => {
      const supabase = getSupabaseBrowserClient();
      const service = createSettingsService(supabase);
      const settings = await service.getUserSettings(userId!);
      if (!settings) {
        return {
          user_id: userId!,
          ...DEFAULT_SETTINGS,
          created_at: '',
          updated_at: '',
        } as UserSettings;
      }
      return settings;
    },
    enabled: !!userId,
  });
}
