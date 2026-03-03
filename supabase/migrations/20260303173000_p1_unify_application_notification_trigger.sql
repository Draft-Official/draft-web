-- ============================================
-- P1: notify_on_application_change 단일화
-- - TEAM_VOTE 업데이트 알림 제외
-- - user_settings(should_notify) 반영
-- - payment_notified_at 가드 유지
-- ============================================

BEGIN;

-- should_notify 최종본 고정 (announcement 포함)
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
  ELSIF p_setting = 'notify_announcement' THEN
    SELECT notify_announcement INTO v_enabled FROM user_settings WHERE user_id = p_user_id;
  END IF;

  RETURN COALESCE(v_enabled, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION notify_on_application_change()
RETURNS TRIGGER AS $$
DECLARE
  v_match_id UUID;
  v_host_id UUID;
  v_guest_id UUID;
  v_notification_type notification_type;
BEGIN
  -- TEAM_VOTE 상태 변경은 게스트 모집 알림 대상이 아님
  IF COALESCE(NEW.source::TEXT, 'GUEST_APPLICATION') = 'TEAM_VOTE'
     OR COALESCE(OLD.source::TEXT, 'GUEST_APPLICATION') = 'TEAM_VOTE' THEN
    RETURN NEW;
  END IF;

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
  -- 게스트가 송금 알림을 보낸 경우(payment_notified_at IS NOT NULL)만 발송
  IF (OLD.status IS DISTINCT FROM 'CONFIRMED'
      AND NEW.status = 'CONFIRMED'
      AND NEW.payment_notified_at IS NOT NULL) THEN
    IF should_notify(v_host_id, 'notify_payment') THEN
      INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
      VALUES (v_host_id, 'GUEST_PAYMENT_CONFIRMED', NEW.id, 'APPLICATION', v_match_id, v_guest_id);
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 바인딩 재확인: 동일 트리거명으로 재생성
DROP TRIGGER IF EXISTS trg_notify_on_application_change ON applications;

CREATE TRIGGER trg_notify_on_application_change
  AFTER UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_application_change();

COMMIT;
