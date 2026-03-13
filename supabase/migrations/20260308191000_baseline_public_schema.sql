--
-- PostgreSQL database dump
--

-- \restrict kVgspO8cNzOAK8EkZF0qTDJtLsAhffR6LWuez1p04d0L53IqOfejXIGYj8W0Scw

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
-- SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";

--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: application_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE "public"."application_status" AS ENUM (
    'PENDING',
    'CONFIRMED',
    'REJECTED',
    'CANCELED',
    'PAYMENT_PENDING',
    'LATE',
    'NOT_ATTENDING',
    'MAYBE'
);


ALTER TYPE "public"."application_status" OWNER TO "postgres";

--
-- Name: cancel_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE "public"."cancel_type" AS ENUM (
    'USER_REQUEST',
    'PAYMENT_TIMEOUT',
    'FRAUDULENT_PAYMENT'
);


ALTER TYPE "public"."cancel_type" OWNER TO "postgres";

--
-- Name: notification_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE "public"."notification_type" AS ENUM (
    'APPLICATION_APPROVED',
    'APPLICATION_REJECTED',
    'APPLICATION_CANCELED_USER_REQUEST',
    'APPLICATION_CANCELED_PAYMENT_TIMEOUT',
    'APPLICATION_CANCELED_FRAUDULENT_PAYMENT',
    'MATCH_CANCELED',
    'NEW_APPLICATION',
    'GUEST_CANCELED',
    'GUEST_PAYMENT_CONFIRMED',
    'HOST_ANNOUNCEMENT',
    'ADMIN_FRAUDULENT_PAYMENT_REPORT'
);


ALTER TYPE "public"."notification_type" OWNER TO "postgres";

--
-- Name: add_team_leader(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."add_team_leader"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO team_members (team_id, user_id, role, status, joined_at)
  VALUES (NEW.id, auth.uid(), 'LEADER', 'ACCEPTED', now());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."add_team_leader"() OWNER TO "postgres";

--
-- Name: cancel_application_with_count("uuid", "text"[], "text", "text", "text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."cancel_application_with_count"("p_application_id" "uuid", "p_positions" "text"[] DEFAULT NULL::"text"[], "p_cancel_type" "text" DEFAULT NULL::"text", "p_canceled_by" "text" DEFAULT NULL::"text", "p_cancel_reason" "text" DEFAULT NULL::"text") RETURNS TABLE("application_id" "uuid", "new_status" "text", "recruitment_setup" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."cancel_application_with_count"("p_application_id" "uuid", "p_positions" "text"[], "p_cancel_type" "text", "p_canceled_by" "text", "p_cancel_reason" "text") OWNER TO "postgres";

--
-- Name: confirm_application_with_count("uuid", "text"[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."confirm_application_with_count"("p_application_id" "uuid", "p_positions" "text"[] DEFAULT NULL::"text"[]) RETURNS TABLE("application_id" "uuid", "new_status" "text", "recruitment_setup" "jsonb")
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."confirm_application_with_count"("p_application_id" "uuid", "p_positions" "text"[]) OWNER TO "postgres";

--
-- Name: finish_ended_matches(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."finish_ended_matches"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$                                                         
  DECLARE                                                                       
    affected_count INTEGER;                                                     
  BEGIN                                                                         
    UPDATE matches                                                              
    SET status = 'FINISHED'                                                     
    WHERE status IN ('RECRUITING', 'CLOSED', 'CONFIRMED', 'ONGOING')
      AND end_time < now();
    GET DIAGNOSTICS affected_count = ROW_COUNT;

    RETURN affected_count;
  END;
  $$;


ALTER FUNCTION "public"."finish_ended_matches"() OWNER TO "postgres";

--
-- Name: gen_match_short_id(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."gen_match_short_id"("p_len" integer DEFAULT 10) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  alphabet CONSTANT TEXT := '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  random_bytes BYTEA;
  output TEXT := '';
  i INTEGER;
BEGIN
  IF p_len < 8 THEN
    RAISE EXCEPTION 'p_len must be >= 8';
  END IF;

  random_bytes := gen_random_bytes(p_len);

  FOR i IN 0..(p_len - 1) LOOP
    output := output || substr(alphabet, (get_byte(random_bytes, i) % 62) + 1, 1);
  END LOOP;

  RETURN output;
END;
$$;


ALTER FUNCTION "public"."gen_match_short_id"("p_len" integer) OWNER TO "postgres";

--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname, avatar_url, metadata)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'nickname',
      NEW.raw_user_meta_data->>'full_name',
      '사용자'
    ),
    NULL,
    jsonb_build_object('avatar_source', 'default')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    nickname = COALESCE(EXCLUDED.nickname, public.users.nickname),
    avatar_url = public.users.avatar_url,
    metadata = COALESCE(public.users.metadata, '{}'::jsonb)
      || jsonb_build_object(
        'avatar_source',
        COALESCE(public.users.metadata->>'avatar_source', 'default')
      );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

--
-- Name: increment_position_count("uuid", "text", integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."increment_position_count"("p_match_id" "uuid", "p_position_key" "text", "p_delta" integer DEFAULT 1) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."increment_position_count"("p_match_id" "uuid", "p_position_key" "text", "p_delta" integer) OWNER TO "postgres";

--
-- Name: FUNCTION "increment_position_count"("p_match_id" "uuid", "p_position_key" "text", "p_delta" integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."increment_position_count"("p_match_id" "uuid", "p_position_key" "text", "p_delta" integer) IS 'POSITION 타입 매치의 특정 포지션 current 값을 원자적으로 증감';


--
-- Name: increment_recruitment_total("uuid", integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."increment_recruitment_total"("p_match_id" "uuid", "p_delta" integer DEFAULT 1) RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."increment_recruitment_total"("p_match_id" "uuid", "p_delta" integer) OWNER TO "postgres";

--
-- Name: FUNCTION "increment_recruitment_total"("p_match_id" "uuid", "p_delta" integer); Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON FUNCTION "public"."increment_recruitment_total"("p_match_id" "uuid", "p_delta" integer) IS 'ANY 타입 매치의 current_count를 원자적으로 증감';


--
-- Name: is_recruitment_full("jsonb"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."is_recruitment_full"("p_setup" "jsonb") RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
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
$$;


ALTER FUNCTION "public"."is_recruitment_full"("p_setup" "jsonb") OWNER TO "postgres";

--
-- Name: normalize_regular_day_array("text"[]); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."normalize_regular_day_array"("input_value" "text"[]) RETURNS "text"[]
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_day TEXT;
  v_normalized TEXT[] := ARRAY[]::TEXT[];
BEGIN
  IF input_value IS NULL THEN
    RETURN NULL;
  END IF;

  FOREACH v_day IN ARRAY input_value
  LOOP
    v_day := upper(btrim(COALESCE(v_day, '')));

    IF v_day = '' THEN
      CONTINUE;
    END IF;

    IF v_day NOT IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN') THEN
      RAISE EXCEPTION 'invalid regular_day element: %. allowed values: MON,TUE,WED,THU,FRI,SAT,SUN', v_day;
    END IF;

    IF NOT (v_day = ANY(v_normalized)) THEN
      v_normalized := array_append(v_normalized, v_day);
    END IF;
  END LOOP;

  IF cardinality(v_normalized) = 0 THEN
    RETURN NULL;
  END IF;

  RETURN v_normalized;
END;
$$;


ALTER FUNCTION "public"."normalize_regular_day_array"("input_value" "text"[]) OWNER TO "postgres";

--
-- Name: notify_guest_payment_confirmed("uuid"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."notify_guest_payment_confirmed"("p_application_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."notify_guest_payment_confirmed"("p_application_id" "uuid") OWNER TO "postgres";

--
-- Name: notify_on_announcement(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."notify_on_announcement"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$                                                         
  DECLARE                                                                       
    v_app RECORD;                                                               
  BEGIN                                                                         
    IF NEW.target_type = 'MATCH' THEN                                           
      FOR v_app IN                                                              
        SELECT user_id                                                          
        FROM applications                                                       
        WHERE match_id = NEW.target_id                                          
          AND status = 'CONFIRMED'                                              
          AND user_id != NEW.author_id                                          
      LOOP                                                                      
        IF should_notify(v_app.user_id, 'notify_announcement') THEN             
          INSERT INTO notifications (user_id, type, reference_id,               
  reference_type, match_id, actor_id)                                           
          VALUES (v_app.user_id, 'HOST_ANNOUNCEMENT', NEW.id, 'ANNOUNCEMENT',   
  NEW.target_id, NEW.author_id);                                                
        END IF;                                                                 
      END LOOP;                                                                 
    END IF;                                                                     
    RETURN NEW;                                                                 
  END;                                                                          
  $$;


ALTER FUNCTION "public"."notify_on_announcement"() OWNER TO "postgres";

--
-- Name: notify_on_application_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."notify_on_application_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."notify_on_application_change"() OWNER TO "postgres";

--
-- Name: notify_on_application_status_change(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."notify_on_application_status_change"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."notify_on_application_status_change"() OWNER TO "postgres";

--
-- Name: notify_on_match_canceled(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."notify_on_match_canceled"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_app RECORD;
BEGIN
  IF (OLD.status IS DISTINCT FROM 'CANCELED' AND NEW.status = 'CANCELED') THEN
    FOR v_app IN
      SELECT id, user_id
      FROM applications
      WHERE match_id = NEW.id
        AND status IN ('PENDING', 'PAYMENT_PENDING', 'CONFIRMED')
    LOOP
      IF should_notify(v_app.user_id, 'notify_match') THEN
        INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
        VALUES (v_app.user_id, 'MATCH_CANCELED', v_app.id, 'APPLICATION', NEW.id, NEW.host_id);
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_on_match_canceled"() OWNER TO "postgres";

--
-- Name: notify_on_new_application(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."notify_on_new_application"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  v_host_id UUID;
BEGIN
  -- 팀투표 INSERT는 알림 제외
  IF NEW.source = 'TEAM_VOTE' THEN
    RETURN NEW;
  END IF;

  SELECT host_id INTO v_host_id
  FROM matches
  WHERE id = NEW.match_id;

  IF should_notify(v_host_id, 'notify_application') THEN
    INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
    VALUES (v_host_id, 'NEW_APPLICATION', NEW.id, 'APPLICATION', NEW.match_id, NEW.user_id);
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_on_new_application"() OWNER TO "postgres";

--
-- Name: penalize_noshow(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."penalize_noshow"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  if (new.status = 'REJECTED' and old.status = 'CONFIRMED') then
    -- 호스트가 확정 후 거절 시 노쇼 처리 (향후 noshow 상태 추가 가능)
    update users set manner_score = manner_score - 5.0 where id = new.user_id;
  end if;
  return new;
end;
$$;


ALTER FUNCTION "public"."penalize_noshow"() OWNER TO "postgres";

--
-- Name: should_notify("uuid", "text"); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."should_notify"("p_user_id" "uuid", "p_setting" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."should_notify"("p_user_id" "uuid", "p_setting" "text") OWNER TO "postgres";

--
-- Name: sync_gym_to_match(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."sync_gym_to_match"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  SELECT latitude, longitude, address
  INTO NEW.gym_latitude, NEW.gym_longitude, NEW.gym_address
  FROM gyms WHERE id = NEW.gym_id;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_gym_to_match"() OWNER TO "postgres";

--
-- Name: sync_match_chat_room_activity(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."sync_match_chat_room_activity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  UPDATE match_chat_rooms
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.body, 120),
    updated_at = NOW(),
    host_last_read_at = CASE
      WHEN host_id = NEW.sender_id THEN NEW.created_at
      ELSE host_last_read_at
    END,
    guest_last_read_at = CASE
      WHEN guest_id = NEW.sender_id THEN NEW.created_at
      ELSE guest_last_read_at
    END
  WHERE id = NEW.room_id;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_match_chat_room_activity"() OWNER TO "postgres";

--
-- Name: trg_teams_regular_day_validate(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."trg_teams_regular_day_validate"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.regular_day := public.normalize_regular_day_array(NEW.regular_day);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trg_teams_regular_day_validate"() OWNER TO "postgres";

--
-- Name: update_announcements_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."update_announcements_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_announcements_updated_at"() OWNER TO "postgres";

--
-- Name: update_gyms_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."update_gyms_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_gyms_updated_at"() OWNER TO "postgres";

--
-- Name: update_team_fees_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."update_team_fees_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_team_fees_updated_at"() OWNER TO "postgres";

--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."update_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
begin
  new.updated_at = now();
  return new;
end;
$$;


ALTER FUNCTION "public"."update_updated_at"() OWNER TO "postgres";

--
-- Name: update_user_settings_updated_at(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."update_user_settings_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_user_settings_updated_at"() OWNER TO "postgres";

--
-- Name: update_vacancy(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE OR REPLACE FUNCTION "public"."update_vacancy"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
begin
  -- Case: New Confirmation
  if (new.status = 'confirmed' and (old.status is null or old.status != 'confirmed')) then
    execute format('update matches set vacancy_%s = vacancy_%s - 1 where id = $1', new.position, new.position) using new.match_id;
  end if;

  -- Case: Cancellation (Restoring vacancy)
  if ((new.status = 'cancelled' or new.status = 'rejected') and old.status = 'confirmed') then
    execute format('update matches set vacancy_%s = vacancy_%s + 1 where id = $1', new.position, new.position) using new.match_id;
  end if;

  return new;
end;
$_$;


ALTER FUNCTION "public"."update_vacancy"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: announcements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."announcements" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_id" "uuid" NOT NULL,
    "target_type" "text" NOT NULL,
    "target_id" "uuid" NOT NULL,
    "message" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deleted_at" timestamp with time zone,
    CONSTRAINT "announcements_message_check" CHECK ((("char_length"("message") > 0) AND ("char_length"("message") <= 1000))),
    CONSTRAINT "announcements_target_type_check" CHECK (("target_type" = ANY (ARRAY['MATCH'::"text", 'TEAM'::"text", 'TOURNAMENT'::"text", 'SYSTEM'::"text"])))
);


ALTER TABLE "public"."announcements" OWNER TO "postgres";

--
-- Name: applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status" "public"."application_status" DEFAULT 'PENDING'::"public"."application_status",
    "participants_info" "jsonb" DEFAULT '[]'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "team_id" "uuid",
    "approved_at" timestamp with time zone,
    "payment_verified_at" timestamp with time zone,
    "cancel_type" "public"."cancel_type",
    "canceled_by" "text",
    "cancel_reason" "text",
    "refund_completed_at" timestamp with time zone,
    "source" character varying(20) DEFAULT 'GUEST_APPLICATION'::character varying,
    "description" "text",
    "confirmed_at" timestamp with time zone,
    "payment_notified_at" timestamp with time zone,
    CONSTRAINT "applications_canceled_by_check" CHECK (("canceled_by" = ANY (ARRAY['HOST'::"text", 'GUEST'::"text", 'SYSTEM'::"text"]))),
    CONSTRAINT "applications_source_check" CHECK ((("source")::"text" = ANY ((ARRAY['GUEST_APPLICATION'::character varying, 'TEAM_VOTE'::character varying])::"text"[])))
);


ALTER TABLE "public"."applications" OWNER TO "postgres";

--
-- Name: COLUMN "applications"."cancel_type"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."applications"."cancel_type" IS 'Type of cancellation: USER_REQUEST, PAYMENT_TIMEOUT, or FRAUDULENT_PAYMENT';


--
-- Name: COLUMN "applications"."canceled_by"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."applications"."canceled_by" IS 'Who initiated the cancellation: HOST, GUEST, or SYSTEM';


--
-- Name: COLUMN "applications"."cancel_reason"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."applications"."cancel_reason" IS 'Optional free-text reason for the cancellation';


--
-- Name: COLUMN "applications"."payment_notified_at"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN "public"."applications"."payment_notified_at" IS '게스트가 호스트에게 송금 완료 알림을 보낸 시각 (중복 전송 방지)';


--
-- Name: gyms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."gyms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "text" NOT NULL,
    "latitude" double precision NOT NULL,
    "longitude" double precision NOT NULL,
    "facilities" "jsonb" DEFAULT '{}'::"jsonb",
    "kakao_place_id" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."gyms" OWNER TO "postgres";

--
-- Name: match_chat_messages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."match_chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_id" "uuid" NOT NULL,
    "sender_id" "uuid" NOT NULL,
    "body" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "match_chat_messages_body_check" CHECK ((("char_length"(TRIM(BOTH FROM "body")) > 0) AND ("char_length"("body") <= 1000)))
);


ALTER TABLE "public"."match_chat_messages" OWNER TO "postgres";

--
-- Name: match_chat_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."match_chat_reports" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "room_id" "uuid" NOT NULL,
    "reporter_id" "uuid" NOT NULL,
    "reported_user_id" "uuid" NOT NULL,
    "reason" "text" NOT NULL,
    "details" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "match_chat_reports_details_check" CHECK ((("details" IS NULL) OR ("char_length"("details") <= 1000))),
    CONSTRAINT "match_chat_reports_reason_check" CHECK ((("char_length"(TRIM(BOTH FROM "reason")) > 0) AND ("char_length"("reason") <= 80))),
    CONSTRAINT "match_chat_reports_reporter_not_target" CHECK (("reporter_id" <> "reported_user_id"))
);


ALTER TABLE "public"."match_chat_reports" OWNER TO "postgres";

--
-- Name: match_chat_rooms; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."match_chat_rooms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "match_id" "uuid" NOT NULL,
    "host_id" "uuid" NOT NULL,
    "guest_id" "uuid" NOT NULL,
    "host_last_read_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "guest_last_read_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "last_message_at" timestamp with time zone,
    "last_message_preview" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "host_muted_at" timestamp with time zone,
    "guest_muted_at" timestamp with time zone,
    "host_left_at" timestamp with time zone,
    "guest_left_at" timestamp with time zone,
    CONSTRAINT "match_chat_rooms_host_guest_diff" CHECK (("host_id" <> "guest_id"))
);


ALTER TABLE "public"."match_chat_rooms" OWNER TO "postgres";

--
-- Name: matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."matches" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "host_id" "uuid" NOT NULL,
    "team_id" "uuid",
    "gym_id" "uuid" NOT NULL,
    "manual_team_name" "text" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone NOT NULL,
    "match_type" "text" NOT NULL,
    "gender_rule" "text" NOT NULL,
    "cost_type" "text" DEFAULT 'MONEY'::"text" NOT NULL,
    "cost_amount" integer DEFAULT 0,
    "provides_beverage" boolean DEFAULT false,
    "recruitment_setup" "jsonb" DEFAULT '{"type": "ANY", "max_count": 10}'::"jsonb" NOT NULL,
    "status" "text" DEFAULT 'RECRUITING'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "requirements" "text"[] DEFAULT '{}'::"text"[],
    "operation_info" "jsonb" DEFAULT '{}'::"jsonb",
    "account_info" "jsonb" DEFAULT '{}'::"jsonb",
    "match_rule" "jsonb" DEFAULT '{}'::"jsonb",
    "match_format" "text" DEFAULT 'FIVE_ON_FIVE'::"text" NOT NULL,
    "level_range" "jsonb",
    "age_range" "jsonb",
    "short_id" "text" DEFAULT "public"."gen_match_short_id"(10) NOT NULL,
    CONSTRAINT "matches_short_id_format_check" CHECK (("short_id" ~ '^[0-9A-Za-z]{10}$'::"text"))
);


ALTER TABLE "public"."matches" OWNER TO "postgres";

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "type" "public"."notification_type" NOT NULL,
    "reference_id" "uuid" NOT NULL,
    "reference_type" "text" NOT NULL,
    "match_id" "uuid",
    "actor_id" "uuid",
    "is_read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "notifications_reference_type_check" CHECK (("reference_type" = ANY (ARRAY['APPLICATION'::"text", 'MATCH'::"text", 'ANNOUNCEMENT'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";

--
-- Name: phone_verifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."phone_verifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "phone_number" "text" NOT NULL,
    "code" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone NOT NULL,
    "verified" boolean DEFAULT false
);


ALTER TABLE "public"."phone_verifications" OWNER TO "postgres";

--
-- Name: team_fees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."team_fees" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "year_month" character varying(7) NOT NULL,
    "is_paid" boolean DEFAULT false NOT NULL,
    "paid_at" timestamp with time zone,
    "updated_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."team_fees" OWNER TO "postgres";

--
-- Name: team_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'MEMBER'::"text",
    "status" "text" DEFAULT 'ACCEPTED'::"text",
    "joined_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";

--
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "logo_url" "text",
    "region_depth1" "text",
    "region_depth2" "text",
    "home_gym_id" "uuid",
    "is_recruiting" boolean DEFAULT false,
    "team_gender" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "operation_info" "jsonb",
    "account_info" "jsonb",
    "description" "text",
    "code" character varying(30),
    "short_intro" character varying(100),
    "regular_day" "text"[],
    "regular_start_time" time without time zone,
    "level_range" "jsonb",
    "age_range" "jsonb",
    "regular_end_time" "text",
    CONSTRAINT "teams_code_format_check" CHECK ((("code")::"text" ~ '^[a-z0-9-]{3,30}$'::"text")),
    CONSTRAINT "teams_regular_day_check" CHECK ((("regular_day" IS NULL) OR (("cardinality"("regular_day") >= 1) AND ("regular_day" <@ ARRAY['MON'::"text", 'TUE'::"text", 'WED'::"text", 'THU'::"text", 'FRI'::"text", 'SAT'::"text", 'SUN'::"text"]))))
);


ALTER TABLE "public"."teams" OWNER TO "postgres";

--
-- Name: user_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "user_id" "uuid" NOT NULL,
    "notify_application" boolean DEFAULT true NOT NULL,
    "notify_match" boolean DEFAULT true NOT NULL,
    "notify_payment" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "notify_announcement" boolean DEFAULT true NOT NULL
);


ALTER TABLE "public"."user_settings" OWNER TO "postgres";

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text",
    "real_name" "text",
    "nickname" "text",
    "avatar_url" "text",
    "phone" "text",
    "phone_verified" boolean DEFAULT false,
    "positions" "text"[],
    "manner_score" double precision DEFAULT 36.5,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "deleted_at" timestamp with time zone,
    "operation_info" "jsonb",
    "account_info" "jsonb"
);


ALTER TABLE "public"."users" OWNER TO "postgres";

--
-- Name: announcements announcements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_pkey" PRIMARY KEY ("id");


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");


--
-- Name: gyms gyms_kakao_place_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."gyms"
    ADD CONSTRAINT "gyms_kakao_place_id_key" UNIQUE ("kakao_place_id");


--
-- Name: gyms gyms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."gyms"
    ADD CONSTRAINT "gyms_pkey" PRIMARY KEY ("id");


--
-- Name: match_chat_messages match_chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."match_chat_messages"
    ADD CONSTRAINT "match_chat_messages_pkey" PRIMARY KEY ("id");


--
-- Name: match_chat_reports match_chat_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."match_chat_reports"
    ADD CONSTRAINT "match_chat_reports_pkey" PRIMARY KEY ("id");


--
-- Name: match_chat_rooms match_chat_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."match_chat_rooms"
    ADD CONSTRAINT "match_chat_rooms_pkey" PRIMARY KEY ("id");


--
-- Name: match_chat_rooms match_chat_rooms_unique_match_guest; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."match_chat_rooms"
    ADD CONSTRAINT "match_chat_rooms_unique_match_guest" UNIQUE ("match_id", "guest_id");


--
-- Name: matches matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_pkey" PRIMARY KEY ("id");


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");


--
-- Name: phone_verifications phone_verifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."phone_verifications"
    ADD CONSTRAINT "phone_verifications_pkey" PRIMARY KEY ("id");


--
-- Name: team_fees team_fees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_fees"
    ADD CONSTRAINT "team_fees_pkey" PRIMARY KEY ("id");


--
-- Name: team_fees team_fees_team_id_user_id_year_month_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_fees"
    ADD CONSTRAINT "team_fees_team_id_user_id_year_month_key" UNIQUE ("team_id", "user_id", "year_month");


--
-- Name: team_members team_members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");


--
-- Name: team_members team_members_team_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_user_id_key" UNIQUE ("team_id", "user_id");


--
-- Name: teams teams_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_code_key" UNIQUE ("code");


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");


--
-- Name: user_settings user_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("user_id");


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");


--
-- Name: idx_announcements_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_announcements_active" ON "public"."announcements" USING "btree" ("target_type", "target_id", "created_at" DESC) WHERE ("deleted_at" IS NULL);


--
-- Name: idx_announcements_author; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_announcements_author" ON "public"."announcements" USING "btree" ("author_id");


--
-- Name: idx_announcements_target; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_announcements_target" ON "public"."announcements" USING "btree" ("target_type", "target_id");


--
-- Name: idx_applications_match; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_applications_match" ON "public"."applications" USING "btree" ("match_id");


--
-- Name: idx_applications_source; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_applications_source" ON "public"."applications" USING "btree" ("source");


--
-- Name: idx_applications_team_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_applications_team_id" ON "public"."applications" USING "btree" ("team_id");


--
-- Name: idx_applications_team_vote; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_applications_team_vote" ON "public"."applications" USING "btree" ("match_id", "source") WHERE (("source")::"text" = 'TEAM_VOTE'::"text");


--
-- Name: idx_applications_unique_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "idx_applications_unique_active" ON "public"."applications" USING "btree" ("match_id", "user_id") WHERE ("status" <> 'CANCELED'::"public"."application_status");


--
-- Name: idx_applications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_applications_user" ON "public"."applications" USING "btree" ("user_id");


--
-- Name: idx_gyms_location; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_gyms_location" ON "public"."gyms" USING "btree" ("latitude", "longitude");


--
-- Name: idx_gyms_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_gyms_name" ON "public"."gyms" USING "btree" ("name");


--
-- Name: idx_match_chat_messages_room_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_match_chat_messages_room_created" ON "public"."match_chat_messages" USING "btree" ("room_id", "created_at");


--
-- Name: idx_match_chat_messages_room_sender; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_match_chat_messages_room_sender" ON "public"."match_chat_messages" USING "btree" ("room_id", "sender_id", "created_at" DESC);


--
-- Name: idx_match_chat_reports_reporter_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_match_chat_reports_reporter_created" ON "public"."match_chat_reports" USING "btree" ("reporter_id", "created_at" DESC);


--
-- Name: idx_match_chat_reports_room_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_match_chat_reports_room_created" ON "public"."match_chat_reports" USING "btree" ("room_id", "created_at" DESC);


--
-- Name: idx_match_chat_rooms_guest_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_match_chat_rooms_guest_id" ON "public"."match_chat_rooms" USING "btree" ("guest_id", "last_message_at" DESC NULLS LAST, "created_at" DESC);


--
-- Name: idx_match_chat_rooms_host_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_match_chat_rooms_host_id" ON "public"."match_chat_rooms" USING "btree" ("host_id", "last_message_at" DESC NULLS LAST, "created_at" DESC);


--
-- Name: idx_match_chat_rooms_match_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_match_chat_rooms_match_id" ON "public"."match_chat_rooms" USING "btree" ("match_id", "last_message_at" DESC NULLS LAST, "created_at" DESC);


--
-- Name: idx_matches_age_range; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_matches_age_range" ON "public"."matches" USING "gin" ("age_range");


--
-- Name: idx_matches_gym; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_matches_gym" ON "public"."matches" USING "btree" ("gym_id");


--
-- Name: idx_matches_host; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_matches_host" ON "public"."matches" USING "btree" ("host_id");


--
-- Name: idx_matches_level_max; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_matches_level_max" ON "public"."matches" USING "btree" ((("level_range" ->> 'max'::"text")));


--
-- Name: idx_matches_level_min; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_matches_level_min" ON "public"."matches" USING "btree" ((("level_range" ->> 'min'::"text")));


--
-- Name: idx_matches_level_range; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_matches_level_range" ON "public"."matches" USING "gin" ("level_range");


--
-- Name: idx_matches_short_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "idx_matches_short_id" ON "public"."matches" USING "btree" ("short_id");


--
-- Name: idx_matches_status_time; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_matches_status_time" ON "public"."matches" USING "btree" ("status", "start_time");


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_notifications_created_at" ON "public"."notifications" USING "btree" ("created_at" DESC);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_notifications_user_id" ON "public"."notifications" USING "btree" ("user_id");


--
-- Name: idx_notifications_user_unread; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_notifications_user_unread" ON "public"."notifications" USING "btree" ("user_id", "is_read") WHERE ("is_read" = false);


--
-- Name: idx_phone_verifications_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_phone_verifications_code" ON "public"."phone_verifications" USING "btree" ("code") WHERE ("verified" = false);


--
-- Name: idx_phone_verifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_phone_verifications_user" ON "public"."phone_verifications" USING "btree" ("user_id", "created_at" DESC);


--
-- Name: idx_team_fees_team_month; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_team_fees_team_month" ON "public"."team_fees" USING "btree" ("team_id", "year_month");


--
-- Name: idx_team_fees_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_team_fees_user" ON "public"."team_fees" USING "btree" ("user_id");


--
-- Name: idx_teams_account_info; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_teams_account_info" ON "public"."teams" USING "gin" ("account_info");


--
-- Name: idx_teams_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_teams_code" ON "public"."teams" USING "btree" ("code");


--
-- Name: idx_teams_operation_info; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_teams_operation_info" ON "public"."teams" USING "gin" ("operation_info");


--
-- Name: idx_users_account_info; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_users_account_info" ON "public"."users" USING "gin" ("account_info");


--
-- Name: idx_users_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_users_active" ON "public"."users" USING "btree" ("id") WHERE ("deleted_at" IS NULL);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");


--
-- Name: idx_users_operation_info; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_users_operation_info" ON "public"."users" USING "gin" ("operation_info");


--
-- Name: idx_users_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_users_phone" ON "public"."users" USING "btree" ("phone");


--
-- Name: idx_users_positions_gin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "idx_users_positions_gin" ON "public"."users" USING "gin" ("positions");


--
-- Name: teams trg_add_team_leader; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "trg_add_team_leader" AFTER INSERT ON "public"."teams" FOR EACH ROW EXECUTE FUNCTION "public"."add_team_leader"();


--
-- Name: announcements trg_announcements_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "trg_announcements_updated_at" BEFORE UPDATE ON "public"."announcements" FOR EACH ROW EXECUTE FUNCTION "public"."update_announcements_updated_at"();


--
-- Name: announcements trg_notify_on_announcement; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "trg_notify_on_announcement" AFTER INSERT ON "public"."announcements" FOR EACH ROW EXECUTE FUNCTION "public"."notify_on_announcement"();


--
-- Name: applications trg_notify_on_application_change; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "trg_notify_on_application_change" AFTER UPDATE ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."notify_on_application_change"();


--
-- Name: matches trg_notify_on_match_canceled; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "trg_notify_on_match_canceled" AFTER UPDATE ON "public"."matches" FOR EACH ROW EXECUTE FUNCTION "public"."notify_on_match_canceled"();


--
-- Name: applications trg_notify_on_new_application; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "trg_notify_on_new_application" AFTER INSERT ON "public"."applications" FOR EACH ROW EXECUTE FUNCTION "public"."notify_on_new_application"();


--
-- Name: match_chat_messages trg_sync_match_chat_room_activity; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "trg_sync_match_chat_room_activity" AFTER INSERT ON "public"."match_chat_messages" FOR EACH ROW EXECUTE FUNCTION "public"."sync_match_chat_room_activity"();


--
-- Name: team_fees trg_team_fees_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "trg_team_fees_updated_at" BEFORE UPDATE ON "public"."team_fees" FOR EACH ROW EXECUTE FUNCTION "public"."update_team_fees_updated_at"();


--
-- Name: teams trg_teams_regular_day_validate; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "trg_teams_regular_day_validate" BEFORE INSERT OR UPDATE OF "regular_day" ON "public"."teams" FOR EACH ROW EXECUTE FUNCTION "public"."trg_teams_regular_day_validate"();


--
-- Name: user_settings trg_user_settings_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "trg_user_settings_updated_at" BEFORE UPDATE ON "public"."user_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_user_settings_updated_at"();


--
-- Name: gyms update_gyms_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE OR REPLACE TRIGGER "update_gyms_timestamp" BEFORE UPDATE ON "public"."gyms" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at"();


--
-- Name: announcements announcements_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."announcements"
    ADD CONSTRAINT "announcements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: applications applications_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;


--
-- Name: applications applications_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL;


--
-- Name: applications applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: match_chat_messages match_chat_messages_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."match_chat_messages"
    ADD CONSTRAINT "match_chat_messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."match_chat_rooms"("id") ON DELETE CASCADE;


--
-- Name: match_chat_messages match_chat_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."match_chat_messages"
    ADD CONSTRAINT "match_chat_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: match_chat_reports match_chat_reports_reported_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."match_chat_reports"
    ADD CONSTRAINT "match_chat_reports_reported_user_id_fkey" FOREIGN KEY ("reported_user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: match_chat_reports match_chat_reports_reporter_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."match_chat_reports"
    ADD CONSTRAINT "match_chat_reports_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: match_chat_reports match_chat_reports_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."match_chat_reports"
    ADD CONSTRAINT "match_chat_reports_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "public"."match_chat_rooms"("id") ON DELETE CASCADE;


--
-- Name: match_chat_rooms match_chat_rooms_guest_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."match_chat_rooms"
    ADD CONSTRAINT "match_chat_rooms_guest_id_fkey" FOREIGN KEY ("guest_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: match_chat_rooms match_chat_rooms_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."match_chat_rooms"
    ADD CONSTRAINT "match_chat_rooms_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: match_chat_rooms match_chat_rooms_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."match_chat_rooms"
    ADD CONSTRAINT "match_chat_rooms_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE CASCADE;


--
-- Name: matches matches_gym_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_gym_id_fkey" FOREIGN KEY ("gym_id") REFERENCES "public"."gyms"("id");


--
-- Name: matches matches_host_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "public"."users"("id");


--
-- Name: matches matches_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."matches"
    ADD CONSTRAINT "matches_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE SET NULL;


--
-- Name: notifications notifications_actor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "public"."users"("id") ON DELETE SET NULL;


--
-- Name: notifications notifications_match_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: phone_verifications phone_verifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."phone_verifications"
    ADD CONSTRAINT "phone_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: team_fees team_fees_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_fees"
    ADD CONSTRAINT "team_fees_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;


--
-- Name: team_fees team_fees_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_fees"
    ADD CONSTRAINT "team_fees_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id");


--
-- Name: team_fees team_fees_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_fees"
    ADD CONSTRAINT "team_fees_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: team_members team_members_team_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;


--
-- Name: team_members team_members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;


--
-- Name: teams teams_home_gym_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_home_gym_id_fkey" FOREIGN KEY ("home_gym_id") REFERENCES "public"."gyms"("id");


--
-- Name: user_settings user_settings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;


--
-- Name: gyms All Public Gyms; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "All Public Gyms" ON "public"."gyms" FOR SELECT USING (true);


--
-- Name: gyms All Public Gyms Insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "All Public Gyms Insert" ON "public"."gyms" FOR INSERT WITH CHECK (true);


--
-- Name: gyms Allow authenticated users to update gyms; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow authenticated users to update gyms" ON "public"."gyms" FOR UPDATE TO "authenticated" USING (true) WITH CHECK (true);


--
-- Name: notifications Users can update own notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));


--
-- Name: notifications Users can view own notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can view own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));


--
-- Name: phone_verifications Users manage own verifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users manage own verifications" ON "public"."phone_verifications" USING (("auth"."uid"() = "user_id"));


--
-- Name: announcements; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."announcements" ENABLE ROW LEVEL SECURITY;

--
-- Name: announcements announcements_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "announcements_insert" ON "public"."announcements" FOR INSERT WITH CHECK ((("auth"."uid"() = "author_id") AND (("target_type" <> 'MATCH'::"text") OR (EXISTS ( SELECT 1
   FROM "public"."matches"
  WHERE (("matches"."id" = "announcements"."target_id") AND ("matches"."host_id" = "auth"."uid"())))))));


--
-- Name: announcements announcements_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "announcements_select" ON "public"."announcements" FOR SELECT USING ((("auth"."uid"() = "author_id") OR (("target_type" = 'MATCH'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."applications"
  WHERE (("applications"."match_id" = "announcements"."target_id") AND ("applications"."user_id" = "auth"."uid"()) AND ("applications"."status" = 'CONFIRMED'::"public"."application_status")))))));


--
-- Name: announcements announcements_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "announcements_update" ON "public"."announcements" FOR UPDATE USING (("auth"."uid"() = "author_id")) WITH CHECK (("auth"."uid"() = "author_id"));


--
-- Name: applications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."applications" ENABLE ROW LEVEL SECURITY;

--
-- Name: applications applications_insert_guest_self; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "applications_insert_guest_self" ON "public"."applications" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND ((COALESCE("source", 'GUEST_APPLICATION'::character varying))::"text" = 'GUEST_APPLICATION'::"text")));


--
-- Name: applications applications_insert_team_vote; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "applications_insert_team_vote" ON "public"."applications" FOR INSERT WITH CHECK (((("source")::"text" = 'TEAM_VOTE'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."matches" "m"
  WHERE (("m"."id" = "applications"."match_id") AND ("m"."match_type" = 'TEAM_MATCH'::"text") AND ("m"."team_id" IS NOT NULL) AND (EXISTS ( SELECT 1
           FROM "public"."team_members" "target_tm"
          WHERE (("target_tm"."team_id" = "m"."team_id") AND ("target_tm"."user_id" = "applications"."user_id") AND ("target_tm"."status" = 'ACCEPTED'::"text")))) AND (("auth"."uid"() = "applications"."user_id") OR ("auth"."uid"() = "m"."host_id") OR (EXISTS ( SELECT 1
           FROM "public"."team_members" "actor_tm"
          WHERE (("actor_tm"."team_id" = "m"."team_id") AND ("actor_tm"."user_id" = "auth"."uid"()) AND ("actor_tm"."status" = 'ACCEPTED'::"text") AND ("actor_tm"."role" = ANY (ARRAY['LEADER'::"text", 'MANAGER'::"text"])))))))))));


--
-- Name: applications applications_select_secure; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "applications_select_secure" ON "public"."applications" FOR SELECT USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."matches" "m"
  WHERE (("m"."id" = "applications"."match_id") AND ("m"."host_id" = "auth"."uid"())))) OR (((COALESCE("source", 'GUEST_APPLICATION'::character varying))::"text" = 'TEAM_VOTE'::"text") AND (EXISTS ( SELECT 1
   FROM ("public"."matches" "m"
     JOIN "public"."team_members" "tm" ON (("tm"."team_id" = "m"."team_id")))
  WHERE (("m"."id" = "applications"."match_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'ACCEPTED'::"text")))))));


--
-- Name: applications applications_update_host; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "applications_update_host" ON "public"."applications" FOR UPDATE USING ((((COALESCE("source", 'GUEST_APPLICATION'::character varying))::"text" = 'GUEST_APPLICATION'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."matches" "m"
  WHERE (("m"."id" = "applications"."match_id") AND ("m"."host_id" = "auth"."uid"())))))) WITH CHECK ((((COALESCE("source", 'GUEST_APPLICATION'::character varying))::"text" = 'GUEST_APPLICATION'::"text") AND (EXISTS ( SELECT 1
   FROM "public"."matches" "m"
  WHERE (("m"."id" = "applications"."match_id") AND ("m"."host_id" = "auth"."uid"()))))));


--
-- Name: applications applications_update_team_vote_admin; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "applications_update_team_vote_admin" ON "public"."applications" FOR UPDATE USING (((("source")::"text" = 'TEAM_VOTE'::"text") AND (EXISTS ( SELECT 1
   FROM ("public"."matches" "m"
     JOIN "public"."team_members" "actor_tm" ON (("actor_tm"."team_id" = "m"."team_id")))
  WHERE (("m"."id" = "applications"."match_id") AND ("actor_tm"."user_id" = "auth"."uid"()) AND ("actor_tm"."status" = 'ACCEPTED'::"text") AND ("actor_tm"."role" = ANY (ARRAY['LEADER'::"text", 'MANAGER'::"text"]))))))) WITH CHECK (((("source")::"text" = 'TEAM_VOTE'::"text") AND (EXISTS ( SELECT 1
   FROM ("public"."matches" "m"
     JOIN "public"."team_members" "actor_tm" ON (("actor_tm"."team_id" = "m"."team_id")))
  WHERE (("m"."id" = "applications"."match_id") AND ("actor_tm"."user_id" = "auth"."uid"()) AND ("actor_tm"."status" = 'ACCEPTED'::"text") AND ("actor_tm"."role" = ANY (ARRAY['LEADER'::"text", 'MANAGER'::"text"])))))));


--
-- Name: applications applications_update_team_vote_self; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "applications_update_team_vote_self" ON "public"."applications" FOR UPDATE USING (((("source")::"text" = 'TEAM_VOTE'::"text") AND ("user_id" = "auth"."uid"()))) WITH CHECK (((("source")::"text" = 'TEAM_VOTE'::"text") AND ("user_id" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."matches" "m"
     JOIN "public"."team_members" "tm" ON (("tm"."team_id" = "m"."team_id")))
  WHERE (("m"."id" = "applications"."match_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'ACCEPTED'::"text"))))));


--
-- Name: team_fees deny_all; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "deny_all" ON "public"."team_fees" USING (false) WITH CHECK (false);


--
-- Name: gyms; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."gyms" ENABLE ROW LEVEL SECURITY;

--
-- Name: match_chat_messages; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."match_chat_messages" ENABLE ROW LEVEL SECURITY;

--
-- Name: match_chat_messages match_chat_messages_insert_participant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "match_chat_messages_insert_participant" ON "public"."match_chat_messages" FOR INSERT WITH CHECK ((("auth"."uid"() = "sender_id") AND (EXISTS ( SELECT 1
   FROM "public"."match_chat_rooms" "r"
  WHERE (("r"."id" = "match_chat_messages"."room_id") AND (("auth"."uid"() = "r"."host_id") OR ("auth"."uid"() = "r"."guest_id")))))));


--
-- Name: match_chat_messages match_chat_messages_select_participant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "match_chat_messages_select_participant" ON "public"."match_chat_messages" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."match_chat_rooms" "r"
  WHERE (("r"."id" = "match_chat_messages"."room_id") AND (("auth"."uid"() = "r"."host_id") OR ("auth"."uid"() = "r"."guest_id"))))));


--
-- Name: match_chat_reports; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."match_chat_reports" ENABLE ROW LEVEL SECURITY;

--
-- Name: match_chat_reports match_chat_reports_insert_participant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "match_chat_reports_insert_participant" ON "public"."match_chat_reports" FOR INSERT WITH CHECK ((("auth"."uid"() = "reporter_id") AND (EXISTS ( SELECT 1
   FROM "public"."match_chat_rooms" "r"
  WHERE (("r"."id" = "match_chat_reports"."room_id") AND ((("auth"."uid"() = "r"."host_id") AND ("match_chat_reports"."reported_user_id" = "r"."guest_id")) OR (("auth"."uid"() = "r"."guest_id") AND ("match_chat_reports"."reported_user_id" = "r"."host_id"))))))));


--
-- Name: match_chat_reports match_chat_reports_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "match_chat_reports_select_own" ON "public"."match_chat_reports" FOR SELECT USING (("auth"."uid"() = "reporter_id"));


--
-- Name: match_chat_rooms; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."match_chat_rooms" ENABLE ROW LEVEL SECURITY;

--
-- Name: match_chat_rooms match_chat_rooms_insert_participant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "match_chat_rooms_insert_participant" ON "public"."match_chat_rooms" FOR INSERT WITH CHECK (((("auth"."uid"() = "host_id") OR ("auth"."uid"() = "guest_id")) AND ("host_id" <> "guest_id") AND (EXISTS ( SELECT 1
   FROM "public"."matches" "m"
  WHERE (("m"."id" = "match_chat_rooms"."match_id") AND ("m"."host_id" = "match_chat_rooms"."host_id"))))));


--
-- Name: match_chat_rooms match_chat_rooms_select_participant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "match_chat_rooms_select_participant" ON "public"."match_chat_rooms" FOR SELECT USING ((("auth"."uid"() = "host_id") OR ("auth"."uid"() = "guest_id")));


--
-- Name: match_chat_rooms match_chat_rooms_update_participant; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "match_chat_rooms_update_participant" ON "public"."match_chat_rooms" FOR UPDATE USING ((("auth"."uid"() = "host_id") OR ("auth"."uid"() = "guest_id"))) WITH CHECK ((("auth"."uid"() = "host_id") OR ("auth"."uid"() = "guest_id")));


--
-- Name: matches; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."matches" ENABLE ROW LEVEL SECURITY;

--
-- Name: matches matches_insert_secure; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "matches_insert_secure" ON "public"."matches" FOR INSERT WITH CHECK ((("auth"."uid"() = "host_id") AND (("team_id" IS NULL) OR (EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "matches"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'ACCEPTED'::"text") AND (("matches"."match_type" <> 'TEAM_MATCH'::"text") OR ("tm"."role" = ANY (ARRAY['LEADER'::"text", 'MANAGER'::"text"])))))))));


--
-- Name: matches matches_public_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "matches_public_select" ON "public"."matches" FOR SELECT TO "authenticated", "anon" USING (true);


--
-- Name: matches matches_update_secure; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "matches_update_secure" ON "public"."matches" FOR UPDATE USING (("auth"."uid"() = "host_id")) WITH CHECK (("auth"."uid"() = "host_id"));


--
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;

--
-- Name: notifications notifications_insert_service_role; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "notifications_insert_service_role" ON "public"."notifications" FOR INSERT WITH CHECK ((("auth"."role"() = 'service_role'::"text") OR (CURRENT_USER = ANY (ARRAY['postgres'::"name", 'supabase_admin'::"name"]))));


--
-- Name: phone_verifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."phone_verifications" ENABLE ROW LEVEL SECURITY;

--
-- Name: team_fees; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."team_fees" ENABLE ROW LEVEL SECURITY;

--
-- Name: team_members; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;

--
-- Name: team_members team_members_delete_by_leader; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "team_members_delete_by_leader" ON "public"."team_members" FOR DELETE USING (((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_members"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'ACCEPTED'::"text") AND ("tm"."role" = 'LEADER'::"text")))) AND ("user_id" <> "auth"."uid"())));


--
-- Name: team_members team_members_delete_self; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "team_members_delete_self" ON "public"."team_members" FOR DELETE USING ((("auth"."uid"() = "user_id") AND ("role" <> 'LEADER'::"text")));


--
-- Name: team_members team_members_insert_join_request; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "team_members_insert_join_request" ON "public"."team_members" FOR INSERT WITH CHECK ((("auth"."uid"() = "user_id") AND ("status" = 'PENDING'::"text") AND ("role" = 'MEMBER'::"text")));


--
-- Name: team_members team_members_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "team_members_select" ON "public"."team_members" FOR SELECT USING (("auth"."uid"() IS NOT NULL));


--
-- Name: team_members team_members_update_by_leader; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "team_members_update_by_leader" ON "public"."team_members" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_members"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'ACCEPTED'::"text") AND ("tm"."role" = 'LEADER'::"text")))));


--
-- Name: team_members team_members_update_by_manager; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "team_members_update_by_manager" ON "public"."team_members" FOR UPDATE USING (((EXISTS ( SELECT 1
   FROM "public"."team_members" "tm"
  WHERE (("tm"."team_id" = "team_members"."team_id") AND ("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'ACCEPTED'::"text") AND ("tm"."role" = 'MANAGER'::"text")))) AND ("role" <> ALL (ARRAY['LEADER'::"text", 'MANAGER'::"text"]))));


--
-- Name: teams; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;

--
-- Name: teams teams_delete; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "teams_delete" ON "public"."teams" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."team_members"
  WHERE (("team_members"."team_id" = "teams"."id") AND ("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'ACCEPTED'::"text") AND ("team_members"."role" = 'LEADER'::"text")))));


--
-- Name: teams teams_insert; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "teams_insert" ON "public"."teams" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));


--
-- Name: teams teams_select; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "teams_select" ON "public"."teams" FOR SELECT USING (("auth"."uid"() IS NOT NULL));


--
-- Name: teams teams_update; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "teams_update" ON "public"."teams" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."team_members"
  WHERE (("team_members"."team_id" = "teams"."id") AND ("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'ACCEPTED'::"text") AND ("team_members"."role" = 'LEADER'::"text")))));


--
-- Name: user_settings; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;

--
-- Name: user_settings user_settings_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user_settings_insert_own" ON "public"."user_settings" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));


--
-- Name: user_settings user_settings_select_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user_settings_select_own" ON "public"."user_settings" FOR SELECT USING (("auth"."uid"() = "user_id"));


--
-- Name: user_settings user_settings_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "user_settings_update_own" ON "public"."user_settings" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));


--
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

--
-- Name: users users_insert_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users_insert_own" ON "public"."users" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));


--
-- Name: users users_select_public_active; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users_select_public_active" ON "public"."users" FOR SELECT USING ((("deleted_at" IS NULL) OR ("auth"."uid"() = "id")));


--
-- Name: users users_update_own; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "users_update_own" ON "public"."users" FOR UPDATE USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));


--
-- Name: SCHEMA "public"; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";


--
-- Name: FUNCTION "add_team_leader"(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."add_team_leader"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."add_team_leader"() TO "service_role";


--
-- Name: FUNCTION "cancel_application_with_count"("p_application_id" "uuid", "p_positions" "text"[], "p_cancel_type" "text", "p_canceled_by" "text", "p_cancel_reason" "text"); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."cancel_application_with_count"("p_application_id" "uuid", "p_positions" "text"[], "p_cancel_type" "text", "p_canceled_by" "text", "p_cancel_reason" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."cancel_application_with_count"("p_application_id" "uuid", "p_positions" "text"[], "p_cancel_type" "text", "p_canceled_by" "text", "p_cancel_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."cancel_application_with_count"("p_application_id" "uuid", "p_positions" "text"[], "p_cancel_type" "text", "p_canceled_by" "text", "p_cancel_reason" "text") TO "service_role";


--
-- Name: FUNCTION "confirm_application_with_count"("p_application_id" "uuid", "p_positions" "text"[]); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."confirm_application_with_count"("p_application_id" "uuid", "p_positions" "text"[]) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."confirm_application_with_count"("p_application_id" "uuid", "p_positions" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."confirm_application_with_count"("p_application_id" "uuid", "p_positions" "text"[]) TO "service_role";


--
-- Name: FUNCTION "finish_ended_matches"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."finish_ended_matches"() TO "anon";
GRANT ALL ON FUNCTION "public"."finish_ended_matches"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."finish_ended_matches"() TO "service_role";


--
-- Name: FUNCTION "gen_match_short_id"("p_len" integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."gen_match_short_id"("p_len" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."gen_match_short_id"("p_len" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."gen_match_short_id"("p_len" integer) TO "service_role";


--
-- Name: FUNCTION "handle_new_user"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


--
-- Name: FUNCTION "increment_position_count"("p_match_id" "uuid", "p_position_key" "text", "p_delta" integer); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."increment_position_count"("p_match_id" "uuid", "p_position_key" "text", "p_delta" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."increment_position_count"("p_match_id" "uuid", "p_position_key" "text", "p_delta" integer) TO "service_role";


--
-- Name: FUNCTION "increment_recruitment_total"("p_match_id" "uuid", "p_delta" integer); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."increment_recruitment_total"("p_match_id" "uuid", "p_delta" integer) FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."increment_recruitment_total"("p_match_id" "uuid", "p_delta" integer) TO "service_role";


--
-- Name: FUNCTION "is_recruitment_full"("p_setup" "jsonb"); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."is_recruitment_full"("p_setup" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."is_recruitment_full"("p_setup" "jsonb") TO "service_role";


--
-- Name: FUNCTION "normalize_regular_day_array"("input_value" "text"[]); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."normalize_regular_day_array"("input_value" "text"[]) TO "service_role";


--
-- Name: FUNCTION "notify_guest_payment_confirmed"("p_application_id" "uuid"); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."notify_guest_payment_confirmed"("p_application_id" "uuid") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notify_guest_payment_confirmed"("p_application_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_guest_payment_confirmed"("p_application_id" "uuid") TO "service_role";


--
-- Name: FUNCTION "notify_on_announcement"(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."notify_on_announcement"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notify_on_announcement"() TO "service_role";


--
-- Name: FUNCTION "notify_on_application_change"(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."notify_on_application_change"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notify_on_application_change"() TO "service_role";


--
-- Name: FUNCTION "notify_on_application_status_change"(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."notify_on_application_status_change"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notify_on_application_status_change"() TO "service_role";


--
-- Name: FUNCTION "notify_on_match_canceled"(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."notify_on_match_canceled"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notify_on_match_canceled"() TO "service_role";


--
-- Name: FUNCTION "notify_on_new_application"(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."notify_on_new_application"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."notify_on_new_application"() TO "service_role";


--
-- Name: FUNCTION "penalize_noshow"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."penalize_noshow"() TO "anon";
GRANT ALL ON FUNCTION "public"."penalize_noshow"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."penalize_noshow"() TO "service_role";


--
-- Name: FUNCTION "should_notify"("p_user_id" "uuid", "p_setting" "text"); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."should_notify"("p_user_id" "uuid", "p_setting" "text") FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."should_notify"("p_user_id" "uuid", "p_setting" "text") TO "service_role";


--
-- Name: FUNCTION "sync_gym_to_match"(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."sync_gym_to_match"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."sync_gym_to_match"() TO "service_role";


--
-- Name: FUNCTION "sync_match_chat_room_activity"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."sync_match_chat_room_activity"() TO "service_role";


--
-- Name: FUNCTION "trg_teams_regular_day_validate"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."trg_teams_regular_day_validate"() TO "service_role";


--
-- Name: FUNCTION "update_announcements_updated_at"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."update_announcements_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_announcements_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_announcements_updated_at"() TO "service_role";


--
-- Name: FUNCTION "update_gyms_updated_at"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."update_gyms_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_gyms_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_gyms_updated_at"() TO "service_role";


--
-- Name: FUNCTION "update_team_fees_updated_at"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."update_team_fees_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_team_fees_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_team_fees_updated_at"() TO "service_role";


--
-- Name: FUNCTION "update_updated_at"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at"() TO "service_role";


--
-- Name: FUNCTION "update_user_settings_updated_at"(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION "public"."update_user_settings_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_user_settings_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_user_settings_updated_at"() TO "service_role";


--
-- Name: FUNCTION "update_vacancy"(); Type: ACL; Schema: public; Owner: postgres
--

REVOKE ALL ON FUNCTION "public"."update_vacancy"() FROM PUBLIC;
GRANT ALL ON FUNCTION "public"."update_vacancy"() TO "service_role";


--
-- Name: TABLE "announcements"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."announcements" TO "anon";
GRANT ALL ON TABLE "public"."announcements" TO "authenticated";
GRANT ALL ON TABLE "public"."announcements" TO "service_role";


--
-- Name: TABLE "applications"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."applications" TO "anon";
GRANT ALL ON TABLE "public"."applications" TO "authenticated";
GRANT ALL ON TABLE "public"."applications" TO "service_role";


--
-- Name: TABLE "gyms"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."gyms" TO "anon";
GRANT ALL ON TABLE "public"."gyms" TO "authenticated";
GRANT ALL ON TABLE "public"."gyms" TO "service_role";


--
-- Name: TABLE "match_chat_messages"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."match_chat_messages" TO "service_role";
GRANT SELECT,INSERT ON TABLE "public"."match_chat_messages" TO "authenticated";


--
-- Name: TABLE "match_chat_reports"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."match_chat_reports" TO "service_role";
GRANT SELECT,INSERT ON TABLE "public"."match_chat_reports" TO "authenticated";


--
-- Name: TABLE "match_chat_rooms"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."match_chat_rooms" TO "service_role";
GRANT SELECT,INSERT,UPDATE ON TABLE "public"."match_chat_rooms" TO "authenticated";


--
-- Name: TABLE "matches"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."matches" TO "anon";
GRANT ALL ON TABLE "public"."matches" TO "authenticated";
GRANT ALL ON TABLE "public"."matches" TO "service_role";


--
-- Name: TABLE "notifications"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";


--
-- Name: TABLE "phone_verifications"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."phone_verifications" TO "anon";
GRANT ALL ON TABLE "public"."phone_verifications" TO "authenticated";
GRANT ALL ON TABLE "public"."phone_verifications" TO "service_role";


--
-- Name: TABLE "team_fees"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."team_fees" TO "anon";
GRANT ALL ON TABLE "public"."team_fees" TO "authenticated";
GRANT ALL ON TABLE "public"."team_fees" TO "service_role";


--
-- Name: TABLE "team_members"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";


--
-- Name: TABLE "teams"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";


--
-- Name: TABLE "user_settings"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";


--
-- Name: TABLE "users"; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
-- ALTER DEFAULT PRIVILEGES FOR ROLE "supabase_admin" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";


--
-- PostgreSQL database dump complete
--

-- \unrestrict kVgspO8cNzOAK8EkZF0qTDJtLsAhffR6LWuez1p04d0L53IqOfejXIGYj8W0Scw
