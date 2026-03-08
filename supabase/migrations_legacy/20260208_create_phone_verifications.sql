-- 전화번호 인증 (SMS MO 방식)
CREATE TABLE public.phone_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  phone_number text NOT NULL,
  code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  verified boolean DEFAULT false
);

CREATE INDEX idx_phone_verifications_code
  ON public.phone_verifications(code) WHERE verified = false;
CREATE INDEX idx_phone_verifications_user
  ON public.phone_verifications(user_id, created_at DESC);

ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own verifications"
  ON public.phone_verifications FOR ALL
  USING (auth.uid() = user_id);
