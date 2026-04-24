-- Track which admin-curated platform package was booked (fast-track flow)
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS platform_package_id uuid REFERENCES public.platform_packages(id) ON DELETE SET NULL;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS platform_package_id uuid REFERENCES public.platform_packages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_events_platform_package_id ON public.events(platform_package_id);
CREATE INDEX IF NOT EXISTS idx_bookings_platform_package_id ON public.bookings(platform_package_id);