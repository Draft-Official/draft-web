-- Migration: Add payment_verified_at column to applications table
-- Purpose: Host internal tracking for payment verification (does NOT affect guest status)
--
-- Flow:
-- PENDING → approved_at 설정 (호스트 승인) → 게스트 송금 완료 → CONFIRMED
-- payment_verified_at은 호스트 내부 관리용 (입금 확인/미확인 표시)

ALTER TABLE applications ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMPTZ;

COMMENT ON COLUMN applications.payment_verified_at IS 'Timestamp when the host verified the payment. For internal management only - does not affect guest status.';
