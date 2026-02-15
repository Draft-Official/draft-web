'use client';

import { MatchManagementView } from '@/features/schedule/ui/match-management-view';
import { NotificationBell } from '@/features/notification/ui/notification-bell';

export default function SchedulePage() {
  return <MatchManagementView notificationSlot={<NotificationBell />} />;
}
