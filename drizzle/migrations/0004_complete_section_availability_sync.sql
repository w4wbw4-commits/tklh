ALTER TABLE public.bookings
  ALTER COLUMN booking_section SET DEFAULT 'both'::public.booking_section;

CREATE OR REPLACE FUNCTION public.refresh_booking_availability(
  _vendor_id uuid,
  _event_date date
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_dual boolean;
  _men_status public.availability_status;
  _women_status public.availability_status;
  _overall_status public.availability_status;
  _single_booking_id uuid;
BEGIN
  SELECT category IN ('hall', 'photography')
  INTO _is_dual
  FROM public.vendors
  WHERE id = _vendor_id;

  IF NOT EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE vendor_id = _vendor_id
      AND event_date = _event_date
      AND status IN ('pending', 'confirmed')
  ) THEN
    DELETE FROM public.vendor_availability
    WHERE vendor_id = _vendor_id
      AND date = _event_date
      AND booking_id IS NOT NULL;
    RETURN;
  END IF;

  IF _is_dual THEN
    SELECT
      CASE
        WHEN bool_or(status = 'pending' AND COALESCE(booking_section, 'both') IN ('men', 'both')) THEN 'pending'::public.availability_status
        WHEN bool_or(status = 'confirmed' AND COALESCE(booking_section, 'both') IN ('men', 'both')) THEN 'booked'::public.availability_status
        ELSE NULL
      END,
      CASE
        WHEN bool_or(status = 'pending' AND COALESCE(booking_section, 'both') IN ('women', 'both')) THEN 'pending'::public.availability_status
        WHEN bool_or(status = 'confirmed' AND COALESCE(booking_section, 'both') IN ('women', 'both')) THEN 'booked'::public.availability_status
        ELSE NULL
      END
    INTO _men_status, _women_status
    FROM public.bookings
    WHERE vendor_id = _vendor_id
      AND event_date = _event_date
      AND status IN ('pending', 'confirmed');

    _overall_status := CASE
      WHEN _men_status = 'pending' OR _women_status = 'pending' THEN 'pending'::public.availability_status
      ELSE 'booked'::public.availability_status
    END;
  ELSE
    SELECT CASE
      WHEN bool_or(status = 'pending') THEN 'pending'::public.availability_status
      ELSE 'booked'::public.availability_status
    END
    INTO _overall_status
    FROM public.bookings
    WHERE vendor_id = _vendor_id
      AND event_date = _event_date
      AND status IN ('pending', 'confirmed');

    _men_status := NULL;
    _women_status := NULL;
  END IF;

  SELECT id
  INTO _single_booking_id
  FROM public.bookings
  WHERE vendor_id = _vendor_id
    AND event_date = _event_date
    AND status IN ('pending', 'confirmed')
  ORDER BY created_at DESC
  LIMIT 1;

  INSERT INTO public.vendor_availability (
    vendor_id, date, status, booking_id, note, men_status, women_status
  )
  VALUES (
    _vendor_id,
    _event_date,
    _overall_status,
    _single_booking_id,
    CASE WHEN _overall_status = 'pending' THEN 'حجز بانتظار دفع العربون' ELSE 'محجوز' END,
    _men_status,
    _women_status
  )
  ON CONFLICT (vendor_id, date) DO UPDATE
  SET status = EXCLUDED.status,
      booking_id = EXCLUDED.booking_id,
      note = EXCLUDED.note,
      men_status = EXCLUDED.men_status,
      women_status = EXCLUDED.women_status;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_deleted_booking_availability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.refresh_booking_availability(OLD.vendor_id, OLD.event_date);
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS on_booking_deleted ON public.bookings;
CREATE TRIGGER on_booking_deleted
  AFTER DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.sync_deleted_booking_availability();

GRANT EXECUTE ON FUNCTION public.sync_deleted_booking_availability() TO service_role;