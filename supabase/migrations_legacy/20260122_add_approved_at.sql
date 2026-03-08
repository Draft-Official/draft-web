-- Migration: Add approved_at column to applications table
-- Purpose: Support payment_waiting status for match management
--
-- Status interpretation:
-- PENDING + approved_at IS NULL → 신청자 (pending)
-- PENDING + approved_at IS NOT NULL → 입금대기 (payment_waiting)
-- CONFIRMED → 확정
-- REJECTED → 거절

ALTER TABLE applications ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Add comment for documentation
COMMENT ON COLUMN applications.approved_at IS 'Timestamp when the application was approved. Used to distinguish pending (null) from payment_waiting (not null) status.';
