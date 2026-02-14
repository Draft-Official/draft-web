import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/session';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createSettingsService } from './settings-api';
import { settingsKeys } from './keys';
import type { UserSettings } from '@/shared/types/database.types';

type NotificationField = 'notify_application' | 'notify_match' | 'notify_payment';

export function useUpdateNotificationSetting() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  return useMutation({
    mutationFn: async ({ field, value }: { field: NotificationField; value: boolean }) => {
      const supabase = getSupabaseBrowserClient();
      const service = createSettingsService(supabase);
      return service.upsertUserSettings(userId!, { [field]: value });
    },
    onMutate: async ({ field, value }) => {
      const queryKey = settingsKeys.byUser(userId!);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<UserSettings>(queryKey);

      queryClient.setQueryData<UserSettings>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, [field]: value };
      });

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(settingsKeys.byUser(userId!), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.byUser(userId!) });
    },
  });
}
