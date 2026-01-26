-- Add match_format column with default value
ALTER TABLE matches ADD COLUMN match_format TEXT NOT NULL DEFAULT 'FIVE_ON_FIVE';

-- Migrate existing match_type values to match_format
UPDATE matches SET match_format =
  CASE match_type
    WHEN '5vs5' THEN 'FIVE_ON_FIVE'
    WHEN '3vs3' THEN 'THREE_ON_THREE'
    ELSE 'FIVE_ON_FIVE'
  END;

-- Reset match_type to default purpose (GUEST_RECRUIT)
UPDATE matches SET match_type = 'GUEST_RECRUIT';
