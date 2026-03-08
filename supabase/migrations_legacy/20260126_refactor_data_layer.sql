-- =============================================
-- Phase 5: Data Layer Refactoring Migration
-- =============================================
--
-- 이 마이그레이션은 다음을 수행합니다:
-- 1. teams 테이블: operation_info, account_info JSONB 컬럼 추가
-- 2. users 테이블: operation_info, account_info JSONB 컬럼 추가
-- 3. applications.status enum 확장
-- 4. 기존 데이터 마이그레이션
-- 5. 레거시 컬럼 제거 (선택적)
--
-- =============================================

-- =============================================
-- 1. TEAMS 테이블 업데이트
-- =============================================

-- 1.1 새 컬럼 추가
ALTER TABLE teams
ADD COLUMN IF NOT EXISTS operation_info JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS account_info JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS regular_schedules JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS description TEXT DEFAULT NULL;

-- 1.2 기존 데이터 마이그레이션
UPDATE teams SET
  operation_info = jsonb_build_object(
    'type', CASE
      WHEN contact_link IS NOT NULL AND contact_link LIKE '%kakao%' THEN 'KAKAO_OPEN_CHAT'
      ELSE 'PHONE'
    END,
    'phone', CASE
      WHEN contact_link IS NOT NULL AND contact_link NOT LIKE '%kakao%' THEN contact_link
      ELSE NULL
    END,
    'url', CASE
      WHEN contact_link IS NOT NULL AND contact_link LIKE '%kakao%' THEN contact_link
      ELSE NULL
    END,
    'notice', host_notice
  )
WHERE operation_info IS NULL
  AND (contact_link IS NOT NULL OR host_notice IS NOT NULL);

UPDATE teams SET
  account_info = jsonb_build_object(
    'bank', account_bank,
    'number', account_number,
    'holder', account_holder
  )
WHERE account_info IS NULL
  AND (account_bank IS NOT NULL OR account_number IS NOT NULL OR account_holder IS NOT NULL);

-- 1.3 레거시 컬럼 제거 (주석 처리 - 데이터 확인 후 실행)
ALTER TABLE teams
  DROP COLUMN IF EXISTS contact_link,
  DROP COLUMN IF EXISTS host_notice,
  DROP COLUMN IF EXISTS account_bank,
  DROP COLUMN IF EXISTS account_number,
  DROP COLUMN IF EXISTS account_holder,
  DROP COLUMN IF EXISTS regular_schedule;

-- =============================================
-- 2. USERS 테이블 업데이트
-- =============================================

-- 2.1 새 JSONB 컬럼 추가
ALTER TABLE users
ADD COLUMN IF NOT EXISTS operation_info JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS account_info JSONB DEFAULT NULL;

-- 2.2 기존 데이터 마이그레이션
UPDATE users SET
  operation_info = jsonb_build_object(
    'type', COALESCE(default_contact_type, 'PHONE'),
    'phone', CASE
      WHEN COALESCE(default_contact_type, 'PHONE') = 'PHONE' THEN phone
      ELSE NULL
    END,
    'url', CASE
      WHEN default_contact_type = 'KAKAO_OPEN_CHAT' THEN kakao_open_chat_url
      ELSE NULL
    END,
    'notice', default_host_notice
  )
WHERE operation_info IS NULL
  AND (default_contact_type IS NOT NULL OR kakao_open_chat_url IS NOT NULL OR default_host_notice IS NOT NULL OR phone IS NOT NULL);

UPDATE users SET
  account_info = jsonb_build_object(
    'bank', default_account_bank,
    'number', default_account_number,
    'holder', default_account_holder
  )
WHERE account_info IS NULL
  AND (default_account_bank IS NOT NULL OR default_account_number IS NOT NULL OR default_account_holder IS NOT NULL);

-- 2.3 레거시 컬럼 제거 (주석 처리 - 데이터 확인 후 실행)
ALTER TABLE users
  DROP COLUMN IF EXISTS default_contact_type,
  DROP COLUMN IF EXISTS kakao_open_chat_url,
  DROP COLUMN IF EXISTS default_host_notice,
  DROP COLUMN IF EXISTS default_account_bank,
  DROP COLUMN IF EXISTS default_account_number,
  DROP COLUMN IF EXISTS default_account_holder;

-- =============================================
-- 3. APPLICATION_STATUS ENUM 확장
-- =============================================

-- 3.1 새 enum 값 추가
-- PostgreSQL에서는 기존 enum에 값을 추가할 수 있습니다
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'PAYMENT_PENDING';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'LATE';
ALTER TYPE application_status ADD VALUE IF NOT EXISTS 'NOT_ATTENDING';

-- 3.2 기존 CANCELED를 NOT_ATTENDING으로 마이그레이션 (선택적)
-- 주의: 이 작업은 되돌릴 수 없습니다
-- UPDATE applications SET status = 'NOT_ATTENDING' WHERE status = 'CANCELED';

-- =============================================
-- 4. 인덱스 추가 (성능 최적화)
-- =============================================

-- JSONB 필드에 GIN 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_teams_operation_info ON teams USING GIN (operation_info);
CREATE INDEX IF NOT EXISTS idx_teams_account_info ON teams USING GIN (account_info);
CREATE INDEX IF NOT EXISTS idx_users_operation_info ON users USING GIN (operation_info);
CREATE INDEX IF NOT EXISTS idx_users_account_info ON users USING GIN (account_info);

-- =============================================
-- 5. 검증 쿼리 (마이그레이션 후 실행)
-- =============================================

-- 마이그레이션 결과 확인용 (별도 실행)
SELECT
  'teams' as table_name,
  COUNT(*) as total,
  COUNT(operation_info) as with_operation_info,
  COUNT(account_info) as with_account_info
FROM teams
UNION ALL
SELECT
  'users' as table_name,
  COUNT(*) as total,
  COUNT(operation_info) as with_operation_info,
  COUNT(account_info) as with_account_info
FROM users;

-- =============================================
-- 완료
-- =============================================
