-- ============================================
-- P0 Security Hardening
-- - matches/applications/notifications RLS 강화
-- - SECURITY DEFINER RPC 호출자 검증 추가
-- - 게스트 송금완료 알림을 RPC로 일원화
-- ============================================

BEGIN;

-- ============================================
-- 1) notifications INSERT 하드닝
-- ============================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "notifications_insert_service_role" ON notifications;

CREATE POLICY "notifications_insert_service_role"
  ON notifications FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role'
    OR current_user IN ('postgres', 'supabase_admin')
  );

-- ============================================
-- 2) matches RLS 하드닝
-- ============================================

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Insert matches" ON matches;
DROP POLICY IF EXISTS "Host update matches" ON matches;
DROP POLICY IF EXISTS "matches_insert_secure" ON matches;
DROP POLICY IF EXISTS "matches_update_secure" ON matches;
DROP POLICY IF EXISTS "All Public Matches Insert" ON matches;
DROP POLICY IF EXISTS "All Public Matches Update" ON matches;

CREATE POLICY "matches_insert_secure"
  ON matches FOR INSERT
  WITH CHECK (
    auth.uid() = host_id
    AND (
      team_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM team_members tm
        WHERE tm.team_id = matches.team_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'ACCEPTED'
          AND (
            matches.match_type <> 'TEAM_MATCH'
            OR tm.role IN ('LEADER', 'MANAGER')
          )
      )
    )
  );

CREATE POLICY "matches_update_secure"
  ON matches FOR UPDATE
  USING (auth.uid() = host_id)
  WITH CHECK (auth.uid() = host_id);

-- ============================================
-- 3) applications RLS 하드닝
-- ============================================

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Insert applications" ON applications;
DROP POLICY IF EXISTS "Update applications" ON applications;
DROP POLICY IF EXISTS "applications_select_secure" ON applications;
DROP POLICY IF EXISTS "applications_insert_guest_self" ON applications;
DROP POLICY IF EXISTS "applications_insert_team_vote" ON applications;
DROP POLICY IF EXISTS "applications_update_host" ON applications;
DROP POLICY IF EXISTS "applications_update_team_vote_self" ON applications;
DROP POLICY IF EXISTS "applications_update_team_vote_admin" ON applications;
DROP POLICY IF EXISTS "All Public Applications" ON applications;
DROP POLICY IF EXISTS "All Public Applications Insert" ON applications;
DROP POLICY IF EXISTS "All Public Applications Update" ON applications;

CREATE POLICY "applications_select_secure"
  ON applications FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1
      FROM matches m
      WHERE m.id = applications.match_id
        AND m.host_id = auth.uid()
    )
    OR (
      COALESCE(applications.source, 'GUEST_APPLICATION') = 'TEAM_VOTE'
      AND EXISTS (
        SELECT 1
        FROM matches m
        JOIN team_members tm ON tm.team_id = m.team_id
        WHERE m.id = applications.match_id
          AND tm.user_id = auth.uid()
          AND tm.status = 'ACCEPTED'
      )
    )
  );

-- 게스트 신청: 본인 user_id로만 생성
CREATE POLICY "applications_insert_guest_self"
  ON applications FOR INSERT
  WITH CHECK (
    auth.uid() = applications.user_id
    AND COALESCE(applications.source, 'GUEST_APPLICATION') = 'GUEST_APPLICATION'
  );

-- TEAM_VOTE 생성: 본인 self 생성 또는 팀 리더/매니저/호스트가 팀원 투표를 생성
CREATE POLICY "applications_insert_team_vote"
  ON applications FOR INSERT
  WITH CHECK (
    applications.source = 'TEAM_VOTE'
    AND EXISTS (
      SELECT 1
      FROM matches m
      WHERE m.id = applications.match_id
        AND m.match_type = 'TEAM_MATCH'
        AND m.team_id IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM team_members target_tm
          WHERE target_tm.team_id = m.team_id
            AND target_tm.user_id = applications.user_id
            AND target_tm.status = 'ACCEPTED'
        )
        AND (
          auth.uid() = applications.user_id
          OR auth.uid() = m.host_id
          OR EXISTS (
            SELECT 1
            FROM team_members actor_tm
            WHERE actor_tm.team_id = m.team_id
              AND actor_tm.user_id = auth.uid()
              AND actor_tm.status = 'ACCEPTED'
              AND actor_tm.role IN ('LEADER', 'MANAGER')
          )
        )
    )
  );

-- 게스트 신청 상태 변경: 해당 match 호스트만 가능
CREATE POLICY "applications_update_host"
  ON applications FOR UPDATE
  USING (
    COALESCE(applications.source, 'GUEST_APPLICATION') = 'GUEST_APPLICATION'
    AND EXISTS (
      SELECT 1
      FROM matches m
      WHERE m.id = applications.match_id
        AND m.host_id = auth.uid()
    )
  )
  WITH CHECK (
    COALESCE(applications.source, 'GUEST_APPLICATION') = 'GUEST_APPLICATION'
    AND EXISTS (
      SELECT 1
      FROM matches m
      WHERE m.id = applications.match_id
        AND m.host_id = auth.uid()
    )
  );

-- TEAM_VOTE: 본인 투표 수정
CREATE POLICY "applications_update_team_vote_self"
  ON applications FOR UPDATE
  USING (
    applications.source = 'TEAM_VOTE'
    AND applications.user_id = auth.uid()
  )
  WITH CHECK (
    applications.source = 'TEAM_VOTE'
    AND applications.user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM matches m
      JOIN team_members tm ON tm.team_id = m.team_id
      WHERE m.id = applications.match_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'ACCEPTED'
    )
  );

-- TEAM_VOTE: 팀 리더/매니저가 팀원 투표 대리 수정
CREATE POLICY "applications_update_team_vote_admin"
  ON applications FOR UPDATE
  USING (
    applications.source = 'TEAM_VOTE'
    AND EXISTS (
      SELECT 1
      FROM matches m
      JOIN team_members actor_tm ON actor_tm.team_id = m.team_id
      WHERE m.id = applications.match_id
        AND actor_tm.user_id = auth.uid()
        AND actor_tm.status = 'ACCEPTED'
        AND actor_tm.role IN ('LEADER', 'MANAGER')
    )
  )
  WITH CHECK (
    applications.source = 'TEAM_VOTE'
    AND EXISTS (
      SELECT 1
      FROM matches m
      JOIN team_members actor_tm ON actor_tm.team_id = m.team_id
      WHERE m.id = applications.match_id
        AND actor_tm.user_id = auth.uid()
        AND actor_tm.status = 'ACCEPTED'
        AND actor_tm.role IN ('LEADER', 'MANAGER')
    )
  );

-- ============================================
-- 4) confirm_application_with_count() 권한 검증 강화
-- ============================================

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
  v_actor_id UUID := auth.uid();
  v_match_id UUID;
  v_current_status TEXT;
  v_source TEXT;
  v_host_id UUID;
  v_setup JSONB;
  v_setup_type TEXT;
  v_position TEXT;
  v_participant_count INT;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT
    a.match_id,
    a.status::TEXT,
    COALESCE(a.source, 'GUEST_APPLICATION'),
    m.host_id
  INTO
    v_match_id,
    v_current_status,
    v_source,
    v_host_id
  FROM applications a
  JOIN matches m ON m.id = a.match_id
  WHERE a.id = p_application_id;

  IF v_match_id IS NULL THEN
    RAISE EXCEPTION 'Application not found: %', p_application_id;
  END IF;

  IF v_source = 'TEAM_VOTE' THEN
    RAISE EXCEPTION 'TEAM_VOTE applications cannot be confirmed via this RPC';
  END IF;

  IF v_actor_id <> v_host_id THEN
    RAISE EXCEPTION 'Only match host can confirm applications';
  END IF;

  IF v_current_status = 'CONFIRMED' THEN
    SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;
    RETURN QUERY SELECT p_application_id, v_current_status, v_setup;
    RETURN;
  END IF;

  IF v_current_status NOT IN ('PAYMENT_PENDING', 'PENDING') THEN
    RAISE EXCEPTION 'Invalid status transition to CONFIRMED: %', v_current_status;
  END IF;

  UPDATE applications
  SET status = 'CONFIRMED',
      confirmed_at = COALESCE(confirmed_at, NOW()),
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
    UPDATE matches
    SET status = 'CLOSED'
    WHERE id = v_match_id
      AND status = 'RECRUITING';
  END IF;

  RETURN QUERY SELECT p_application_id, 'CONFIRMED'::TEXT, v_setup;
END;
$$;

-- ============================================
-- 5) cancel_application_with_count() 권한 검증 강화
-- ============================================

DROP FUNCTION IF EXISTS cancel_application_with_count(UUID, TEXT[]);
DROP FUNCTION IF EXISTS cancel_application_with_count(UUID, TEXT[], TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION cancel_application_with_count(
  p_application_id UUID,
  p_positions TEXT[] DEFAULT NULL,
  p_cancel_type TEXT DEFAULT NULL,
  p_canceled_by TEXT DEFAULT NULL,
  p_cancel_reason TEXT DEFAULT NULL
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
  v_actor_id UUID := auth.uid();
  v_match_id UUID;
  v_current_status TEXT;
  v_source TEXT;
  v_host_id UUID;
  v_guest_id UUID;
  v_setup JSONB;
  v_setup_type TEXT;
  v_position TEXT;
  v_participant_count INT;
  v_is_host BOOLEAN;
  v_is_guest BOOLEAN;
  v_effective_canceled_by TEXT;
  v_effective_cancel_type cancel_type;
  v_effective_cancel_reason TEXT;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT
    a.match_id,
    a.user_id,
    a.status::TEXT,
    COALESCE(a.source, 'GUEST_APPLICATION'),
    m.host_id
  INTO
    v_match_id,
    v_guest_id,
    v_current_status,
    v_source,
    v_host_id
  FROM applications a
  JOIN matches m ON m.id = a.match_id
  WHERE a.id = p_application_id;

  IF v_match_id IS NULL THEN
    RAISE EXCEPTION 'Application not found: %', p_application_id;
  END IF;

  IF v_source = 'TEAM_VOTE' THEN
    RAISE EXCEPTION 'TEAM_VOTE applications cannot be canceled via this RPC';
  END IF;

  v_is_host := (v_actor_id = v_host_id);
  v_is_guest := (v_actor_id = v_guest_id);

  IF NOT (v_is_host OR v_is_guest) THEN
    RAISE EXCEPTION 'Only host or applicant can cancel this application';
  END IF;

  v_effective_canceled_by := CASE
    WHEN v_is_host THEN 'HOST'
    ELSE 'GUEST'
  END;

  IF p_canceled_by IS NOT NULL AND UPPER(p_canceled_by) <> v_effective_canceled_by THEN
    RAISE EXCEPTION 'Invalid canceled_by for caller role: %', p_canceled_by;
  END IF;

  IF p_cancel_type IS NOT NULL THEN
    BEGIN
      v_effective_cancel_type := p_cancel_type::cancel_type;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid cancel_type: %', p_cancel_type;
    END;
  ELSE
    v_effective_cancel_type := 'USER_REQUEST'::cancel_type;
  END IF;

  v_effective_cancel_reason := NULLIF(BTRIM(COALESCE(p_cancel_reason, '')), '');

  IF v_current_status = 'CANCELED' THEN
    SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;
    RETURN QUERY SELECT p_application_id, 'CANCELED'::TEXT, v_setup;
    RETURN;
  END IF;

  IF v_current_status <> 'CONFIRMED' THEN
    UPDATE applications
    SET status = 'CANCELED',
        cancel_type = v_effective_cancel_type,
        canceled_by = v_effective_canceled_by,
        cancel_reason = v_effective_cancel_reason,
        updated_at = NOW()
    WHERE id = p_application_id;

    SELECT m.recruitment_setup INTO v_setup FROM matches m WHERE m.id = v_match_id;
    RETURN QUERY SELECT p_application_id, 'CANCELED'::TEXT, v_setup;
    RETURN;
  END IF;

  UPDATE applications
  SET status = 'CANCELED',
      cancel_type = v_effective_cancel_type,
      canceled_by = v_effective_canceled_by,
      cancel_reason = v_effective_cancel_reason,
      updated_at = NOW()
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

-- ============================================
-- 6) 게스트 송금완료 알림 RPC 추가
-- ============================================

DROP FUNCTION IF EXISTS notify_guest_payment_confirmed(UUID);

CREATE OR REPLACE FUNCTION notify_guest_payment_confirmed(
  p_application_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_id UUID := auth.uid();
  v_match_id UUID;
  v_guest_id UUID;
  v_host_id UUID;
  v_source TEXT;
  v_status TEXT;
BEGIN
  IF v_actor_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT
    a.match_id,
    a.user_id,
    COALESCE(a.source, 'GUEST_APPLICATION'),
    a.status::TEXT,
    m.host_id
  INTO
    v_match_id,
    v_guest_id,
    v_source,
    v_status,
    v_host_id
  FROM applications a
  JOIN matches m ON m.id = a.match_id
  WHERE a.id = p_application_id;

  IF v_match_id IS NULL THEN
    RAISE EXCEPTION 'Application not found: %', p_application_id;
  END IF;

  IF v_source = 'TEAM_VOTE' THEN
    RAISE EXCEPTION 'TEAM_VOTE applications cannot notify payment';
  END IF;

  IF v_actor_id <> v_guest_id THEN
    RAISE EXCEPTION 'Only applicant can notify payment';
  END IF;

  IF v_status <> 'PAYMENT_PENDING' THEN
    RAISE EXCEPTION 'Payment notification is allowed only for PAYMENT_PENDING status';
  END IF;

  UPDATE applications
  SET payment_notified_at = NOW(),
      updated_at = NOW()
  WHERE id = p_application_id
    AND payment_notified_at IS NULL;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  INSERT INTO notifications (
    user_id,
    type,
    reference_id,
    reference_type,
    match_id,
    actor_id
  )
  VALUES (
    v_host_id,
    'GUEST_PAYMENT_CONFIRMED',
    p_application_id,
    'APPLICATION',
    v_match_id,
    v_guest_id
  );

  RETURN TRUE;
END;
$$;

-- ============================================
-- 7) 함수 EXECUTE 권한 최소화
-- ============================================

REVOKE ALL ON FUNCTION confirm_application_with_count(UUID, TEXT[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION cancel_application_with_count(UUID, TEXT[], TEXT, TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION notify_guest_payment_confirmed(UUID) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION confirm_application_with_count(UUID, TEXT[]) FROM anon;
REVOKE EXECUTE ON FUNCTION cancel_application_with_count(UUID, TEXT[], TEXT, TEXT, TEXT) FROM anon;
REVOKE EXECUTE ON FUNCTION notify_guest_payment_confirmed(UUID) FROM anon;

GRANT EXECUTE ON FUNCTION confirm_application_with_count(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION confirm_application_with_count(UUID, TEXT[]) TO service_role;

GRANT EXECUTE ON FUNCTION cancel_application_with_count(UUID, TEXT[], TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_application_with_count(UUID, TEXT[], TEXT, TEXT, TEXT) TO service_role;

GRANT EXECUTE ON FUNCTION notify_guest_payment_confirmed(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION notify_guest_payment_confirmed(UUID) TO service_role;

COMMIT;
