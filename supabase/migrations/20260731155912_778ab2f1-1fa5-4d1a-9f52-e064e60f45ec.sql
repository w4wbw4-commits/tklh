-- 1) vendor_availability: scope reads to owner vendor, related customer, or admin
DROP POLICY IF EXISTS "Availability viewable by authenticated" ON public.vendor_availability;
CREATE POLICY "Availability viewable by vendor, customer or admin"
ON public.vendor_availability
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin')
  OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_availability.vendor_id AND v.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.bookings b WHERE b.id = vendor_availability.booking_id AND b.customer_id = auth.uid())
);

-- 2) vendor_pricing_rules: remove anonymous/public read
DROP POLICY IF EXISTS "Pricing rules viewable by everyone" ON public.vendor_pricing_rules;
REVOKE SELECT ON public.vendor_pricing_rules FROM anon;

-- 3) Replace SECURITY DEFINER views with security_invoker views backed by
--    column-level grants + row policies.

-- 3a) vendors
REVOKE SELECT ON public.vendors FROM anon, authenticated;
GRANT SELECT (
  id, user_id, business_name, category, bio, bio_en, city, region, region_en,
  district, district_en, portfolio_urls, google_maps_url, daily_capacity,
  starting_price, weekday_price, weekend_price, min_deposit, men_capacity,
  women_capacity, extra_services, extra_services_en, verified, active,
  approval_status, rejection_reason, hidden, hidden_until, created_at, updated_at
) ON public.vendors TO anon, authenticated;
GRANT ALL ON public.vendors TO service_role;

DROP POLICY IF EXISTS "Public can view approved active vendors" ON public.vendors;
CREATE POLICY "Public can view approved active vendors"
ON public.vendors
FOR SELECT
TO anon, authenticated
USING (
  active = true
  AND approval_status = 'approved'::approval_status
  AND (hidden = false OR (hidden = true AND hidden_until IS NOT NULL AND hidden_until <= now()))
);

ALTER VIEW public.vendors_public SET (security_invoker = true);

-- 3b) platform_settings
REVOKE SELECT ON public.platform_settings FROM anon, authenticated;
GRANT SELECT (vat_percent, currency, vat_number, updated_at) ON public.platform_settings TO anon, authenticated;
GRANT ALL ON public.platform_settings TO service_role;

DROP POLICY IF EXISTS "Public can read safe settings" ON public.platform_settings;
CREATE POLICY "Public can read safe settings"
ON public.platform_settings
FOR SELECT
TO anon, authenticated
USING (true);

ALTER VIEW public.platform_settings_public SET (security_invoker = true);