
-- 1) Vendors: public-safe view + drop broad anon/auth SELECT policy
DROP VIEW IF EXISTS public.vendors_public CASCADE;
CREATE VIEW public.vendors_public
WITH (security_invoker = false) AS
SELECT
  id, user_id, business_name, category, bio, bio_en, city,
  region, region_en, district, district_en,
  portfolio_urls, google_maps_url, daily_capacity,
  starting_price, weekday_price, weekend_price, min_deposit,
  men_capacity, women_capacity, extra_services, extra_services_en,
  verified, active, approval_status, hidden, hidden_until,
  created_at, updated_at
FROM public.vendors
WHERE active = true
  AND approval_status = 'approved'
  AND (hidden = false OR (hidden = true AND hidden_until IS NOT NULL AND hidden_until <= now()));

GRANT SELECT ON public.vendors_public TO anon, authenticated;

DROP POLICY IF EXISTS "Public can view safe vendor fields via view" ON public.vendors;

-- 2) Platform settings: hide commission + auto_release_days from public
DROP VIEW IF EXISTS public.platform_settings_public CASCADE;
CREATE VIEW public.platform_settings_public
WITH (security_invoker = false) AS
SELECT vat_percent, currency, vat_number
FROM public.platform_settings
ORDER BY updated_at DESC
LIMIT 1;

GRANT SELECT ON public.platform_settings_public TO anon, authenticated;

DROP POLICY IF EXISTS "Settings viewable by everyone" ON public.platform_settings;

CREATE POLICY "Admins can view settings"
  ON public.platform_settings FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Realtime broadcast: scope INSERT to owner/vendor/admin (mirror SELECT)
DROP POLICY IF EXISTS "Authenticated can publish realtime" ON realtime.messages;

CREATE POLICY "Authenticated can publish realtime scoped"
  ON realtime.messages FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      realtime.topic() LIKE 'bookings:%'
      AND EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id::text = split_part(realtime.topic(), ':', 2)
          AND (
            b.customer_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.vendors v
              WHERE v.id = b.vendor_id AND v.user_id = auth.uid()
            )
            OR public.has_role(auth.uid(), 'admin'::app_role)
          )
      )
    )
    OR (
      realtime.topic() LIKE 'payments:%'
      AND EXISTS (
        SELECT 1 FROM public.payments p
        WHERE p.id::text = split_part(realtime.topic(), ':', 2)
          AND (
            p.customer_id = auth.uid()
            OR EXISTS (
              SELECT 1 FROM public.vendors v
              WHERE v.id = p.vendor_id AND v.user_id = auth.uid()
            )
            OR public.has_role(auth.uid(), 'admin'::app_role)
          )
      )
    )
    OR (
      realtime.topic() NOT LIKE 'bookings:%'
      AND realtime.topic() NOT LIKE 'payments:%'
    )
  );
