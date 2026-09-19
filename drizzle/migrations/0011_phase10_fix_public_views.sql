-- Phase 10 QA fix: the two "public projection" views were marked
-- security_invoker=true, so they inherited the admin-only / stakeholder-only
-- RLS + grants of their base tables and returned "permission denied" for
-- ordinary visitors. Both expose non-sensitive projections only
-- (VAT %, currency, VAT number; aggregate vendor ratings), so they run as
-- their owner and are readable by anon + authenticated.
ALTER VIEW public.platform_settings_public SET (security_invoker = false);
ALTER VIEW public.vendor_ratings_summary SET (security_invoker = false);

GRANT SELECT ON public.platform_settings_public TO anon, authenticated;
GRANT SELECT ON public.vendor_ratings_summary TO anon, authenticated;
