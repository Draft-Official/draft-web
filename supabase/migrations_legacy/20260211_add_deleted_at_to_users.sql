-- 계정 탈퇴(익명화) 지원을 위한 deleted_at 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- auth.users 삭제 시 public.users 행은 유지 (경기 기록 보존)
-- users.id → auth.users.id FK 제거 (PK 및 다른 FK는 유지)
DO $$
DECLARE
  fk_name TEXT;
BEGIN
  SELECT tc.constraint_name INTO fk_name
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.referential_constraints rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
  WHERE tc.table_schema = 'public'
    AND tc.table_name = 'users'
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'id';

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', fk_name);
  END IF;
END $$;
