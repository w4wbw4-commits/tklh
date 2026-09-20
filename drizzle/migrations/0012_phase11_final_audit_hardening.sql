-- Final audit hardening.
-- 1) The admin-only approval RPC must not be callable by anonymous visitors.
--    It already raises 'forbidden' via has_role(), but removing the grant keeps
--    unauthenticated callers out of the function entirely.
REVOKE EXECUTE ON FUNCTION public.approve_vendor_application(uuid) FROM anon;

-- 2) Index the foreign keys that had no supporting index. These back joins and
--    cascading lookups used by the customer dashboard and lead views.
CREATE INDEX IF NOT EXISTS idx_bookings_package_id ON public.bookings (package_id);
CREATE INDEX IF NOT EXISTS idx_customer_leads_booking_id ON public.customer_leads (booking_id);
CREATE INDEX IF NOT EXISTS idx_customer_leads_event_id ON public.customer_leads (event_id);
CREATE INDEX IF NOT EXISTS idx_timeline_milestones_event_id ON public.timeline_milestones (event_id);