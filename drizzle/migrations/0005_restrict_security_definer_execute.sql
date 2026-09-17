-- Lock down SECURITY DEFINER helper functions so anonymous visitors cannot
-- call them. Trigger execution is unaffected (Postgres checks EXECUTE at
-- CREATE TRIGGER time, and triggers run as the table owner).

-- Admin-only listings: already self-check has_role, but should never be
-- reachable without a session.
REVOKE ALL ON FUNCTION public.admin_list_pending_vendor_docs() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_pending_vendor_docs() TO authenticated, service_role;

REVOKE ALL ON FUNCTION public.admin_list_pending_vendor_verifications() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_pending_vendor_verifications() TO authenticated, service_role;

-- Payment split helper: used during checkout by signed-in customers only.
REVOKE ALL ON FUNCTION public.compute_payment_split(numeric) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.compute_payment_split(numeric) TO authenticated, service_role;

-- Invoice numbering consumes a sequence: signed-in partners only.
REVOKE ALL ON FUNCTION public.generate_vendor_invoice_number() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_vendor_invoice_number() TO authenticated, service_role;

-- Availability recompute is an internal trigger helper: no client may call it.
REVOKE ALL ON FUNCTION public.refresh_booking_availability(uuid, date) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_booking_availability(uuid, date) TO service_role;
