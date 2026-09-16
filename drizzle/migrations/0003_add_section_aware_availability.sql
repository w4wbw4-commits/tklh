DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_section' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.booking_section AS ENUM ('men', 'women', 'both');
  END IF;
END
$$;

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS booking_section public.booking_section;

ALTER TABLE public.vendor_availability
  ADD COLUMN IF NOT EXISTS men_status public.availability_status,
  ADD COLUMN IF NOT EXISTS women_status public.availability_status;

UPDATE public.bookings
SET booking_section = 'both'
WHERE booking_section IS NULL;

UPDATE public.vendor_availability AS va
SET men_status = va.status,
    women_status = va.status
FROM public.vendors AS v
WHERE v.id = va.vendor_id
  AND v.category IN ('hall', 'photography')
  AND va.men_status IS NULL
  AND va.women_status IS NULL;

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
        WHEN bool_or(status = 'pending' AND booking_section IN ('men', 'both')) THEN 'pending'::public.availability_status
        WHEN bool_or(status = 'confirmed' AND booking_section IN ('men', 'both')) THEN 'booked'::public.availability_status
        ELSE NULL
      END,
      CASE
        WHEN bool_or(status = 'pending' AND booking_section IN ('women', 'both')) THEN 'pending'::public.availability_status
        WHEN bool_or(status = 'confirmed' AND booking_section IN ('women', 'both')) THEN 'booked'::public.availability_status
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

CREATE OR REPLACE FUNCTION public.handle_new_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vendor_user uuid;
  vendor_name text;
BEGIN
  PERFORM public.refresh_booking_availability(NEW.vendor_id, NEW.event_date);

  SELECT user_id, business_name INTO vendor_user, vendor_name
  FROM public.vendors WHERE id = NEW.vendor_id;

  IF vendor_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (
      vendor_user,
      'booking_request',
      'طلب حجز جديد',
      'لديك طلب حجز جديد بتاريخ ' || NEW.event_date::text
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_booking_availability()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.booking_section IS DISTINCT FROM OLD.booking_section
     OR NEW.event_date IS DISTINCT FROM OLD.event_date
     OR NEW.vendor_id IS DISTINCT FROM OLD.vendor_id THEN
    PERFORM public.refresh_booking_availability(OLD.vendor_id, OLD.event_date);
    PERFORM public.refresh_booking_availability(NEW.vendor_id, NEW.event_date);
  END IF;
  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_booking_availability(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.refresh_booking_availability(uuid, date) TO service_role;