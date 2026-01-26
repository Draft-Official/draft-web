-- Migration: Add Recruitment Tracking RPC Functions
-- Description: recruitment_setup의 current count를 원자적으로 업데이트하는 함수들

-- ============================================
-- 1. POSITION 타입용: 특정 포지션의 current 증감
-- ============================================
CREATE OR REPLACE FUNCTION increment_position_count(
  p_match_id UUID,
  p_position_key TEXT,
  p_delta INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_setup JSONB;
  v_current INT;
  v_new_current INT;
BEGIN
  -- 현재 recruitment_setup 조회
  SELECT recruitment_setup INTO v_setup
  FROM matches
  WHERE id = p_match_id;

  IF v_setup IS NULL THEN
    RAISE EXCEPTION 'Match not found: %', p_match_id;
  END IF;

  IF v_setup->>'type' != 'POSITION' THEN
    RAISE EXCEPTION 'Invalid recruitment type: expected POSITION, got %', v_setup->>'type';
  END IF;

  -- 현재 값 가져오기
  v_current := COALESCE((v_setup->'positions'->p_position_key->>'current')::INT, 0);
  v_new_current := GREATEST(0, v_current + p_delta); -- 0 미만 방지

  -- 업데이트
  UPDATE matches
  SET recruitment_setup = jsonb_set(
    recruitment_setup,
    ARRAY['positions', p_position_key, 'current'],
    to_jsonb(v_new_current)
  )
  WHERE id = p_match_id;

  -- 업데이트된 setup 반환
  SELECT recruitment_setup INTO v_setup
  FROM matches
  WHERE id = p_match_id;

  RETURN v_setup;
END;
$$;

-- ============================================
-- 2. ANY 타입용: current_count 증감
-- ============================================
CREATE OR REPLACE FUNCTION increment_recruitment_total(
  p_match_id UUID,
  p_delta INT DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_setup JSONB;
  v_current INT;
  v_new_current INT;
BEGIN
  -- 현재 recruitment_setup 조회
  SELECT recruitment_setup INTO v_setup
  FROM matches
  WHERE id = p_match_id;

  IF v_setup IS NULL THEN
    RAISE EXCEPTION 'Match not found: %', p_match_id;
  END IF;

  IF v_setup->>'type' != 'ANY' THEN
    RAISE EXCEPTION 'Invalid recruitment type: expected ANY, got %', v_setup->>'type';
  END IF;

  -- 현재 값 가져오기
  v_current := COALESCE((v_setup->>'current_count')::INT, 0);
  v_new_current := GREATEST(0, v_current + p_delta); -- 0 미만 방지

  -- 업데이트
  UPDATE matches
  SET recruitment_setup = jsonb_set(
    recruitment_setup,
    ARRAY['current_count'],
    to_jsonb(v_new_current)
  )
  WHERE id = p_match_id;

  -- 업데이트된 setup 반환
  SELECT recruitment_setup INTO v_setup
  FROM matches
  WHERE id = p_match_id;

  RETURN v_setup;
END;
$$;

-- ============================================
-- 3. 신청 확정 + count 업데이트 (트랜잭션)
-- ============================================
CREATE OR REPLACE FUNCTION confirm_application_with_count(
  p_application_id UUID,
  p_positions TEXT[] DEFAULT NULL -- 포지션 배열 (participants_info에서 추출한 값들)
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
    -- ANY 타입: total count 증가
    PERFORM increment_recruitment_total(v_match_id, v_participant_count);
  ELSIF v_setup_type = 'POSITION' AND p_positions IS NOT NULL THEN
    -- POSITION 타입: 각 포지션별로 증가
    FOREACH v_position IN ARRAY p_positions
    LOOP
      -- 빅맨 통합 처리: F, C → B (B가 있는 경우)
      IF (v_position = 'F' OR v_position = 'C') AND v_setup->'positions'->'B' IS NOT NULL THEN
        PERFORM increment_position_count(v_match_id, 'B', 1);
      ELSE
        PERFORM increment_position_count(v_match_id, v_position, 1);
      END IF;
    END LOOP;
  END IF;

  -- 최종 결과 반환
  SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;
  RETURN QUERY SELECT p_application_id, 'CONFIRMED'::TEXT, v_setup;
END;
$$;

-- ============================================
-- 4. 신청 취소 + count 감소 (트랜잭션)
-- ============================================
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
  -- 신청 정보 조회
  SELECT a.match_id, a.status::TEXT INTO v_match_id, v_current_status
  FROM applications a
  WHERE a.id = p_application_id;

  IF v_match_id IS NULL THEN
    RAISE EXCEPTION 'Application not found: %', p_application_id;
  END IF;

  -- CONFIRMED가 아닌 경우 count 감소 스킵 (상태만 변경)
  IF v_current_status != 'CONFIRMED' THEN
    UPDATE applications
    SET status = 'CANCELED', updated_at = NOW()
    WHERE id = p_application_id;

    SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;
    RETURN QUERY SELECT p_application_id, 'CANCELED'::TEXT, v_setup;
    RETURN;
  END IF;

  -- 신청 상태 업데이트
  UPDATE applications
  SET status = 'CANCELED', updated_at = NOW()
  WHERE id = p_application_id;

  -- recruitment_setup 조회
  SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;
  v_setup_type := v_setup->>'type';

  -- 참여자 수 계산
  v_participant_count := COALESCE(array_length(p_positions, 1), 1);

  IF v_setup_type = 'ANY' THEN
    -- ANY 타입: total count 감소
    PERFORM increment_recruitment_total(v_match_id, -v_participant_count);
  ELSIF v_setup_type = 'POSITION' AND p_positions IS NOT NULL THEN
    -- POSITION 타입: 각 포지션별로 감소
    FOREACH v_position IN ARRAY p_positions
    LOOP
      -- 빅맨 통합 처리: F, C → B (B가 있는 경우)
      IF (v_position = 'F' OR v_position = 'C') AND v_setup->'positions'->'B' IS NOT NULL THEN
        PERFORM increment_position_count(v_match_id, 'B', -1);
      ELSE
        PERFORM increment_position_count(v_match_id, v_position, -1);
      END IF;
    END LOOP;
  END IF;

  -- 최종 결과 반환
  SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;
  RETURN QUERY SELECT p_application_id, 'CANCELED'::TEXT, v_setup;
END;
$$;

-- ============================================
-- 5. current_players_count 컬럼 삭제
-- recruitment_setup으로 통합되어 더 이상 필요 없음
-- ============================================
ALTER TABLE matches DROP COLUMN IF EXISTS current_players_count;

COMMENT ON FUNCTION increment_position_count IS 'POSITION 타입 매치의 특정 포지션 current 값을 원자적으로 증감';
COMMENT ON FUNCTION increment_recruitment_total IS 'ANY 타입 매치의 current_count를 원자적으로 증감';
COMMENT ON FUNCTION confirm_application_with_count IS '신청 확정과 동시에 recruitment count 업데이트 (트랜잭션 보장)';
COMMENT ON FUNCTION cancel_application_with_count IS '신청 취소와 동시에 recruitment count 감소 (트랜잭션 보장)';
