ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_email text;
ALTER TABLE public.customer_leads ADD COLUMN IF NOT EXISTS contact_email text;