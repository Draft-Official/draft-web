-- =============================================
-- Add short public identifier for matches
-- =============================================
-- Strategy:
-- 1) Keep UUID PK (matches.id) for internal joins/mutations
-- 2) Add matches.short_id for public URL exposure
-- 3) Enforce uniqueness and fixed base62 format

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.gen_match_short_id(p_len INTEGER DEFAULT 10)
RETURNS TEXT
LANGUAGE plpgsql
VOLATILE
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

ALTER TABLE public.matches
  ADD COLUMN IF NOT EXISTS short_id TEXT;

UPDATE public.matches
SET short_id = public.gen_match_short_id(10)
WHERE short_id IS NULL;

ALTER TABLE public.matches
  ALTER COLUMN short_id SET DEFAULT public.gen_match_short_id(10);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'matches_short_id_format_check'
      AND conrelid = 'public.matches'::regclass
  ) THEN
    ALTER TABLE public.matches
      ADD CONSTRAINT matches_short_id_format_check
      CHECK (short_id ~ '^[0-9A-Za-z]{10}$');
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_matches_short_id
  ON public.matches(short_id);

ALTER TABLE public.matches
  ALTER COLUMN short_id SET NOT NULL;
