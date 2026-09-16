CREATE TABLE public.vendor_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  month date NOT NULL,
  kind text NOT NULL DEFAULT 'operating',
  label text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX vendor_expenses_vendor_month_idx ON public.vendor_expenses (vendor_id, month);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.vendor_expenses TO authenticated;
GRANT ALL ON public.vendor_expenses TO service_role;

ALTER TABLE public.vendor_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors manage own expenses"
ON public.vendor_expenses
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_expenses.vendor_id AND v.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_expenses.vendor_id AND v.user_id = auth.uid()));

CREATE POLICY "Admins read expenses"
ON public.vendor_expenses
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER vendor_expenses_updated_at
BEFORE UPDATE ON public.vendor_expenses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();