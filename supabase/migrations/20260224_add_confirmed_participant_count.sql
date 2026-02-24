-- confirmed_participant_count: 확정된 참가자 수 (동반인 포함)
-- recruitment_setup.current 대신 이 컬럼을 빈자리 계산에 사용
-- - 포지션 모드 전환 시에도 값 유지
-- - 동반인 포함 정확한 카운팅

-- 1. 컬럼 추가
ALTER TABLE matches
  ADD COLUMN IF NOT EXISTS confirmed_participant_count INTEGER NOT NULL DEFAULT 0;

-- 2. 기존 데이터 백필 (CONFIRMED 신청의 participants_info 배열 길이 합산)
UPDATE matches m
SET confirmed_participant_count = (
  SELECT COALESCE(SUM(
    CASE
      WHEN a.participants_info IS NOT NULL
        AND jsonb_typeof(a.participants_info) = 'array'
        AND jsonb_array_length(a.participants_info) > 0
      THEN jsonb_array_length(a.participants_info)
      ELSE 1
    END
  ), 0)
  FROM applications a
  WHERE a.match_id = m.id
    AND a.status = 'CONFIRMED'
);

-- 3. confirm_application_with_count() 재정의
--    confirmed_participant_count += 참가자 수 (확정 시)
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

  -- recruitment_setup.current 업데이트 (포지션별 현황용)
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

  -- confirmed_participant_count 증가
  UPDATE matches
  SET confirmed_participant_count = confirmed_participant_count + v_participant_count
  WHERE id = v_match_id;

  -- 최종 setup 조회
  SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;

  -- 자동 마감: 모집 인원이 가득 찼으면 CLOSED로 변경
  IF is_recruitment_full(v_setup) THEN
    UPDATE matches SET status = 'CLOSED' WHERE id = v_match_id AND status = 'RECRUITING';
  END IF;

  RETURN QUERY SELECT p_application_id, 'CONFIRMED'::TEXT, v_setup;
END;
$$;

-- 4. cancel_application_with_count() 재정의
--    CONFIRMED 취소 시 confirmed_participant_count -= 참가자 수
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

  -- recruitment_setup.current 업데이트 (포지션별 현황용)
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

  -- confirmed_participant_count 감소 (0 미만 방지)
  UPDATE matches
  SET confirmed_participant_count = GREATEST(0, confirmed_participant_count - v_participant_count)
  WHERE id = v_match_id;

  -- 최종 setup 조회
  SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;

  RETURN QUERY SELECT p_application_id, 'CANCELED'::TEXT, v_setup;
END;
$$;

COMMENT ON COLUMN matches.confirmed_participant_count IS '확정된 참가자 수 (동반인 포함). 빈자리 계산에 사용';
