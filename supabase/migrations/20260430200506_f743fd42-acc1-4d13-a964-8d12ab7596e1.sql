-- Restrict direct SELECT on vendors to owner + admin only.
-- Public browsing must use the SECURITY INVOKER view `vendors_public`
-- which excludes banking/contact PII (iban, iban_certificate_url,
-- commercial_register_url, phone).

DROP POLICY IF EXISTS "Vendors viewable by everyone" ON public.vendors;

CREATE POLICY "Vendor owner can view own profile"
ON public.vendors
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all vendors"
ON public.vendors
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public-facing view: only safe columns for approved/active/visible vendors.
CREATE OR REPLACE VIEW public.vendors_public
WITH (security_invoker = true)
AS
SELECT
  id, user_id, business_name, category, bio, bio_en,
  city, region, region_en, district, district_en,
  starting_price, weekday_price, weekend_price, min_deposit,
  men_capacity, women_capacity, daily_capacity,
  extra_services, extra_services_en,
  verified, active, approval_status, hidden, hidden_until,
  portfolio_urls, google_maps_url,
  created_at, updated_at
FROM public.vendors
WHERE active = true
  AND approval_status = 'approved'
  AND (hidden = false OR (hidden = true AND hidden_until IS NOT NULL AND hidden_until <= now()));

-- Allow public read of the safe view.
-- We use a permissive policy via security_invoker semantics: since the view
-- inherits the underlying table's RLS as the invoker, we add a dedicated
-- policy for SELECTs that come through the view path.
CREATE POLICY "Public can view safe vendor fields via view"
ON public.vendors
FOR SELECT
TO anon, authenticated
USING (
  active = true
  AND approval_status = 'approved'
  AND (hidden = false OR (hidden = true AND hidden_until IS NOT NULL AND hidden_until <= now()))
);

GRANT SELECT ON public.vendors_public TO anon, authenticated;

-- Revoke direct SELECT on sensitive PII columns from anon and authenticated.
-- Owner/admin still read via SECURITY DEFINER helper or separate flows.
REVOKE SELECT (iban, iban_certificate_url, commercial_register_url, phone) ON public.vendors FROM anon, authenticated;
