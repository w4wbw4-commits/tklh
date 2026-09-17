-- Server-side guard against double booking. The availability table remains the
-- single source of truth for display; this trigger makes the same rules
-- authoritative at write time (concurrent requests, direct API calls).
CREATE OR REPLACE FUNCTION public.prevent_double_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  _is_dual boolean;
  _new_sec text;
  _conflict integer;
  _blocked integer;
BEGIN
  IF NEW.status NOT IN ('pending', 'confirmed') THEN
    RETURN NEW;
  END IF;

  SELECT category IN ('hall', 'photography') INTO _is_dual
  FROM public.vendors WHERE id = NEW.vendor_id;

  IF COALESCE(_is_dual, false) THEN
    _new_sec := COALESCE(NEW.booking_section::text, 'both');
  ELSE
    _new_sec := 'both';
  END IF;

  -- Another live booking holding an overlapping section on the same day.
  SELECT count(*) INTO _conflict
  FROM public.bookings b
  WHERE b.vendor_id = NEW.vendor_id
    AND b.event_date = NEW.event_date
    AND b.id IS DISTINCT FROM NEW.id
    AND b.status IN ('pending', 'confirmed')
    AND (
      NOT COALESCE(_is_dual, false)
      OR _new_sec = 'both'
      OR COALESCE(b.booking_section::text, 'both') = 'both'
      OR COALESCE(b.booking_section::text, 'both') = _new_sec
    );

  IF _conflict > 0 THEN
    RAISE EXCEPTION 'booking_conflict: this date/section is already held for this vendor';
  END IF;

  -- The vendor's own manual block on that day/section.
  SELECT count(*) INTO _blocked
  FROM public.vendor_availability va
  WHERE va.vendor_id = NEW.vendor_id
    AND va.date = NEW.event_date
    AND va.booking_id IS NULL
    AND (
      (va.men_status IS NULL AND va.women_status IS NULL AND va.status = 'blocked')
      OR (_new_sec IN ('men', 'both') AND va.men_status = 'blocked')
      OR (_new_sec IN ('women', 'both') AND va.women_status = 'blocked')
    );

  IF _blocked > 0 THEN
    RAISE EXCEPTION 'date_blocked: the vendor blocked this date/section';
  END IF;

  RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.prevent_double_booking() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS trg_prevent_double_booking ON public.bookings;
CREATE TRIGGER trg_prevent_double_booking
BEFORE INSERT OR UPDATE OF vendor_id, event_date, booking_section, status ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.prevent_double_booking();