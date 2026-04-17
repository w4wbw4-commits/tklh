-- 1) VAT number on platform settings
ALTER TABLE public.platform_settings
  ADD COLUMN IF NOT EXISTS vat_number TEXT;

UPDATE public.platform_settings
  SET vat_number = COALESCE(vat_number, '3000000000003');

-- 2) Terms acceptances
CREATE TYPE public.terms_scope AS ENUM ('booking', 'vendor_onboarding');

CREATE TABLE public.terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  scope public.terms_scope NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  related_id UUID,
  ip_address TEXT,
  user_agent TEXT,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_terms_acceptances_user ON public.terms_acceptances(user_id);
CREATE INDEX idx_terms_acceptances_scope ON public.terms_acceptances(scope);

ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own acceptance"
ON public.terms_acceptances FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users view own acceptance"
ON public.terms_acceptances FOR SELECT
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));