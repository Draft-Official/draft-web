-- ============================================
-- Notification System Migration
-- notifications 테이블, enum, RLS, 트리거
-- ============================================

-- 1. notification_type enum 생성
CREATE TYPE notification_type AS ENUM (
  'APPLICATION_APPROVED',
  'APPLICATION_REJECTED',
  'APPLICATION_CANCELED_USER_REQUEST',
  'APPLICATION_CANCELED_PAYMENT_TIMEOUT',
  'APPLICATION_CANCELED_FRAUDULENT_PAYMENT',
  'MATCH_CANCELED',
  'NEW_APPLICATION',
  'GUEST_CANCELED',
  'GUEST_PAYMENT_CONFIRMED'
);

-- 2. notifications 테이블 생성
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  reference_id UUID NOT NULL,
  reference_type TEXT NOT NULL CHECK (reference_type IN ('APPLICATION', 'MATCH')),
  match_id UUID REFERENCES matches(id) ON DELETE SET NULL,
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. 인덱스
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- 4. RLS 정책
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 자기 알림만 조회 가능
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- 자기 알림만 읽음 처리 가능
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 트리거 함수에서 INSERT 허용 (service_role 또는 trigger context)
CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE);

-- ============================================
-- Trigger 1: 신청 상태 변경 시 알림
-- ============================================

CREATE OR REPLACE FUNCTION notify_on_application_change()
RETURNS TRIGGER AS $$
DECLARE
  v_match_id UUID;
  v_host_id UUID;
  v_guest_id UUID;
  v_notification_type notification_type;
BEGIN
  v_match_id := NEW.match_id;
  v_guest_id := NEW.user_id;

  -- 호스트 ID 조회
  SELECT host_id INTO v_host_id
  FROM matches
  WHERE id = v_match_id;

  -- 1. 승인: approved_at이 NULL에서 SET으로 변경
  IF (OLD.approved_at IS NULL AND NEW.approved_at IS NOT NULL) THEN
    INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
    VALUES (v_guest_id, 'APPLICATION_APPROVED', NEW.id, 'APPLICATION', v_match_id, v_host_id);
    RETURN NEW;
  END IF;

  -- 2. 거절: status → REJECTED
  IF (OLD.status IS DISTINCT FROM 'REJECTED' AND NEW.status = 'REJECTED') THEN
    INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
    VALUES (v_guest_id, 'APPLICATION_REJECTED', NEW.id, 'APPLICATION', v_match_id, v_host_id);
    RETURN NEW;
  END IF;

  -- 3. 취소: status → CANCELED
  IF (OLD.status IS DISTINCT FROM 'CANCELED' AND NEW.status = 'CANCELED') THEN
    -- 호스트가 취소한 경우 → 게스트에게 알림
    IF (NEW.canceled_by = 'HOST') THEN
      -- cancel_type에 따라 알림 유형 분기
      IF (NEW.cancel_type = 'USER_REQUEST') THEN
        v_notification_type := 'APPLICATION_CANCELED_USER_REQUEST';
      ELSIF (NEW.cancel_type = 'PAYMENT_TIMEOUT') THEN
        v_notification_type := 'APPLICATION_CANCELED_PAYMENT_TIMEOUT';
      ELSIF (NEW.cancel_type = 'FRAUDULENT_PAYMENT') THEN
        v_notification_type := 'APPLICATION_CANCELED_FRAUDULENT_PAYMENT';
      ELSE
        v_notification_type := 'APPLICATION_CANCELED_USER_REQUEST';
      END IF;

      INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
      VALUES (v_guest_id, v_notification_type, NEW.id, 'APPLICATION', v_match_id, v_host_id);
      RETURN NEW;
    END IF;

    -- 게스트가 취소한 경우 → 호스트에게 알림
    IF (NEW.canceled_by = 'GUEST') THEN
      INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
      VALUES (v_host_id, 'GUEST_CANCELED', NEW.id, 'APPLICATION', v_match_id, v_guest_id);
      RETURN NEW;
    END IF;
  END IF;

  -- 4. 송금 확인: status → CONFIRMED
  IF (OLD.status IS DISTINCT FROM 'CONFIRMED' AND NEW.status = 'CONFIRMED') THEN
    INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
    VALUES (v_host_id, 'GUEST_PAYMENT_CONFIRMED', NEW.id, 'APPLICATION', v_match_id, v_guest_id);
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_on_application_change
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_application_change();

-- ============================================
-- Trigger 2: 새 신청 시 알림
-- ============================================

CREATE OR REPLACE FUNCTION notify_on_new_application()
RETURNS TRIGGER AS $$
DECLARE
  v_host_id UUID;
BEGIN
  -- 호스트 ID 조회
  SELECT host_id INTO v_host_id
  FROM matches
  WHERE id = NEW.match_id;

  INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
  VALUES (v_host_id, 'NEW_APPLICATION', NEW.id, 'APPLICATION', NEW.match_id, NEW.user_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_on_new_application
  AFTER INSERT ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_application();

-- ============================================
-- Trigger 3: 경기 취소 시 신청자 전원에게 알림
-- ============================================

CREATE OR REPLACE FUNCTION notify_on_match_canceled()
RETURNS TRIGGER AS $$
DECLARE
  v_app RECORD;
BEGIN
  -- 매치 상태가 CANCELED로 변경된 경우
  IF (OLD.status IS DISTINCT FROM 'CANCELED' AND NEW.status = 'CANCELED') THEN
    -- PENDING, PAYMENT_PENDING, CONFIRMED 상태의 신청자 전원에게 알림
    FOR v_app IN
      SELECT id, user_id
      FROM applications
      WHERE match_id = NEW.id
        AND status IN ('PENDING', 'PAYMENT_PENDING', 'CONFIRMED')
    LOOP
      INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
      VALUES (v_app.user_id, 'MATCH_CANCELED', v_app.id, 'APPLICATION', NEW.id, NEW.host_id);
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_on_match_canceled
  AFTER UPDATE ON matches
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_match_canceled();
