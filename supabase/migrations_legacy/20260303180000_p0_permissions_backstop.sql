-- ============================================
-- P0 Security Backstop
-- - users 공개 쓰기 정책 제거 및 self-only 정책 고정
-- - 내부 helper/trigger 함수의 직접 실행 권한 축소
-- - future objects 기본 권한(anon/authenticated ALL) 제거
-- ============================================

BEGIN;

-- ============================================
-- 1) users RLS: 공개 insert/update 제거, self-only로 고정
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All Public Users Insert" ON public.users;
DROP POLICY IF EXISTS "All Public Users Update" ON public.users;
DROP POLICY IF EXISTS "All Public Users" ON public.users;
DROP POLICY IF EXISTS "Public profiles (active only)" ON public.users;
DROP POLICY IF EXISTS "users_insert_own" ON public.users;
DROP POLICY IF EXISTS "users_update_own" ON public.users;
DROP POLICY IF EXISTS "users_select_public_active" ON public.users;

CREATE POLICY "users_select_public_active"
  ON public.users FOR SELECT
  USING (deleted_at IS NULL OR auth.uid() = id);

CREATE POLICY "users_insert_own"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2) Internal function EXECUTE 권한 최소화
-- ============================================

REVOKE ALL ON FUNCTION public.should_notify(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_application_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_new_application() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_match_canceled() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_announcement() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.notify_on_application_status_change() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_vacancy() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.add_team_leader() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.sync_gym_to_match() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_position_count(uuid, text, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_recruitment_total(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_recruitment_full(jsonb) FROM PUBLIC, anon, authenticated;

-- ============================================
-- 3) Future objects 기본 권한 과다 오픈 방지
-- ============================================

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON FUNCTIONS FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON TABLES FROM anon, authenticated;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL ON SEQUENCES FROM anon, authenticated;

COMMIT;
