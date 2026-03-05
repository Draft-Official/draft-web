-- ============================================
-- Match Chat Migration
-- 문의하기를 인앱 1:1 채팅으로 전환하기 위한 room/message 스키마
-- ============================================

BEGIN;

-- ============================================
-- 1) Chat Rooms
-- ============================================

CREATE TABLE IF NOT EXISTS match_chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  host_last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  guest_last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT match_chat_rooms_host_guest_diff CHECK (host_id <> guest_id),
  CONSTRAINT match_chat_rooms_unique_match_guest UNIQUE (match_id, guest_id)
);

CREATE INDEX IF NOT EXISTS idx_match_chat_rooms_host_id
  ON match_chat_rooms(host_id, last_message_at DESC NULLS LAST, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_chat_rooms_guest_id
  ON match_chat_rooms(guest_id, last_message_at DESC NULLS LAST, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_chat_rooms_match_id
  ON match_chat_rooms(match_id, last_message_at DESC NULLS LAST, created_at DESC);

-- ============================================
-- 2) Chat Messages
-- ============================================

CREATE TABLE IF NOT EXISTS match_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES match_chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(trim(body)) > 0 AND char_length(body) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_match_chat_messages_room_created
  ON match_chat_messages(room_id, created_at ASC);

CREATE INDEX IF NOT EXISTS idx_match_chat_messages_room_sender
  ON match_chat_messages(room_id, sender_id, created_at DESC);

-- ============================================
-- 3) Trigger: message insert -> room activity/read metadata 갱신
-- ============================================

CREATE OR REPLACE FUNCTION sync_match_chat_room_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE match_chat_rooms
  SET
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.body, 120),
    updated_at = NOW(),
    host_last_read_at = CASE
      WHEN host_id = NEW.sender_id THEN NEW.created_at
      ELSE host_last_read_at
    END,
    guest_last_read_at = CASE
      WHEN guest_id = NEW.sender_id THEN NEW.created_at
      ELSE guest_last_read_at
    END
  WHERE id = NEW.room_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_match_chat_room_activity ON match_chat_messages;

CREATE TRIGGER trg_sync_match_chat_room_activity
  AFTER INSERT ON match_chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION sync_match_chat_room_activity();

-- ============================================
-- 4) RLS
-- ============================================

ALTER TABLE match_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "match_chat_rooms_select_participant" ON match_chat_rooms;
DROP POLICY IF EXISTS "match_chat_rooms_insert_participant" ON match_chat_rooms;
DROP POLICY IF EXISTS "match_chat_rooms_update_participant" ON match_chat_rooms;

CREATE POLICY "match_chat_rooms_select_participant"
  ON match_chat_rooms FOR SELECT
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

CREATE POLICY "match_chat_rooms_insert_participant"
  ON match_chat_rooms FOR INSERT
  WITH CHECK (
    (auth.uid() = host_id OR auth.uid() = guest_id)
    AND host_id <> guest_id
    AND EXISTS (
      SELECT 1
      FROM matches m
      WHERE m.id = match_chat_rooms.match_id
        AND m.host_id = match_chat_rooms.host_id
    )
  );

CREATE POLICY "match_chat_rooms_update_participant"
  ON match_chat_rooms FOR UPDATE
  USING (auth.uid() = host_id OR auth.uid() = guest_id)
  WITH CHECK (auth.uid() = host_id OR auth.uid() = guest_id);

DROP POLICY IF EXISTS "match_chat_messages_select_participant" ON match_chat_messages;
DROP POLICY IF EXISTS "match_chat_messages_insert_participant" ON match_chat_messages;

CREATE POLICY "match_chat_messages_select_participant"
  ON match_chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM match_chat_rooms r
      WHERE r.id = match_chat_messages.room_id
        AND (auth.uid() = r.host_id OR auth.uid() = r.guest_id)
    )
  );

CREATE POLICY "match_chat_messages_insert_participant"
  ON match_chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1
      FROM match_chat_rooms r
      WHERE r.id = match_chat_messages.room_id
        AND (auth.uid() = r.host_id OR auth.uid() = r.guest_id)
    )
  );

COMMIT;
