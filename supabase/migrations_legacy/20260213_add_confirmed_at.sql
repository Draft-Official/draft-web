-- 1. confirmed_at 컬럼 추가 (확정 시점 기록 — 기존 RPC에서 참조했으나 누락되어 있었음)
ALTER TABLE applications ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

-- 2. confirmed_by 컬럼 제거 (게스트 자가 확정 롤백으로 호스트만 확정 가능)
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_confirmed_by_check;
ALTER TABLE applications DROP COLUMN IF EXISTS confirmed_by;

-- 3. RPC: 기존 함수 DROP 후 재생성
--    - confirmed_by 파라미터 제거
--    - confirmed_at 설정 추가
--    - 자동 마감 로직 복원 (20260205 마이그레이션에서 누락되었던 것)
DROP FUNCTION IF EXISTS confirm_application_with_count(UUID, TEXT[]);
DROP FUNCTION IF EXISTS confirm_application_with_count(UUID, TEXT[], TEXT);
CREATE OR REPLACE FUNCTION confirm_application_with_count(
  p_application_id UUID,
  p_positions TEXT[] DEFAULT NULL
)
RETURNS TABLE(
  application_id UUID,
  new_status TEXT,
  recruitment_setup JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_match_id UUID;
  v_current_status TEXT;
  v_setup JSONB;
  v_setup_type TEXT;
  v_position TEXT;
  v_participant_count INT;
BEGIN
  -- 신청 정보 조회
  SELECT a.match_id, a.status::TEXT INTO v_match_id, v_current_status
  FROM applications a
  WHERE a.id = p_application_id;

  IF v_match_id IS NULL THEN
    RAISE EXCEPTION 'Application not found: %', p_application_id;
  END IF;

  -- 이미 확정된 경우 스킵
  IF v_current_status = 'CONFIRMED' THEN
    SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;
    RETURN QUERY SELECT p_application_id, v_current_status, v_setup;
    RETURN;
  END IF;

  -- 신청 상태 업데이트
  UPDATE applications
  SET status = 'CONFIRMED',
      confirmed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_application_id;

  -- recruitment_setup 조회
  SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;
  v_setup_type := v_setup->>'type';

  -- 참여자 수 계산
  v_participant_count := COALESCE(array_length(p_positions, 1), 1);

  IF v_setup_type = 'ANY' THEN
    PERFORM increment_recruitment_total(v_match_id, v_participant_count);
  ELSIF v_setup_type = 'POSITION' AND p_positions IS NOT NULL THEN
    FOREACH v_position IN ARRAY p_positions
    LOOP
      IF (v_position = 'F' OR v_position = 'C') AND v_setup->'positions'->'B' IS NOT NULL THEN
        PERFORM increment_position_count(v_match_id, 'B', 1);
      ELSE
        PERFORM increment_position_count(v_match_id, v_position, 1);
      END IF;
    END LOOP;
  END IF;

  -- 최종 setup 조회
  SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;

  -- 자동 마감: 모집 인원이 가득 찼으면 CLOSED로 변경
  IF is_recruitment_full(v_setup) THEN
    UPDATE matches SET status = 'CLOSED' WHERE id = v_match_id AND status = 'RECRUITING';
  END IF;

  RETURN QUERY SELECT p_application_id, 'CONFIRMED'::TEXT, v_setup;
END;
$$;

-- 4. 트리거: CONFIRMED 시 confirmed_by 체크 제거
--    (송금 완료 알림은 클라이언트에서 직접 INSERT하므로 트리거에서 불필요)
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

  -- 4. 확정: status → CONFIRMED (호스트만 확정하므로 알림 불필요)
  IF (OLD.status IS DISTINCT FROM 'CONFIRMED' AND NEW.status = 'CONFIRMED') THEN
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
