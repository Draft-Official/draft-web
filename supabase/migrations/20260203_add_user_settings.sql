-- user_settings: 사용자별 알림 설정 테이블
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notify_application BOOLEAN NOT NULL DEFAULT true,
  notify_match BOOLEAN NOT NULL DEFAULT true,
  notify_payment BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.update_user_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_settings_updated_at();

-- RLS 활성화
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 본인만 조회
CREATE POLICY "user_settings_select_own"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

-- 본인만 삽입
CREATE POLICY "user_settings_insert_own"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 본인만 수정
CREATE POLICY "user_settings_update_own"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
