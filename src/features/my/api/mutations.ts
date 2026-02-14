import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/session';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createSettingsService } from './settings-api';
import { settingsKeys } from './keys';
import { myNotificationUpdateToUserSettingsUpdate } from '../lib';
import type { MyNotificationSettingField, MyNotificationSettingsDTO } from '../model/types';

export function useUpdateNotificationSetting() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  return useMutation({
    mutationFn: async ({
      field,
      value,
    }: {
      field: MyNotificationSettingField;
      value: boolean;
    }) => {
      const supabase = getSupabaseBrowserClient();
      const service = createSettingsService(supabase);
      return service.upsertUserSettings(
        userId!,
        myNotificationUpdateToUserSettingsUpdate({ field, value })
      );
    },
    onMutate: async ({ field, value }) => {
      const queryKey = settingsKeys.byUser(userId!);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<MyNotificationSettingsDTO>(queryKey);

      queryClient.setQueryData<MyNotificationSettingsDTO>(queryKey, (old) => {
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
