-- ============================================
-- P1: teams.regular_day multi-day alignment
-- - teams.regular_day를 text[] 기준으로 정렬
-- - 단일 문자열 데이터는 배열 1개 요소로 승격
-- - 공백/중복 제거 + MON~SUN 검증을 트리거로 강제
-- ============================================

BEGIN;

-- 레거시 단일값 CHECK 제거 (array 타입과 불일치)
ALTER TABLE public.teams
  DROP CONSTRAINT IF EXISTS teams_regular_day_check;

-- 레거시 단일값 트리거 제거
DROP TRIGGER IF EXISTS trg_teams_regular_day_validate ON public.teams;
DROP FUNCTION IF EXISTS public.trg_teams_regular_day_validate();

-- regular_day 컬럼 타입을 text[]로 정규화
DO $$
DECLARE
  v_type TEXT;
BEGIN
  SELECT format_type(a.atttypid, a.atttypmod)
  INTO v_type
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relname = 'teams'
    AND a.attname = 'regular_day'
    AND a.attnum > 0
    AND NOT a.attisdropped;

  IF v_type IS NULL THEN
    EXECUTE 'ALTER TABLE public.teams ADD COLUMN regular_day text[]';
  ELSIF v_type = 'text[]' THEN
    NULL;
  ELSIF v_type = 'character varying[]' THEN
    EXECUTE 'ALTER TABLE public.teams ALTER COLUMN regular_day TYPE text[] USING regular_day::text[]';
  ELSIF v_type IN ('character varying', 'text', 'character') THEN
    EXECUTE $sql$
      ALTER TABLE public.teams
      ALTER COLUMN regular_day TYPE text[]
      USING CASE
        WHEN regular_day IS NULL THEN NULL
        WHEN btrim(regular_day::text) = '' THEN NULL
        ELSE ARRAY[upper(btrim(regular_day::text))]
      END
    $sql$;
  ELSE
    RAISE EXCEPTION 'Unsupported teams.regular_day type: %', v_type;
  END IF;
END
$$;

-- 배열 정규화/검증 함수
CREATE OR REPLACE FUNCTION public.normalize_regular_day_array(input_value TEXT[])
RETURNS TEXT[]
LANGUAGE plpgsql
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

-- 기존 데이터 정규화
UPDATE public.teams
SET regular_day = public.normalize_regular_day_array(regular_day);

-- array 기반 CHECK 재정의
ALTER TABLE public.teams
  ADD CONSTRAINT teams_regular_day_check
  CHECK (
    regular_day IS NULL
    OR (
      cardinality(regular_day) >= 1
      AND regular_day <@ ARRAY['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']::TEXT[]
    )
  );

-- 쓰기 시 자동 정규화 트리거
CREATE OR REPLACE FUNCTION public.trg_teams_regular_day_validate()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.regular_day := public.normalize_regular_day_array(NEW.regular_day);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_teams_regular_day_validate ON public.teams;
CREATE TRIGGER trg_teams_regular_day_validate
BEFORE INSERT OR UPDATE OF regular_day ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.trg_teams_regular_day_validate();

COMMIT;
