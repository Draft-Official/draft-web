import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/shared/session';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createSettingsService } from './settings-api';
import { settingsKeys } from './keys';
import { userSettingsToMyNotificationSettingsDTO } from '../lib';
import type { MyNotificationSettingsDTO } from '../model/types';

export function useUserSettings() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: settingsKeys.byUser(userId!),
    queryFn: async (): Promise<MyNotificationSettingsDTO> => {
      const supabase = getSupabaseBrowserClient();
      const service = createSettingsService(supabase);
      const settings = await service.getUserSettings(userId!);
      return userSettingsToMyNotificationSettingsDTO(settings);
    },
    enabled: !!userId,
  });
}
