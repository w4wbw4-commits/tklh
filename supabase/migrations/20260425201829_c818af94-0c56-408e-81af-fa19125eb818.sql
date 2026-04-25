-- Bilingual fields for admin-managed dynamic content shown to customers.
-- Arabic remains the source of truth in existing columns; *_en columns hold
-- optional English equivalents for Tasks 2/3 of the localization sweep.

-- Platform packages (Tekillah curated bundles shown on Home + Wizard)
ALTER TABLE public.platform_packages
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS includes_en TEXT[] NOT NULL DEFAULT '{}'::text[];

-- Vendors (region/district + extra services shown on vendor cards)
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS region_en TEXT,
  ADD COLUMN IF NOT EXISTS district_en TEXT,
  ADD COLUMN IF NOT EXISTS extra_services_en TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS bio_en TEXT;

-- Vendor packages (legacy per-vendor packages, still used in some flows)
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS includes_en TEXT[] NOT NULL DEFAULT '{}'::text[];