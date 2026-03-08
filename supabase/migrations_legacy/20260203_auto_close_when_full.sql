-- ============================================
-- 확정 인원이 모집 인원에 도달하면 자동 마감
-- confirm_application_with_count RPC에 자동 마감 로직 추가
-- ============================================

-- 헬퍼: recruitment_setup이 가득 찼는지 확인
CREATE OR REPLACE FUNCTION is_recruitment_full(p_setup JSONB)
RETURNS BOOLEAN AS $$
DECLARE
  v_pos RECORD;
BEGIN
  IF p_setup->>'type' = 'ANY' THEN
    RETURN COALESCE((p_setup->>'current_count')::INT, 0)
           >= COALESCE((p_setup->>'max_count')::INT, 0);
  ELSIF p_setup->>'type' = 'POSITION' THEN
    -- 모든 포지션의 current >= max이면 가득 참
    FOR v_pos IN
      SELECT key, value FROM jsonb_each(p_setup->'positions')
    LOOP
      IF COALESCE((v_pos.value->>'current')::INT, 0)
         < COALESCE((v_pos.value->>'max')::INT, 0) THEN
        RETURN FALSE;
      END IF;
    END LOOP;
    RETURN TRUE;
  END IF;
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- confirm_application_with_count 재정의 (자동 마감 추가)
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
  SET status = 'CONFIRMED', updated_at = NOW()
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
