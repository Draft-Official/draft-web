-- Add type column to match_chat_messages for announcement messages
ALTER TABLE match_chat_messages
  ADD COLUMN type text NOT NULL DEFAULT 'text'
  CHECK (type IN ('text', 'announcement'));

CREATE INDEX idx_match_chat_messages_type
  ON match_chat_messages(room_id, type)
  WHERE type = 'announcement';
