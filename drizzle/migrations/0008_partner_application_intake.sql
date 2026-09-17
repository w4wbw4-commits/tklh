-- Phase 3: partner registration intake + approval workflow.
-- Additive only: every new column is nullable or has a default.

ALTER TABLE public.vendor_applications
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS business_name text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS commercial_register_url text,
  ADD COLUMN IF NOT EXISTS identity_document_url text,
  ADD COLUMN IF NOT EXISTS vat_number text,
  ADD COLUMN IF NOT EXISTS contact_whatsapp text,
  ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS gallery_urls text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS portfolio_urls text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS services text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS service_areas text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS starting_price numeric,
  ADD COLUMN IF NOT EXISTS supports_men boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS supports_women boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sections_independent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS vendor_id uuid;

CREATE INDEX IF NOT EXISTS vendor_applications_user_id_idx ON public.vendor_applications (user_id);

-- Applicants may read their own application (to see pending / changes / rejected)
DROP POLICY IF EXISTS "Applicant can view own application" ON public.vendor_applications;
CREATE POLICY "Applicant can view own application"
  ON public.vendor_applications FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Applicants may update their own application only while it is not yet decided
DROP POLICY IF EXISTS "Applicant can update own pending application" ON public.vendor_applications;
CREATE POLICY "Applicant can update own pending application"
  ON public.vendor_applications FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status IN ('new', 'contacted'))
  WITH CHECK (user_id = auth.uid());

-- Submissions may never be attributed to another user
DROP POLICY IF EXISTS "Anyone can submit an application" ON public.vendor_applications;
CREATE POLICY "Anyone can submit an application"
  ON public.vendor_applications FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

GRANT SELECT, INSERT, UPDATE ON public.vendor_applications TO authenticated;
GRANT INSERT ON public.vendor_applications TO anon;
GRANT ALL ON public.vendor_applications TO service_role;

-- Approval: the only path that creates the vendor profile and grants the role.
CREATE OR REPLACE FUNCTION public.approve_vendor_application(_application_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  app RECORD;
  v_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  SELECT * INTO app FROM public.vendor_applications WHERE id = _application_id;
  IF app IS NULL THEN RAISE EXCEPTION 'application_not_found'; END IF;
  IF app.user_id IS NULL THEN RAISE EXCEPTION 'application_has_no_account'; END IF;

  SELECT id INTO v_id FROM public.vendors WHERE user_id = app.user_id LIMIT 1;

  IF v_id IS NULL THEN
    INSERT INTO public.vendors (
      user_id, business_name, category, bio, city, region, district, phone,
      commercial_register_url, vat_number, google_maps_url, portfolio_urls,
      extra_services, starting_price, men_capacity, women_capacity,
      approval_status, active, verified
    ) VALUES (
      app.user_id,
      COALESCE(NULLIF(app.business_name, ''), app.full_name),
      app.service_type,
      app.description,
      app.city,
      app.region,
      app.address,
      app.phone,
      app.commercial_register_url,
      app.vat_number,
      NULL,
      app.portfolio_urls,
      app.services,
      COALESCE(app.starting_price, 0),
      CASE WHEN app.supports_men THEN 0 ELSE NULL END,
      CASE WHEN app.supports_women THEN 0 ELSE NULL END,
      'approved'::approval_status,
      true,
      true
    )
    RETURNING id INTO v_id;
  ELSE
    UPDATE public.vendors
    SET approval_status = 'approved'::approval_status,
        verified = true,
        active = true,
        reviewed_by = auth.uid(),
        reviewed_at = now()
    WHERE id = v_id;
  END IF;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (app.user_id, 'vendor')
  ON CONFLICT DO NOTHING;

  UPDATE public.vendor_applications
  SET status = 'approved'::vendor_application_status,
      vendor_id = v_id,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  WHERE id = _application_id;

  INSERT INTO public.notifications (user_id, type, title, body)
  VALUES (app.user_id, 'general', '🎉 تم قبول طلب انضمامك',
          'أصبح حسابك كمزوّد خدمة مفعّلاً. يمكنك الآن الدخول إلى لوحة تحكم الشريك.');

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.approve_vendor_application(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.approve_vendor_application(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_vendor_application(uuid) TO service_role;
