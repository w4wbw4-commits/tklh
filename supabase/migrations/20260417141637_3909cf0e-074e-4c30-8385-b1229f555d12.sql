
ALTER TABLE public.vendors DROP CONSTRAINT IF EXISTS vendors_user_id_key;
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON public.vendors(user_id);
