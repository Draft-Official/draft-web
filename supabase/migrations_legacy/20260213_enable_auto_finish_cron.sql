-- Migration: pg_cron으로 경기 자동 종료 활성화
-- 10분마다 end_time이 지난 경기 상태를 FINISHED로 전환
-- 취소는 호스트가 직접 처리 (cron에서 CANCELED 전환 없음)

-- 1. 함수 업데이트
CREATE OR REPLACE FUNCTION finish_ended_matches()
RETURNS INTEGER AS $$
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
$$ LANGUAGE plpgsql;

-- 2. pg_cron 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 3. 기존 동명 스케줄 제거 (중복 방지)
SELECT cron.unschedule('auto-finish-matches')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'auto-finish-matches'
);

-- 4. 10분마다 자동 종료 실행
SELECT cron.schedule(
  'auto-finish-matches',
  '*/10 * * * *',
  $$ SELECT finish_ended_matches(); $$
);
