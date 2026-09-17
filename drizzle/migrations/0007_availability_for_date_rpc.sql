-- Single source of truth for availability reads by the customer catalog.
-- vendor_availability itself is readable only by the owning vendor, the booking
-- customer, or an admin. Customer search needs the *availability state only*
-- (no PII, no booking ids), so expose exactly those four columns for a date
-- range through a SECURITY DEFINER function.
CREATE OR REPLACE FUNCTION public.availability_for_dates(_from date, _to date)
RETURNS TABLE (
  vendor_id uuid,
  date date,
  status public.availability_status,
  men_status public.availability_status,
  women_status public.availability_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT va.vendor_id, va.date, va.status, va.men_status, va.women_status
  FROM public.vendor_availability va
  WHERE va.date >= _from
    AND va.date <= _to
$$;

REVOKE ALL ON FUNCTION public.availability_for_dates(date, date) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.availability_for_dates(date, date) TO anon, authenticated, service_role;