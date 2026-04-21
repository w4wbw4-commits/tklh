-- Add attendance tracking on bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS attendance_confirmed_at timestamptz,
  ADD COLUMN IF NOT EXISTS attendance_confirmed_by uuid;

-- Emergency report kind enum
DO $$ BEGIN
  CREATE TYPE public.emergency_kind AS ENUM ('delay', 'cancellation', 'no_show', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.emergency_status AS ENUM ('open', 'in_progress', 'resolved');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Emergency requests table (delay/cancellation reports + replacement help)
CREATE TABLE IF NOT EXISTS public.emergency_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL,
  booking_id uuid NOT NULL,
  vendor_id uuid NOT NULL,
  event_id uuid,
  kind public.emergency_kind NOT NULL DEFAULT 'delay',
  details text,
  needs_replacement boolean NOT NULL DEFAULT false,
  status public.emergency_status NOT NULL DEFAULT 'open',
  resolved_at timestamptz,
  resolved_by uuid,
  resolution_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;

-- Customer can create their own
CREATE POLICY "Customer creates own emergency"
ON public.emergency_requests FOR INSERT
WITH CHECK (auth.uid() = customer_id);

-- Customer/vendor/admin can view
CREATE POLICY "Stakeholders view emergency"
ON public.emergency_requests FOR SELECT
USING (
  auth.uid() = customer_id
  OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = emergency_requests.vendor_id AND v.user_id = auth.uid())
  OR public.has_role(auth.uid(), 'admin')
);

-- Customer can update their own (e.g., add notes) while open
CREATE POLICY "Customer updates own emergency"
ON public.emergency_requests FOR UPDATE
USING (auth.uid() = customer_id);

-- Admin can update any
CREATE POLICY "Admin updates emergency"
ON public.emergency_requests FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER emergency_requests_set_updated
BEFORE UPDATE ON public.emergency_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notify admins + vendor when emergency is filed
CREATE OR REPLACE FUNCTION public.notify_on_emergency()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vendor_user uuid;
  vendor_name text;
BEGIN
  SELECT user_id, business_name INTO vendor_user, vendor_name
  FROM public.vendors WHERE id = NEW.vendor_id;

  -- Notify admins
  INSERT INTO public.notifications (user_id, type, title, body)
  SELECT ur.user_id, 'general',
         '🚨 بلاغ طارئ من عميل',
         'تم تقديم بلاغ (' || NEW.kind::text || ') على المزوّد ' || COALESCE(vendor_name,'—') ||
         CASE WHEN NEW.needs_replacement THEN ' — يطلب العميل مزوداً بديلاً.' ELSE '' END
  FROM public.user_roles ur WHERE ur.role = 'admin';

  -- Notify vendor
  IF vendor_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (vendor_user, 'general', 'بلاغ من العميل',
      'تم تسجيل بلاغ (' || NEW.kind::text || ') على حجزك. يرجى التواصل فوراً.');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_emergency ON public.emergency_requests;
CREATE TRIGGER trg_notify_on_emergency
AFTER INSERT ON public.emergency_requests
FOR EACH ROW EXECUTE FUNCTION public.notify_on_emergency();

-- Notify customer when vendor confirms attendance
CREATE OR REPLACE FUNCTION public.notify_on_attendance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vendor_name text;
BEGIN
  IF NEW.attendance_confirmed_at IS DISTINCT FROM OLD.attendance_confirmed_at
     AND NEW.attendance_confirmed_at IS NOT NULL THEN
    SELECT business_name INTO vendor_name FROM public.vendors WHERE id = NEW.vendor_id;
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (NEW.customer_id, 'general',
      '✅ وصل المزوّد',
      COALESCE(vendor_name,'المزوّد') || ' أكّد الحضور إلى موقع المناسبة.');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_on_attendance ON public.bookings;
CREATE TRIGGER trg_notify_on_attendance
AFTER UPDATE OF attendance_confirmed_at ON public.bookings
FOR EACH ROW EXECUTE FUNCTION public.notify_on_attendance();