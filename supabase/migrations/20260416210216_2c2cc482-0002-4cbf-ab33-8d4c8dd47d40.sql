-- 1) Add admin enum value usage already exists; add booking statuses for service completion tracking
-- (booking_status enum already has: pending, confirmed, rejected, completed, cancelled)

-- 2) Platform settings (singleton)
CREATE TABLE IF NOT EXISTS public.platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  commission_percent NUMERIC NOT NULL DEFAULT 12,
  vat_percent NUMERIC NOT NULL DEFAULT 15,
  auto_release_days INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'SAR',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

INSERT INTO public.platform_settings (commission_percent, vat_percent, auto_release_days)
SELECT 12, 15, 0
WHERE NOT EXISTS (SELECT 1 FROM public.platform_settings);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Settings viewable by everyone"
  ON public.platform_settings FOR SELECT USING (true);

CREATE POLICY "Only admins can update settings"
  ON public.platform_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert settings"
  ON public.platform_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3) Payment status enums
DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('held', 'released', 'refunded', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('mada', 'apple_pay', 'stc_pay', 'credit_card', 'tamara', 'tabby', 'mock');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payout_status AS ENUM ('requested', 'approved', 'paid', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) Payments table (escrow tracking)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  platform_fee NUMERIC NOT NULL DEFAULT 0,
  vendor_net NUMERIC NOT NULL DEFAULT 0,
  total_charged NUMERIC NOT NULL DEFAULT 0,
  method public.payment_method NOT NULL DEFAULT 'mock',
  status public.payment_status NOT NULL DEFAULT 'held',
  reference TEXT,
  released_at TIMESTAMPTZ,
  released_by UUID,
  refunded_at TIMESTAMPTZ,
  refund_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_vendor ON public.payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON public.payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers see own payments"
  ON public.payments FOR SELECT
  USING (
    auth.uid() = customer_id
    OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = payments.vendor_id AND v.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Customers can create own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins can update payments"
  ON public.payments FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Payout requests
CREATE TABLE IF NOT EXISTS public.payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  status public.payout_status NOT NULL DEFAULT 'requested',
  bank_info TEXT,
  notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payout_vendor ON public.payout_requests(vendor_id);
CREATE INDEX IF NOT EXISTS idx_payout_status ON public.payout_requests(status);

ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors see own payouts"
  ON public.payout_requests FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = payout_requests.vendor_id AND v.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Vendors can create own payouts"
  ON public.payout_requests FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = payout_requests.vendor_id AND v.user_id = auth.uid())
  );

CREATE POLICY "Admins can update payouts"
  ON public.payout_requests FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_payout_requests_updated_at
  BEFORE UPDATE ON public.payout_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Admin override policies on bookings (cancel/manage disputes)
CREATE POLICY "Admins can update any booking"
  ON public.bookings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete bookings"
  ON public.bookings FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- 7) Admin can view all profiles via has_role (already public select), but ensure user_roles admin can view all
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 8) Function to compute totals from settings
CREATE OR REPLACE FUNCTION public.compute_payment_split(_amount NUMERIC)
RETURNS TABLE(vat NUMERIC, platform_fee NUMERIC, vendor_net NUMERIC, total NUMERIC)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  s RECORD;
BEGIN
  SELECT commission_percent, vat_percent INTO s FROM public.platform_settings ORDER BY updated_at DESC LIMIT 1;
  IF s IS NULL THEN
    s.commission_percent := 12; s.vat_percent := 15;
  END IF;
  vat := ROUND(_amount * s.vat_percent / 100, 2);
  platform_fee := ROUND(_amount * s.commission_percent / 100, 2);
  vendor_net := _amount - platform_fee;
  total := _amount + vat;
  RETURN NEXT;
END;
$$;