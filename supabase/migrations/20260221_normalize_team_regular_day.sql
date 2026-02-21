-- ============================================
-- Normalize teams.regular_day to single format
-- ============================================
-- 목표:
-- 1) regular_day를 MON~SUN 단일 포맷으로 정규화
-- 2) legacy 컬럼(regular_schedules, regular_schedule, regular_time) 1회 백필
-- 3) legacy 컬럼 제거로 다중 포맷 재유입 차단
-- 4) INSERT/UPDATE 시 strict validation 적용

CREATE OR REPLACE FUNCTION public.normalize_regular_day(input_value TEXT)
RETURNS VARCHAR(3)
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CASE
    WHEN input_value IS NULL THEN NULL
    WHEN regexp_replace(trim(input_value), '\s+', '', 'g') = '' THEN NULL
    WHEN upper(regexp_replace(trim(input_value), '\s+', '', 'g')) IN ('MON', 'MONDAY', '월', '월요일') THEN 'MON'
    WHEN upper(regexp_replace(trim(input_value), '\s+', '', 'g')) IN ('TUE', 'TUES', 'TUESDAY', '화', '화요일') THEN 'TUE'
    WHEN upper(regexp_replace(trim(input_value), '\s+', '', 'g')) IN ('WED', 'WEDNESDAY', '수', '수요일') THEN 'WED'
    WHEN upper(regexp_replace(trim(input_value), '\s+', '', 'g')) IN ('THU', 'THUR', 'THURS', 'THURSDAY', '목', '목요일') THEN 'THU'
    WHEN upper(regexp_replace(trim(input_value), '\s+', '', 'g')) IN ('FRI', 'FRIDAY', '금', '금요일') THEN 'FRI'
    WHEN upper(regexp_replace(trim(input_value), '\s+', '', 'g')) IN ('SAT', 'SATURDAY', '토', '토요일') THEN 'SAT'
    WHEN upper(regexp_replace(trim(input_value), '\s+', '', 'g')) IN ('SUN', 'SUNDAY', '일', '일요일') THEN 'SUN'
    WHEN regexp_replace(trim(input_value), '\s+', '', 'g') LIKE '%월요일%' THEN 'MON'
    WHEN regexp_replace(trim(input_value), '\s+', '', 'g') LIKE '%화요일%' THEN 'TUE'
    WHEN regexp_replace(trim(input_value), '\s+', '', 'g') LIKE '%수요일%' THEN 'WED'
    WHEN regexp_replace(trim(input_value), '\s+', '', 'g') LIKE '%목요일%' THEN 'THU'
    WHEN regexp_replace(trim(input_value), '\s+', '', 'g') LIKE '%금요일%' THEN 'FRI'
    WHEN regexp_replace(trim(input_value), '\s+', '', 'g') LIKE '%토요일%' THEN 'SAT'
    WHEN regexp_replace(trim(input_value), '\s+', '', 'g') LIKE '%일요일%' THEN 'SUN'
    ELSE NULL
  END
$$;

DO $$
DECLARE
  has_teams BOOLEAN;
  has_regular_schedules BOOLEAN;
  has_regular_schedule BOOLEAN;
  has_regular_time BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'teams'
  ) INTO has_teams;

  IF NOT has_teams THEN
    RAISE NOTICE 'public.teams table not found, skip migration';
    RETURN;
  END IF;

  ALTER TABLE public.teams
    ADD COLUMN IF NOT EXISTS regular_day VARCHAR(3),
    ADD COLUMN IF NOT EXISTS regular_start_time TIME,
    ADD COLUMN IF NOT EXISTS regular_end_time TIME;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'teams'
      AND column_name = 'regular_schedules'
  ) INTO has_regular_schedules;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'teams'
      AND column_name = 'regular_schedule'
  ) INTO has_regular_schedule;

  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'teams'
      AND column_name = 'regular_time'
  ) INTO has_regular_time;

  -- 1) regular_schedules(JSONB) -> canonical columns
  IF has_regular_schedules THEN
    WITH schedule_source AS (
      SELECT
        id,
        CASE
          WHEN jsonb_typeof(regular_schedules) = 'array' AND jsonb_array_length(regular_schedules) > 0
            THEN regular_schedules->0
          WHEN jsonb_typeof(regular_schedules) = 'object'
            THEN regular_schedules
          ELSE NULL
        END AS schedule
      FROM public.teams
    )
    UPDATE public.teams t
    SET
      regular_day = COALESCE(
        t.regular_day,
        public.normalize_regular_day(schedule_source.schedule->>'day')
      ),
      regular_start_time = COALESCE(
        t.regular_start_time,
        CASE
          WHEN COALESCE(schedule_source.schedule->>'start_time', '') ~ '^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$'
            THEN (schedule_source.schedule->>'start_time')::TIME
          ELSE NULL
        END
      ),
      regular_end_time = COALESCE(
        t.regular_end_time,
        CASE
          WHEN COALESCE(schedule_source.schedule->>'end_time', '') ~ '^[0-9]{2}:[0-9]{2}(:[0-9]{2})?$'
            THEN (schedule_source.schedule->>'end_time')::TIME
          ELSE NULL
        END
      )
    FROM schedule_source
    WHERE t.id = schedule_source.id;
  END IF;

  -- 2) regular_schedule(TEXT) -> regular_day
  IF has_regular_schedule THEN
    UPDATE public.teams
    SET regular_day = COALESCE(regular_day, public.normalize_regular_day(regular_schedule))
    WHERE regular_schedule IS NOT NULL;
  END IF;

  -- 3) regular_time(TIME) -> regular_start_time
  IF has_regular_time THEN
    UPDATE public.teams
    SET regular_start_time = COALESCE(regular_start_time, regular_time)
    WHERE regular_time IS NOT NULL;
  END IF;

  -- 4) Normalize regular_day to MON~SUN
  UPDATE public.teams
  SET regular_day = public.normalize_regular_day(regular_day);

  -- 5) Ensure strict check constraint (idempotent)
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'teams'
      AND tc.constraint_type = 'CHECK'
      AND tc.constraint_name = 'teams_regular_day_check'
  ) THEN
    ALTER TABLE public.teams
      ADD CONSTRAINT teams_regular_day_check
      CHECK (
        regular_day IS NULL OR regular_day IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN')
      );
  END IF;

  -- 6) Drop legacy columns to prevent multi-format reintroduction
  ALTER TABLE public.teams
    DROP COLUMN IF EXISTS regular_schedules,
    DROP COLUMN IF EXISTS regular_schedule,
    DROP COLUMN IF EXISTS regular_time;
END $$;

DROP FUNCTION IF EXISTS public.normalize_regular_day(TEXT);

CREATE OR REPLACE FUNCTION public.trg_teams_regular_day_validate()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  normalized TEXT;
BEGIN
  IF NEW.regular_day IS NULL THEN
    RETURN NEW;
  END IF;

  normalized := upper(trim(NEW.regular_day));
  IF normalized = '' THEN
    NEW.regular_day := NULL;
    RETURN NEW;
  END IF;

  IF normalized NOT IN ('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN') THEN
    RAISE EXCEPTION 'invalid regular_day: %. allowed values: MON,TUE,WED,THU,FRI,SAT,SUN', NEW.regular_day;
  END IF;

  NEW.regular_day := normalized;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_teams_regular_day_validate ON public.teams;
CREATE TRIGGER trg_teams_regular_day_validate
BEFORE INSERT OR UPDATE OF regular_day ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.trg_teams_regular_day_validate();
