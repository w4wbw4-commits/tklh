
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS weekday_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS weekend_price numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_deposit numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS men_capacity integer,
  ADD COLUMN IF NOT EXISTS women_capacity integer;

-- Backfill weekday/weekend pricing from the legacy starting_price so existing
-- vendors keep working visually while they migrate to the new tiered fields.
UPDATE public.vendors
SET weekday_price = COALESCE(NULLIF(weekday_price, 0), starting_price),
    weekend_price = COALESCE(NULLIF(weekend_price, 0), starting_price)
WHERE weekday_price = 0 OR weekend_price = 0;
