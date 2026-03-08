-- 허위 송금 운영진 알림 타입 예약
-- 실제 발송 로직은 운영진 페이지 구현 시 추가
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'ADMIN_FRAUDULENT_PAYMENT_REPORT';
