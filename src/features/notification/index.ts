// ============================================
// Model Types
// ============================================
export type { ClientNotification } from '@/shared/types/notification.types';

// ============================================
// API & Queries
// ============================================
export { notificationKeys } from './api/keys';
export {
  useNotifications,
  useUnreadNotifications,
  useUnreadNotificationCount,
} from './api/queries';
export {
  useMarkNotificationAsRead,
  useMarkNotificationsAsReadByMatch,
  useMarkAllNotificationsAsRead,
} from './api/mutations';
export { NotificationService, createNotificationService } from './api/notification-api';
export { notificationRowToClient } from './api/notification-mapper';

// ============================================
// Utilities
// ============================================
export { formatRelativeTime } from './lib/format-time';

// ============================================
// UI Components
// ============================================
export { NotificationBell } from './ui/notification-bell';
export { NotificationItem } from './ui/notification-item';
export { NotificationList } from './ui/notification-list';
