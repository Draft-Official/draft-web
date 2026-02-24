-- Fix: 호스트가 직접 입금 확정 시 송금 완료 알림 발송 문제 수정
-- payment_notified_at이 있을 때(게스트가 송금 알림을 보낸 경우)만 알림 발송

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
  --    게스트가 송금 알림을 보낸 경우(payment_notified_at IS NOT NULL)에만 호스트에게 알림
  IF (OLD.status IS DISTINCT FROM 'CONFIRMED' AND NEW.status = 'CONFIRMED'
      AND NEW.payment_notified_at IS NOT NULL) THEN
    INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
    VALUES (v_host_id, 'GUEST_PAYMENT_CONFIRMED', NEW.id, 'APPLICATION', v_match_id, v_guest_id);
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
