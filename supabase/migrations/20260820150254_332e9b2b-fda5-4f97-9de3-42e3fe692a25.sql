CREATE TYPE public.planner_interest_status AS ENUM ('new','contacted','awaiting_reply','converted','lost');

ALTER TABLE public.planner_interest
  ADD COLUMN status public.planner_interest_status NOT NULL DEFAULT 'new',
  ADD COLUMN admin_notes text,
  ADD COLUMN contacted_at timestamptz,
  ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now();

GRANT UPDATE ON public.planner_interest TO authenticated;

CREATE POLICY "Admins can update interest signups"
ON public.planner_interest FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_planner_interest_updated_at
BEFORE UPDATE ON public.planner_interest
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.notify_admins_on_planner_interest()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body)
  SELECT ur.user_id, 'general',
         'تسجيل جديد في رحلة التخطيط',
         NEW.full_name || ' · ' || NEW.phone
  FROM public.user_roles ur
  WHERE ur.role = 'admin';
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.notify_admins_on_planner_interest() FROM anon, authenticated;

DROP TRIGGER IF EXISTS trg_notify_admins_on_planner_interest ON public.planner_interest;
CREATE TRIGGER trg_notify_admins_on_planner_interest
AFTER INSERT ON public.planner_interest
FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_planner_interest();