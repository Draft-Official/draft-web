-- applications 테이블에 payment_notified_at 컬럼 추가
-- 게스트가 "송금 완료" 버튼을 누른 시각 기록 (중복 방지용)
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS payment_notified_at TIMESTAMPTZ;

COMMENT ON COLUMN applications.payment_notified_at IS '게스트가 호스트에게 송금 완료 알림을 보낸 시각 (중복 전송 방지)';
