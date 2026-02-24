-- Rollback: confirmed_participant_count 컬럼 제거 및 RPC 원복
-- 20260224_add_confirmed_participant_count.sql 롤백

-- 1. 컬럼 제거
ALTER TABLE matches DROP COLUMN IF EXISTS confirmed_participant_count;

-- 2. confirm_application_with_count() 원복
--    (20260213_add_confirmed_at.sql 버전으로 복구)
DROP FUNCTION IF EXISTS confirm_application_with_count(UUID, TEXT[]);
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
  SELECT a.match_id, a.status::TEXT INTO v_match_id, v_current_status
  FROM applications a
  WHERE a.id = p_application_id;

  IF v_match_id IS NULL THEN
    RAISE EXCEPTION 'Application not found: %', p_application_id;
  END IF;

  IF v_current_status = 'CONFIRMED' THEN
    SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;
    RETURN QUERY SELECT p_application_id, v_current_status, v_setup;
    RETURN;
  END IF;

  UPDATE applications
  SET status = 'CONFIRMED',
      confirmed_at = NOW(),
      updated_at = NOW()
  WHERE id = p_application_id;

  SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;
  v_setup_type := v_setup->>'type';

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

  SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;

  IF is_recruitment_full(v_setup) THEN
    UPDATE matches SET status = 'CLOSED' WHERE id = v_match_id AND status = 'RECRUITING';
  END IF;

  RETURN QUERY SELECT p_application_id, 'CONFIRMED'::TEXT, v_setup;
END;
$$;

-- 3. cancel_application_with_count() 원복
--    (20260126_add_recruitment_tracking.sql 버전으로 복구)
DROP FUNCTION IF EXISTS cancel_application_with_count(UUID, TEXT[]);
CREATE OR REPLACE FUNCTION cancel_application_with_count(
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
  SELECT a.match_id, a.status::TEXT INTO v_match_id, v_current_status
  FROM applications a
  WHERE a.id = p_application_id;

  IF v_match_id IS NULL THEN
    RAISE EXCEPTION 'Application not found: %', p_application_id;
  END IF;

  IF v_current_status != 'CONFIRMED' THEN
    UPDATE applications
    SET status = 'CANCELED', updated_at = NOW()
    WHERE id = p_application_id;

    SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;
    RETURN QUERY SELECT p_application_id, 'CANCELED'::TEXT, v_setup;
    RETURN;
  END IF;

  UPDATE applications
  SET status = 'CANCELED', updated_at = NOW()
  WHERE id = p_application_id;

  SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;
  v_setup_type := v_setup->>'type';

  v_participant_count := COALESCE(array_length(p_positions, 1), 1);

  IF v_setup_type = 'ANY' THEN
    PERFORM increment_recruitment_total(v_match_id, -v_participant_count);
  ELSIF v_setup_type = 'POSITION' AND p_positions IS NOT NULL THEN
    FOREACH v_position IN ARRAY p_positions
    LOOP
      IF (v_position = 'F' OR v_position = 'C') AND v_setup->'positions'->'B' IS NOT NULL THEN
        PERFORM increment_position_count(v_match_id, 'B', -1);
      ELSE
        PERFORM increment_position_count(v_match_id, v_position, -1);
      END IF;
    END LOOP;
  END IF;

  SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;
  RETURN QUERY SELECT p_application_id, 'CANCELED'::TEXT, v_setup;
END;
$$;
