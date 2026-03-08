-- ============================================
-- Announcements System Migration
-- announcements 테이블, 인덱스, RLS, 알림 트리거
-- 멱등(idempotent) - 중복 실행 안전
-- ============================================

-- ============================================
-- 1. announcements 테이블 생성
-- ============================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('MATCH', 'TEAM', 'TOURNAMENT', 'SYSTEM')),
  target_id UUID NOT NULL,
  message TEXT NOT NULL CHECK (char_length(message) > 0 AND char_length(message) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ============================================
-- 2. 인덱스
-- ============================================

-- 주 조회 패턴: 특정 대상의 공지 목록
CREATE INDEX IF NOT EXISTS idx_announcements_target
  ON announcements(target_type, target_id);

-- 내가 쓴 공지 조회
CREATE INDEX IF NOT EXISTS idx_announcements_author
  ON announcements(author_id);

-- 활성 공지 조회 (소프트 삭제 제외, 최신순)
CREATE INDEX IF NOT EXISTS idx_announcements_active
  ON announcements(target_type, target_id, created_at DESC)
  WHERE deleted_at IS NULL;

-- ============================================
-- 3. updated_at 자동 갱신 트리거
-- ============================================

CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_announcements_updated_at();

-- ============================================
-- 4. RLS 정책
-- ============================================

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- SELECT: 작성자 본인 OR MATCH 경기의 활성 신청자
DO $$ BEGIN
  CREATE POLICY "announcements_select"
    ON announcements FOR SELECT
    USING (
      auth.uid() = author_id
      OR (
        target_type = 'MATCH'
        AND EXISTS (
          SELECT 1 FROM applications
          WHERE applications.match_id = announcements.target_id
            AND applications.user_id = auth.uid()
            AND applications.status = 'CONFIRMED'
        )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- INSERT: 본인이 작성자이고, MATCH의 경우 해당 매치의 호스트인 경우
DO $$ BEGIN
  CREATE POLICY "announcements_insert"
    ON announcements FOR INSERT
    WITH CHECK (
      auth.uid() = author_id
      AND (
        target_type != 'MATCH'
        OR EXISTS (
          SELECT 1 FROM matches
          WHERE matches.id = announcements.target_id
            AND matches.host_id = auth.uid()
        )
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- UPDATE: 작성자만 (메시지 수정, 소프트 삭제용)
DO $$ BEGIN
  CREATE POLICY "announcements_update"
    ON announcements FOR UPDATE
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 5. notification_type enum에 HOST_ANNOUNCEMENT 추가
-- ============================================

DO $$ BEGIN
  ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'HOST_ANNOUNCEMENT';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 6. notifications.reference_type CHECK 확장
--    'ANNOUNCEMENT' 추가
-- ============================================

-- 기존 CHECK 제약조건 제거 후 재생성
DO $$
BEGIN
  -- 기존 제약조건 찾아서 제거
  IF EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'notifications_reference_type_check'
  ) THEN
    ALTER TABLE notifications DROP CONSTRAINT notifications_reference_type_check;
  END IF;

  -- 확장된 제약조건 추가
  ALTER TABLE notifications ADD CONSTRAINT notifications_reference_type_check
    CHECK (reference_type IN ('APPLICATION', 'MATCH', 'ANNOUNCEMENT'));
END$$;

-- ============================================
-- 7. user_settings에 notify_announcement 컬럼 추가
-- ============================================

ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS notify_announcement BOOLEAN NOT NULL DEFAULT true;

-- ============================================
-- 8. should_notify() 함수 업데이트
--    notify_announcement 분기 추가
-- ============================================

CREATE OR REPLACE FUNCTION should_notify(p_user_id UUID, p_setting TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_enabled BOOLEAN;
BEGIN
  IF p_setting = 'notify_application' THEN
    SELECT notify_application INTO v_enabled FROM user_settings WHERE user_id = p_user_id;
  ELSIF p_setting = 'notify_match' THEN
    SELECT notify_match INTO v_enabled FROM user_settings WHERE user_id = p_user_id;
  ELSIF p_setting = 'notify_payment' THEN
    SELECT notify_payment INTO v_enabled FROM user_settings WHERE user_id = p_user_id;
  ELSIF p_setting = 'notify_announcement' THEN
    SELECT notify_announcement INTO v_enabled FROM user_settings WHERE user_id = p_user_id;
  END IF;

  -- 설정 행이 없으면 기본값 true
  RETURN COALESCE(v_enabled, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. 공지 생성 시 알림 트리거 (MATCH만 MVP)
-- ============================================

DROP TRIGGER IF EXISTS trg_notify_on_announcement ON announcements;

CREATE OR REPLACE FUNCTION notify_on_announcement()
RETURNS TRIGGER AS $$
DECLARE
  v_app RECORD;
BEGIN
  -- MVP: MATCH 공지만 처리
  IF NEW.target_type = 'MATCH' THEN
    -- 해당 매치의 활성 신청자에게 알림
    FOR v_app IN
      SELECT user_id
      FROM applications
      WHERE match_id = NEW.target_id
        AND status = 'CONFIRMED'
        AND user_id != NEW.author_id  -- 작성자 본인 제외
    LOOP
      IF should_notify(v_app.user_id, 'notify_announcement') THEN
        INSERT INTO notifications (user_id, type, reference_id, reference_type, match_id, actor_id)
        VALUES (v_app.user_id, 'HOST_ANNOUNCEMENT', NEW.id, 'ANNOUNCEMENT', NEW.target_id, NEW.author_id);
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_notify_on_announcement
  AFTER INSERT ON announcements
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_announcement();
