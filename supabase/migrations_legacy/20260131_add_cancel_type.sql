-- Migration: Add cancel type tracking to applications table
-- Purpose: Differentiate cancellation reasons for better management
--
-- Cancel Types:
-- USER_REQUEST    - 상호 합의 취소 (게스트 요청 등)
-- PAYMENT_TIMEOUT - 미송금 취소 (승인 후 기한 내 미입금)
-- FRAUDULENT_PAYMENT - 허위 송금 신고 (송금 완료 눌렀으나 실제 미입금)

-- 1. Create cancel_type enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cancel_type') THEN
    CREATE TYPE cancel_type AS ENUM ('USER_REQUEST', 'PAYMENT_TIMEOUT', 'FRAUDULENT_PAYMENT');
  END IF;
END$$;

-- 2. Add columns to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cancel_type cancel_type;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS canceled_by TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- 3. Add check constraint for canceled_by
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'applications_canceled_by_check'
  ) THEN
    ALTER TABLE applications ADD CONSTRAINT applications_canceled_by_check
      CHECK (canceled_by IN ('HOST', 'GUEST', 'SYSTEM'));
  END IF;
END$$;

-- 4. Add comments
COMMENT ON COLUMN applications.cancel_type IS 'Type of cancellation: USER_REQUEST, PAYMENT_TIMEOUT, or FRAUDULENT_PAYMENT';
COMMENT ON COLUMN applications.canceled_by IS 'Who initiated the cancellation: HOST, GUEST, or SYSTEM';
COMMENT ON COLUMN applications.cancel_reason IS 'Optional free-text reason for the cancellation';
