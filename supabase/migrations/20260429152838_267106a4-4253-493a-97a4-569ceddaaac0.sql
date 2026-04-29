-- ===== 1. Vendor Invoices (ZATCA-compliant) =====
CREATE TABLE public.vendor_invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  booking_id UUID,
  invoice_number TEXT NOT NULL UNIQUE,
  customer_name TEXT,
  customer_phone TEXT,
  customer_vat_number TEXT,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  subtotal NUMERIC NOT NULL DEFAULT 0,
  vat_amount NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'issued',
  source TEXT NOT NULL DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendor manages own invoices"
ON public.vendor_invoices FOR ALL
USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_invoices.vendor_id AND v.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_invoices.vendor_id AND v.user_id = auth.uid()));

CREATE POLICY "Admins manage all invoices"
ON public.vendor_invoices FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_vendor_invoices_updated
BEFORE UPDATE ON public.vendor_invoices
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_vendor_invoices_vendor ON public.vendor_invoices(vendor_id, issue_date DESC);

-- Sequence + helper for invoice numbers
CREATE SEQUENCE IF NOT EXISTS public.vendor_invoice_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_vendor_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_n BIGINT;
BEGIN
  next_n := nextval('public.vendor_invoice_seq');
  RETURN 'INV-' || to_char(now(), 'YYYYMM') || '-' || lpad(next_n::TEXT, 4, '0');
END;
$$;

-- ===== 2. Vendor Pricing Rules =====
CREATE TYPE public.pricing_rule_type AS ENUM ('weekend', 'weekday', 'seasonal');

CREATE TABLE public.vendor_pricing_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL,
  rule_type public.pricing_rule_type NOT NULL,
  label TEXT,
  adjustment_percent NUMERIC NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.vendor_pricing_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pricing rules viewable by everyone"
ON public.vendor_pricing_rules FOR SELECT
USING (true);

CREATE POLICY "Vendor manages own pricing rules"
ON public.vendor_pricing_rules FOR ALL
USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_pricing_rules.vendor_id AND v.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_pricing_rules.vendor_id AND v.user_id = auth.uid()));

CREATE POLICY "Admins manage all pricing rules"
ON public.vendor_pricing_rules FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_vendor_pricing_updated
BEFORE UPDATE ON public.vendor_pricing_rules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_pricing_rules_vendor ON public.vendor_pricing_rules(vendor_id);

-- ===== 3. Booking Checklists =====
CREATE TYPE public.checklist_category AS ENUM ('catering', 'decoration', 'staff', 'logistics', 'other');

CREATE TABLE public.booking_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  category public.checklist_category NOT NULL DEFAULT 'other',
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendor manages own booking checklists"
ON public.booking_checklists FOR ALL
USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = booking_checklists.vendor_id AND v.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = booking_checklists.vendor_id AND v.user_id = auth.uid()));

CREATE POLICY "Customer can view own booking checklists"
ON public.booking_checklists FOR SELECT
USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = booking_checklists.booking_id AND b.customer_id = auth.uid()));

CREATE POLICY "Admins manage all checklists"
ON public.booking_checklists FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_booking_checklists_updated
BEFORE UPDATE ON public.booking_checklists
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_booking_checklists_booking ON public.booking_checklists(booking_id);
CREATE INDEX idx_booking_checklists_vendor ON public.booking_checklists(vendor_id);