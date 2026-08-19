CREATE TABLE public.planner_interest (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  phone text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.planner_interest TO anon, authenticated;
GRANT SELECT ON public.planner_interest TO authenticated;
GRANT ALL ON public.planner_interest TO service_role;
ALTER TABLE public.planner_interest ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can register interest" ON public.planner_interest FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view interest signups" ON public.planner_interest FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));