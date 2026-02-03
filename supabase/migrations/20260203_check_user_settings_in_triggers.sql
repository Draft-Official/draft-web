-- ============================================
-- 알림 트리거에 user_settings 체크 추가
-- 설정이 꺼져 있으면 알림을 생성하지 않음
-- 설정 행이 없으면 기본값 true (알림 발송)
-- ============================================

-- 헬퍼 함수: 알림 설정 확인
CREATE OR REPLACE FUNCTION should_notify(p_user_id UUID, p_setting TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_enabled BOOLEAN;
BEGIN
  IF p_setting = 'notify_application' THEN
    SELECT notify_application INTO v_enabled FROM user_settings WHERE user_id = p_user_id;
  ELSIF p_setting = 'notify_match' THEN
    SELECT notify_match INTO v_enabled FROM user_settings WHERE user_id = p_user_id;
  ELSIF p_setting = 'notify_payment' THEN
    SELECT notify_payment INTO v_enabled FROM user_settings WHERE user_id = p_user_id;
  END IF;

  -- 설정 행이 없으면 기본값 true
  RETURN COALESCE(v_enabled, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger 1: 신청 상태 변경 시 알림 (재정의)
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
    IF should_notify(v_guest_id, 'notify_application') THEN
      INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
      VALUES (v_guest_id, 'APPLICATION_APPROVED', NEW.id, 'APPLICATION', v_match_id, v_host_id);
    END IF;
    RETURN NEW;
  END IF;

  -- 2. 거절: status → REJECTED
  IF (OLD.status IS DISTINCT FROM 'REJECTED' AND NEW.status = 'REJECTED') THEN
    IF should_notify(v_guest_id, 'notify_application') THEN
      INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
      VALUES (v_guest_id, 'APPLICATION_REJECTED', NEW.id, 'APPLICATION', v_match_id, v_host_id);
    END IF;
    RETURN NEW;
  END IF;

  -- 3. 취소: status → CANCELED
  IF (OLD.status IS DISTINCT FROM 'CANCELED' AND NEW.status = 'CANCELED') THEN
    -- 호스트가 취소한 경우 → 게스트에게 알림
    IF (NEW.canceled_by = 'HOST') THEN
      IF (NEW.cancel_type = 'USER_REQUEST') THEN
        v_notification_type := 'APPLICATION_CANCELED_USER_REQUEST';
      ELSIF (NEW.cancel_type = 'PAYMENT_TIMEOUT') THEN
        v_notification_type := 'APPLICATION_CANCELED_PAYMENT_TIMEOUT';
      ELSIF (NEW.cancel_type = 'FRAUDULENT_PAYMENT') THEN
        v_notification_type := 'APPLICATION_CANCELED_FRAUDULENT_PAYMENT';
      ELSE
        v_notification_type := 'APPLICATION_CANCELED_USER_REQUEST';
      END IF;

      IF should_notify(v_guest_id, 'notify_application') THEN
        INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
        VALUES (v_guest_id, v_notification_type, NEW.id, 'APPLICATION', v_match_id, v_host_id);
      END IF;
      RETURN NEW;
    END IF;

    -- 게스트가 취소한 경우 → 호스트에게 알림
    IF (NEW.canceled_by = 'GUEST') THEN
      IF should_notify(v_host_id, 'notify_application') THEN
        INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
        VALUES (v_host_id, 'GUEST_CANCELED', NEW.id, 'APPLICATION', v_match_id, v_guest_id);
      END IF;
      RETURN NEW;
    END IF;
  END IF;

  -- 4. 송금 확인: status → CONFIRMED
  IF (OLD.status IS DISTINCT FROM 'CONFIRMED' AND NEW.status = 'CONFIRMED') THEN
    IF should_notify(v_host_id, 'notify_payment') THEN
      INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
      VALUES (v_host_id, 'GUEST_PAYMENT_CONFIRMED', NEW.id, 'APPLICATION', v_match_id, v_guest_id);
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger 2: 새 신청 시 알림 (재정의)
-- ============================================

CREATE OR REPLACE FUNCTION notify_on_new_application()
RETURNS TRIGGER AS $$
DECLARE
  v_host_id UUID;
BEGIN
  SELECT host_id INTO v_host_id
  FROM matches
  WHERE id = NEW.match_id;

  IF should_notify(v_host_id, 'notify_application') THEN
    INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
    VALUES (v_host_id, 'NEW_APPLICATION', NEW.id, 'APPLICATION', NEW.match_id, NEW.user_id);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Trigger 3: 경기 취소 시 신청자 전원 알림 (재정의)
-- ============================================

CREATE OR REPLACE FUNCTION notify_on_match_canceled()
RETURNS TRIGGER AS $$
DECLARE
  v_app RECORD;
BEGIN
  IF (OLD.status IS DISTINCT FROM 'CANCELED' AND NEW.status = 'CANCELED') THEN
    FOR v_app IN
      SELECT id, user_id
      FROM applications
      WHERE match_id = NEW.id
        AND status IN ('PENDING', 'PAYMENT_PENDING', 'CONFIRMED')
    LOOP
      IF should_notify(v_app.user_id, 'notify_match') THEN
        INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
        VALUES (v_app.user_id, 'MATCH_CANCELED', v_app.id, 'APPLICATION', NEW.id, NEW.host_id);
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
