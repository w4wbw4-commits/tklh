-- Add slots config (array of {category, count}) and eligible vendor list
ALTER TABLE public.platform_packages
  ADD COLUMN IF NOT EXISTS slots jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS eligible_vendor_ids uuid[] NOT NULL DEFAULT '{}'::uuid[];

-- Helpful index for filtering packages by eligible vendor
CREATE INDEX IF NOT EXISTS idx_platform_packages_eligible_vendors
  ON public.platform_packages USING gin (eligible_vendor_ids);