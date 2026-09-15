ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS men_weekday_price numeric;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS men_weekend_price numeric;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS women_weekday_price numeric;
ALTER TABLE public.vendors ADD COLUMN IF NOT EXISTS women_weekend_price numeric;

GRANT SELECT (men_weekday_price, men_weekend_price, women_weekday_price, women_weekend_price) ON public.vendors TO authenticated, anon;
GRANT UPDATE (men_weekday_price, men_weekend_price, women_weekday_price, women_weekend_price) ON public.vendors TO authenticated;
GRANT INSERT (men_weekday_price, men_weekend_price, women_weekday_price, women_weekend_price) ON public.vendors TO authenticated;
GRANT ALL ON public.vendors TO service_role;