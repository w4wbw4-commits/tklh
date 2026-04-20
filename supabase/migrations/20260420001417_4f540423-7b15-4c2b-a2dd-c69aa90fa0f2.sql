-- ============================================================================
-- Customer leads + phone-OTP scaffolding
-- ============================================================================
-- A "lead" is created the moment a phone number is verified, even before any
-- booking is made, so admins can follow up with people who started planning
-- but didn't finish. Leads are upgraded as the customer progresses through
-- the funnel (verified → planned → booked → completed).
-- ============================================================================

-- 1. Lead status enum -------------------------------------------------------
CREATE TYPE public.lead_status AS ENUM (
  'verified',     -- just verified phone, no event yet
  'planned',      -- created an event in the wizard
  'booked',       -- created at least one booking
  'completed',    -- service delivered
  'lost'          -- admin marked as not interested
);

-- 2. Leads table ------------------------------------------------------------
CREATE TABLE public.customer_leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID,                  -- nullable: phone may be verified before signup
  phone           TEXT NOT NULL,         -- always stored E.164, e.g. +9665XXXXXXXX
  display_name    TEXT,
  status          public.lead_status NOT NULL DEFAULT 'verified',
  source          TEXT NOT NULL DEFAULT 'phone_otp', -- phone_otp | wizard | whatsapp | manual
  event_id        UUID REFERENCES public.events(id) ON DELETE SET NULL,
  booking_id      UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  notes           TEXT,
  last_contacted_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX customer_leads_phone_idx        ON public.customer_leads (phone);
CREATE INDEX customer_leads_status_idx       ON public.customer_leads (status);
CREATE INDEX customer_leads_created_at_idx   ON public.customer_leads (created_at DESC);
CREATE UNIQUE INDEX customer_leads_user_phone_uq
  ON public.customer_leads (user_id, phone)
  WHERE user_id IS NOT NULL;

-- 3. RLS --------------------------------------------------------------------
ALTER TABLE public.customer_leads ENABLE ROW LEVEL SECURITY;

-- Admins can read/write everything
CREATE POLICY "Admins manage all leads"
  ON public.customer_leads
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Authenticated users can see their own lead row (handy for "you're already in our list")
CREATE POLICY "Users see own lead"
  ON public.customer_leads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Authenticated users can insert their own lead row from the client (mock OTP path)
CREATE POLICY "Users insert own lead"
  ON public.customer_leads
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    -- Phone must look like an E.164 string starting with +966 (Saudi)
    AND phone ~ '^\+966[0-9]{8,12}$'
  );

-- Authenticated users can update progression metadata on their own lead row
CREATE POLICY "Users update own lead"
  ON public.customer_leads
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. updated_at trigger -----------------------------------------------------
CREATE TRIGGER set_customer_leads_updated_at
BEFORE UPDATE ON public.customer_leads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Add phone column convention to profiles --------------------------------
-- (profiles.phone already exists; nothing to migrate here)
