-- Reverse the previous regrant: authenticated must NOT have direct column
-- access to the sensitive PII columns, otherwise any logged-in user could
-- read every approved vendor's IBAN. Owners and admins read these via the
-- SECURITY DEFINER helper `get_vendor_private`.
REVOKE SELECT (iban, iban_certificate_url, commercial_register_url, phone)
ON public.vendors FROM authenticated;

CREATE OR REPLACE FUNCTION public.get_vendor_private(_vendor_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  iban text,
  iban_certificate_url text,
  commercial_register_url text,
  phone text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.id, v.user_id, v.iban, v.iban_certificate_url, v.commercial_register_url, v.phone
  FROM public.vendors v
  WHERE v.id = _vendor_id
    AND (v.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));
$$;

REVOKE EXECUTE ON FUNCTION public.get_vendor_private(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_vendor_private(uuid) TO authenticated;
