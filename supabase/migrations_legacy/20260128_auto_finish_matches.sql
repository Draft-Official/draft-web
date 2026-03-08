-- Migration: Auto-finish/cancel matches based on end_time
-- CONFIRMED → FINISHED, RECRUITING/CLOSED → CANCELED

-- pg_cron 스케줄러 등록 (Supabase Dashboard > Database > Extensions > pg_cron 활성화 후 SQL Editor에서 실행)
/*
SELECT cron.schedule(
  'auto-finish-matches',
  '*/10 * * * *',
  $$
    -- 확정된 경기 → 종료
    UPDATE matches
    SET status = 'FINISHED', updated_at = now()
    WHERE status = 'CONFIRMED'
      AND end_time < now();

    -- 확정 없이 시간 지난 경기 → 취소
    UPDATE matches
    SET status = 'CANCELED', updated_at = now()
    WHERE status IN ('RECRUITING', 'CLOSED')
      AND end_time < now();
  $$
);
*/

-- 수동 실행용 함수 (테스트/디버깅용)
CREATE OR REPLACE FUNCTION finish_ended_matches()
RETURNS INTEGER AS $$
DECLARE
  finished_count INTEGER;
  canceled_count INTEGER;
BEGIN
  UPDATE matches
  SET status = 'FINISHED', updated_at = now()
  WHERE status = 'CONFIRMED'
    AND end_time < now();
  GET DIAGNOSTICS finished_count = ROW_COUNT;

  UPDATE matches
  SET status = 'CANCELED', updated_at = now()
  WHERE status IN ('RECRUITING', 'CLOSED')
    AND end_time < now();
  GET DIAGNOSTICS canceled_count = ROW_COUNT;

  RETURN finished_count + canceled_count;
END;
$$ LANGUAGE plpgsql;
