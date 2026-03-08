-- ============================================
-- Match Chat Table Privileges
-- 20260303180000_p0_permissions_backstop 이후
-- 새 테이블은 authenticated 기본 권한이 자동 부여되지 않으므로 명시적으로 부여한다.
-- ============================================

BEGIN;

GRANT SELECT, INSERT, UPDATE
  ON TABLE public.match_chat_rooms
  TO authenticated;

GRANT SELECT, INSERT
  ON TABLE public.match_chat_messages
  TO authenticated;

COMMIT;
