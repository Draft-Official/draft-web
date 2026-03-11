import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/shared/session';
import { getSupabaseBrowserClient } from '@/shared/api/supabase/client';
import { createSettingsService } from './settings-api';
import { settingsKeys } from './keys';
import { rollbackSnapshot } from '@/shared/lib/query-cache-rollback';
import {
  beginOptimisticOperation,
  buildOptimisticResourceKey,
  finishOptimisticOperation,
  isLatestOptimisticOperation,
} from '@/shared/lib/optimistic/operation-tracker';
import { myNotificationUpdateToUserSettingsUpdate } from '../lib';
import type { MyNotificationSettingField, MyNotificationSettingsDTO } from '../model/types';

export function useUpdateNotificationSetting() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = user?.id;

  return useMutation({
    mutationKey: ['notification-setting'],
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
      const optimisticToken = beginOptimisticOperation(
        buildOptimisticResourceKey('notification-settings-user', userId ?? '')
      );
      const queryKey = settingsKeys.byUser(userId!);
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<MyNotificationSettingsDTO>(queryKey);

      queryClient.setQueryData<MyNotificationSettingsDTO>(queryKey, (old) => {
        if (!old) return old;
        return { ...old, [field]: value };
      });

      return { optimisticToken, queryKey, previous };
    },
    onError: (_err, _vars, context) => {
      if (!context) return;
      if (!isLatestOptimisticOperation(context.optimisticToken)) return;

      rollbackSnapshot(queryClient, context.queryKey, context.previous);
    },
    onSettled: (_data, _error, _variables, context) => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.byUser(userId!) });
      finishOptimisticOperation(context?.optimisticToken);
    },
  });
}
