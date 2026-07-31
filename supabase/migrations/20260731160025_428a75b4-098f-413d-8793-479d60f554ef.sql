CREATE TABLE IF NOT EXISTS public.phone_otp_challenges (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text NOT NULL,
  code_hash text NOT NULL,
  attempts integer NOT NULL DEFAULT 0,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS phone_otp_challenges_phone_created_idx
  ON public.phone_otp_challenges (phone, created_at DESC);

-- Server-only table: no grants to anon/authenticated at all.
GRANT ALL ON public.phone_otp_challenges TO service_role;

ALTER TABLE public.phone_otp_challenges ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: unreachable from the Data API.