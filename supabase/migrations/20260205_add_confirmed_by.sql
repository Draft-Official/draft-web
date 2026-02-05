-- Migration: Add confirmed_by column to applications table
-- Purpose: Track who confirmed the payment to skip notification when host confirms

-- 1. Add confirmed_by column
ALTER TABLE applications ADD COLUMN IF NOT EXISTS confirmed_by TEXT;

-- 2. Add check constraint for confirmed_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'applications_confirmed_by_check'
  ) THEN
    ALTER TABLE applications ADD CONSTRAINT applications_confirmed_by_check
      CHECK (confirmed_by IN ('HOST', 'GUEST'));
  END IF;
END$$;

-- 3. Add comment
COMMENT ON COLUMN applications.confirmed_by IS 'Who confirmed the payment: HOST or GUEST. Used to skip notification when host confirms.';

-- 4. Update trigger to check confirmed_by before sending GUEST_PAYMENT_CONFIRMED notification
CREATE OR REPLACE FUNCTION notify_on_application_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_host_id UUID;
  v_guest_id UUID;
  v_match_id UUID;
  v_notification_type TEXT;
BEGIN
  -- 현재 신청의 match_id, guest_id(user_id) 가져오기
  v_match_id := NEW.match_id;
  v_guest_id := NEW.user_id;

  -- 해당 경기의 host_id 가져오기
  SELECT host_id INTO v_host_id
  FROM matches
  WHERE id = v_match_id;

  -- 1. 승인: approved_at 설정 시 (NULL → NOT NULL)
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

  -- 4. 송금 확인: status → CONFIRMED (게스트가 확인한 경우에만 알림)
  IF (OLD.status IS DISTINCT FROM 'CONFIRMED' AND NEW.status = 'CONFIRMED') THEN
    -- 호스트가 직접 확인한 경우 알림 스킵
    IF (NEW.confirmed_by = 'HOST') THEN
      RETURN NEW;
    END IF;

    -- 게스트가 확인한 경우에만 호스트에게 알림
    IF should_notify(v_host_id, 'notify_payment') THEN
      INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
      VALUES (v_host_id, 'GUEST_PAYMENT_CONFIRMED', NEW.id, 'APPLICATION', v_match_id, v_guest_id);
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Update RPC function to accept confirmed_by parameter
CREATE OR REPLACE FUNCTION confirm_application_with_count(
  p_application_id UUID,
  p_positions TEXT[] DEFAULT NULL,
  p_confirmed_by TEXT DEFAULT 'GUEST'
)
RETURNS VOID AS $$
DECLARE
  v_match_id UUID;
  v_pos TEXT;
BEGIN
  -- 1. Get match_id from application
  SELECT match_id INTO v_match_id
  FROM applications
  WHERE id = p_application_id;

  IF v_match_id IS NULL THEN
    RAISE EXCEPTION 'Application not found';
  END IF;

  -- 2. Update application status to CONFIRMED with confirmed_by
  UPDATE applications
  SET status = 'CONFIRMED',
      confirmed_at = NOW(),
      confirmed_by = p_confirmed_by,
      updated_at = NOW()
  WHERE id = p_application_id;

  -- 3. Update recruitment_setup.current for each position
  IF p_positions IS NOT NULL THEN
    FOREACH v_pos IN ARRAY p_positions
    LOOP
      UPDATE matches
      SET recruitment_setup = jsonb_set(
        recruitment_setup,
        ARRAY['positions', v_pos, 'current'],
        to_jsonb(COALESCE((recruitment_setup->'positions'->v_pos->>'current')::int, 0) + 1)
      )
      WHERE id = v_match_id
        AND recruitment_setup->'positions' ? v_pos;
    END LOOP;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
