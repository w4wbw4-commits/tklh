ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS vat_number text;
ALTER TABLE public.vendor_invoices ADD COLUMN IF NOT EXISTS vendor_vat_number text;

GRANT SELECT (vat_number) ON public.vendors TO authenticated, anon;
GRANT UPDATE (vat_number) ON public.vendors TO authenticated;
GRANT INSERT (vat_number) ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;
GRANT ALL ON public.vendor_invoices TO service_role;