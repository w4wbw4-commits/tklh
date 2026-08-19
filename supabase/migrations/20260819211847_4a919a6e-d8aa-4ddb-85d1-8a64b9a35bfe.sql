-- Tighten planner_interest privileges: visitors may only submit, never modify or erase.
REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.planner_interest FROM anon;
REVOKE UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.planner_interest FROM authenticated;
GRANT INSERT ON public.planner_interest TO anon;
GRANT INSERT, SELECT ON public.planner_interest TO authenticated;
GRANT ALL ON public.planner_interest TO service_role;

-- Server-side flood guard: at most 3 submissions per phone per hour, 20 per hour overall.
CREATE OR REPLACE FUNCTION public.limit_planner_interest_rate()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  per_phone integer;
  overall integer;
BEGIN
  SELECT count(*) INTO per_phone
  FROM public.planner_interest
  WHERE phone = NEW.phone AND created_at > now() - interval '1 hour';

  IF per_phone >= 3 THEN
    RAISE EXCEPTION 'rate_limited: too many submissions for this phone, please try again later';
  END IF;

  SELECT count(*) INTO overall
  FROM public.planner_interest
  WHERE created_at > now() - interval '1 hour';

  IF overall >= 200 THEN
    RAISE EXCEPTION 'rate_limited: too many submissions right now, please try again later';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_limit_planner_interest_rate ON public.planner_interest;
CREATE TRIGGER trg_limit_planner_interest_rate
BEFORE INSERT ON public.planner_interest
FOR EACH ROW EXECUTE FUNCTION public.limit_planner_interest_rate();

-- Visitors should not be able to create or delete vendor rows anonymously.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.vendors FROM anon;