import {
  AlertTriangle,
  Banknote,
  Bell,
  Ban,
  CheckCircle,
  Clock,
  Handshake,
  Megaphone,
  UserMinus,
  UserPlus,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import {
  NOTIFICATION_TYPE_DESCRIPTIONS,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_VALUES,
  type NotificationTypeValue,
} from '@/shared/config/match-constants';

export interface NotificationPresentation {
  title: string;
  description: string;
  Icon: LucideIcon;
}

const NOTIFICATION_ICONS: Record<NotificationTypeValue, LucideIcon> = {
  APPLICATION_APPROVED: CheckCircle,
  APPLICATION_REJECTED: XCircle,
  APPLICATION_CANCELED_USER_REQUEST: Handshake,
  APPLICATION_CANCELED_PAYMENT_TIMEOUT: Clock,
  APPLICATION_CANCELED_FRAUDULENT_PAYMENT: AlertTriangle,
  MATCH_CANCELED: Ban,
  NEW_APPLICATION: UserPlus,
  GUEST_CANCELED: UserMinus,
  GUEST_PAYMENT_CONFIRMED: Banknote,
  HOST_ANNOUNCEMENT: Megaphone,
};

const SUPPORTED_NOTIFICATION_TYPES = new Set<string>(NOTIFICATION_TYPE_VALUES);

const FALLBACK_PRESENTATION: NotificationPresentation = {
  title: '알림',
  description: '새로운 알림이 도착했습니다.',
  Icon: Bell,
};

export function isNotificationTypeSupported(type: string): type is NotificationTypeValue {
  return SUPPORTED_NOTIFICATION_TYPES.has(type);
}

export function getNotificationPresentation(type: string): NotificationPresentation {
  if (!isNotificationTypeSupported(type)) {
    return FALLBACK_PRESENTATION;
  }

  return {
    title: NOTIFICATION_TYPE_LABELS[type],
    description: NOTIFICATION_TYPE_DESCRIPTIONS[type],
    Icon: NOTIFICATION_ICONS[type],
  };
}
