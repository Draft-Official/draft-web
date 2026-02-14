// ============================================
// Model Types
// ============================================
export type {
  ClientNotification,
  NotificationEntity,
  NotificationListItemDTO,
  UnreadMatchNotificationDTO,
} from './model/types';

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

// ============================================
// Utilities
// ============================================
export {
  formatRelativeTime,
  toNotificationListItemDTO,
  toUnreadMatchNotificationDTO,
} from './lib';

// ============================================
// UI Components
// ============================================
export { NotificationBell } from './ui/notification-bell';
export { NotificationItem } from './ui/notification-item';
export { NotificationList } from './ui/notification-list';
