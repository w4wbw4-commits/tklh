CREATE TYPE public.applicant_entity_type AS ENUM ('company', 'individual');
CREATE TYPE public.vendor_application_status AS ENUM ('new', 'contacted', 'approved', 'rejected');

CREATE TABLE public.vendor_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  phone text NOT NULL,
  email text NOT NULL,
  entity_type public.applicant_entity_type NOT NULL,
  service_type public.vendor_category NOT NULL,
  city text,
  notes text,
  status public.vendor_application_status NOT NULL DEFAULT 'new',
  review_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.vendor_applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.vendor_applications TO authenticated;
GRANT ALL ON public.vendor_applications TO service_role;

ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an application"
  ON public.vendor_applications FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view applications"
  ON public.vendor_applications FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update applications"
  ON public.vendor_applications FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete applications"
  ON public.vendor_applications FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER trg_vendor_applications_updated
  BEFORE UPDATE ON public.vendor_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.notify_admins_on_vendor_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body)
  SELECT ur.user_id, 'general',
         '📨 طلب انضمام مزود خدمة جديد',
         NEW.full_name || ' (' || NEW.service_type::text || ') — ' || NEW.phone
  FROM public.user_roles ur WHERE ur.role = 'admin';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admins_on_vendor_application
  AFTER INSERT ON public.vendor_applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_vendor_application();