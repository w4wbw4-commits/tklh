-- Trigger functions never need direct callers; keep them off the public API.
REVOKE ALL ON FUNCTION public.limit_planner_interest_rate() FROM anon, authenticated;