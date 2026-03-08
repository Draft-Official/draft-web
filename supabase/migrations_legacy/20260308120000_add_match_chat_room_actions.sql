-- ============================================
-- Match Chat P0 actions: mute / leave / report
-- ============================================

BEGIN;

ALTER TABLE public.match_chat_rooms
  ADD COLUMN IF NOT EXISTS host_muted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS guest_muted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS host_left_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS guest_left_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.match_chat_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES public.match_chat_rooms(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (char_length(trim(reason)) > 0 AND char_length(reason) <= 80),
  details TEXT CHECK (details IS NULL OR char_length(details) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT match_chat_reports_reporter_not_target CHECK (reporter_id <> reported_user_id)
);

CREATE INDEX IF NOT EXISTS idx_match_chat_reports_room_created
  ON public.match_chat_reports(room_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_match_chat_reports_reporter_created
  ON public.match_chat_reports(reporter_id, created_at DESC);

ALTER TABLE public.match_chat_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "match_chat_reports_insert_participant" ON public.match_chat_reports;
DROP POLICY IF EXISTS "match_chat_reports_select_own" ON public.match_chat_reports;

CREATE POLICY "match_chat_reports_insert_participant"
  ON public.match_chat_reports FOR INSERT
  WITH CHECK (
    auth.uid() = reporter_id
    AND EXISTS (
      SELECT 1
      FROM public.match_chat_rooms r
      WHERE r.id = match_chat_reports.room_id
        AND (
          (auth.uid() = r.host_id AND match_chat_reports.reported_user_id = r.guest_id)
          OR
          (auth.uid() = r.guest_id AND match_chat_reports.reported_user_id = r.host_id)
        )
    )
  );

CREATE POLICY "match_chat_reports_select_own"
  ON public.match_chat_reports FOR SELECT
  USING (auth.uid() = reporter_id);

GRANT SELECT, INSERT
  ON TABLE public.match_chat_reports
  TO authenticated;

COMMIT;
