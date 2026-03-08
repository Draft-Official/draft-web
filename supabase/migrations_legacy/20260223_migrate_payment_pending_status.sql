-- Migration: PENDING + approved_at → PAYMENT_PENDING 상태 통일
-- approved_at 컬럼으로 판단하던 입금대기 상태를 PAYMENT_PENDING enum으로 통일

-- 1. 기존 데이터 마이그레이션
--    PENDING + approved_at IS NOT NULL → PAYMENT_PENDING
UPDATE applications
SET status = 'PAYMENT_PENDING'
WHERE status = 'PENDING'
  AND approved_at IS NOT NULL;

-- 2. 알림 트리거 업데이트
--    승인 감지 조건: approved_at NULL → NOT NULL  →  status → PAYMENT_PENDING
CREATE OR REPLACE FUNCTION notify_on_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_host_id UUID;
  v_guest_id UUID;
  v_match_id UUID;
  v_notification_type TEXT;
BEGIN
  v_match_id := NEW.match_id;
  v_guest_id := NEW.user_id;

  SELECT host_id INTO v_host_id
  FROM matches
  WHERE id = v_match_id;

  -- 1. 승인: status → PAYMENT_PENDING
  IF (OLD.status IS DISTINCT FROM 'PAYMENT_PENDING' AND NEW.status = 'PAYMENT_PENDING') THEN
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

    IF (NEW.canceled_by = 'GUEST') THEN
      IF should_notify(v_host_id, 'notify_application') THEN
        INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
        VALUES (v_host_id, 'GUEST_CANCELED', NEW.id, 'APPLICATION', v_match_id, v_guest_id);
      END IF;
      RETURN NEW;
    END IF;
  END IF;

  -- 4. 확정: status → CONFIRMED (호스트만 확정하므로 알림 불필요)
  IF (OLD.status IS DISTINCT FROM 'CONFIRMED' AND NEW.status = 'CONFIRMED') THEN
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
