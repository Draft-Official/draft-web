'use client';

import { Card } from '@/shared/ui/base/card';
import { Switch } from '@/shared/ui/base/switch';
import { useAuth } from '@/shared/session';
import { useUserSettings, useUpdateNotificationSetting } from '@/features/my';
import type { MyNotificationSettingField } from '../model/types';

interface NotificationSetting {
  field: MyNotificationSettingField;
  label: string;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  { field: 'notifyApplication', label: '신청 알림' },
  { field: 'notifyMatch', label: '경기 알림' },
  { field: 'notifyPayment', label: '결제 알림' },
];

export function NotificationSettingsSection() {
  const { user } = useAuth();
  const { data: settings, isLoading } = useUserSettings();
  const { mutate: updateSetting } = useUpdateNotificationSetting();

  if (!user) return null;

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-lg text-foreground">알림</h2>
      <Card className="p-0 overflow-hidden border-border">
        <div className="divide-y divide-border">
          {NOTIFICATION_SETTINGS.map(({ field, label }) => (
            <div
              key={field}
              className="flex items-center justify-between p-4"
            >
              <span className="text-sm font-medium text-foreground">{label}</span>
              <Switch
                checked={settings?.[field] ?? true}
                onCheckedChange={(checked) =>
                  updateSetting({ field, value: checked })
                }
                disabled={isLoading}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
