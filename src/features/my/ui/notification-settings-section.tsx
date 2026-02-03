'use client';

import { useState } from 'react';
import { Card } from '@/shared/ui/base/card';
import { Switch } from '@/shared/ui/base/switch';

interface NotificationSetting {
  key: string;
  label: string;
}

const NOTIFICATION_SETTINGS: NotificationSetting[] = [
  { key: 'application', label: '신청 알림' },
  { key: 'match', label: '경기 알림' },
  { key: 'payment', label: '결제 알림' },
];

export function NotificationSettingsSection() {
  const [settings, setSettings] = useState<Record<string, boolean>>({
    application: true,
    match: true,
    payment: true,
  });

  const handleToggle = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-3">
      <h2 className="font-bold text-lg text-foreground">알림</h2>
      <Card className="p-0 overflow-hidden border-border">
        <div className="divide-y divide-border">
          {NOTIFICATION_SETTINGS.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4"
            >
              <span className="text-sm font-medium text-foreground">{label}</span>
              <Switch
                checked={settings[key]}
                onCheckedChange={() => handleToggle(key)}
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
