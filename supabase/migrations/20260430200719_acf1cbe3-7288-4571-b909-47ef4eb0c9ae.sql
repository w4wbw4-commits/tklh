-- Admin helper: list pending vendors with their sensitive verification fields.
-- Only callable by admins.
CREATE OR REPLACE FUNCTION public.admin_list_pending_vendor_verifications()
RETURNS TABLE (
  id uuid,
  business_name text,
  category text,
  city text,
  phone text,
  bio text,
  iban text,
  iban_certificate_url text,
  commercial_register_url text,
  google_maps_url text,
  portfolio_urls text[],
  starting_price numeric,
  daily_capacity integer,
  approval_status approval_status,
  rejection_reason text,
  created_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
    SELECT v.id, v.business_name, v.category::text, v.city, v.phone, v.bio,
           v.iban, v.iban_certificate_url, v.commercial_register_url,
           v.google_maps_url, v.portfolio_urls, v.starting_price,
           v.daily_capacity, v.approval_status, v.rejection_reason, v.created_at
    FROM public.vendors v
    WHERE v.approval_status = 'pending_approval'
    ORDER BY v.created_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_pending_vendor_verifications() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_pending_vendor_verifications() TO authenticated;

-- Admin helper: list approved vendors with sensitive docs (for grand control).
CREATE OR REPLACE FUNCTION public.admin_list_pending_vendor_docs()
RETURNS TABLE (
  id uuid,
  business_name text,
  iban_certificate_url text,
  commercial_register_url text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
    SELECT v.id, v.business_name, v.iban_certificate_url, v.commercial_register_url
    FROM public.vendors v
    WHERE v.approval_status = 'pending_approval';
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_list_pending_vendor_docs() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_pending_vendor_docs() TO authenticated;
