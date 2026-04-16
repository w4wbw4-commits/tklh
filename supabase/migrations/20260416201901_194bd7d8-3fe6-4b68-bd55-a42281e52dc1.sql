
-- 1. EVENTS table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'مناسبتي',
  event_date DATE NOT NULL,
  city TEXT,
  guest_count INTEGER DEFAULT 0,
  total_budget NUMERIC DEFAULT 0,
  theme TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers manage own events" ON public.events
  FOR ALL USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Admins view all events" ON public.events
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. GUESTS table
CREATE TYPE public.rsvp_status AS ENUM ('pending', 'confirmed', 'declined');

CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  rsvp_status rsvp_status NOT NULL DEFAULT 'pending',
  seats INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers manage own guests" ON public.guests
  FOR ALL USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

CREATE TRIGGER update_guests_updated_at
  BEFORE UPDATE ON public.guests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_guests_event ON public.guests(event_id);

-- 3. Add event_id + payment tracking to bookings
ALTER TABLE public.bookings 
  ADD COLUMN event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  ADD COLUMN paid_amount NUMERIC NOT NULL DEFAULT 0;

CREATE INDEX idx_bookings_event ON public.bookings(event_id);

-- 4. TIMELINE milestones (per event)
CREATE TYPE public.milestone_status AS ENUM ('pending', 'in_progress', 'done');

CREATE TABLE public.timeline_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  status milestone_status NOT NULL DEFAULT 'pending',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.timeline_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers manage own milestones" ON public.timeline_milestones
  FOR ALL USING (auth.uid() = customer_id) WITH CHECK (auth.uid() = customer_id);

CREATE TRIGGER update_milestones_updated_at
  BEFORE UPDATE ON public.timeline_milestones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Auto-seed default milestones when an event is created
CREATE OR REPLACE FUNCTION public.seed_event_milestones()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.timeline_milestones (event_id, customer_id, title, description, due_date, sort_order) VALUES
    (NEW.id, NEW.customer_id, 'حجز القاعة والمزوّدين الأساسيين', 'تأكيد القاعة، الضيافة، التصوير', NEW.event_date - INTERVAL '180 days', 1),
    (NEW.id, NEW.customer_id, 'تأكيد قائمة الطعام', 'مراجعة قائمة الطعام مع مزوّد الضيافة', NEW.event_date - INTERVAL '90 days', 2),
    (NEW.id, NEW.customer_id, 'تصميم وإرسال الدعوات', 'تصميم بطاقة الدعوة وإرسالها للضيوف', NEW.event_date - INTERVAL '60 days', 3),
    (NEW.id, NEW.customer_id, 'تأكيد عدد الضيوف النهائي', 'حصر الردود وتحديث عدد المقاعد', NEW.event_date - INTERVAL '30 days', 4),
    (NEW.id, NEW.customer_id, 'مراجعة تفاصيل الإضاءة والزفّة', 'تنسيق نهائي مع DJ والتنسيق', NEW.event_date - INTERVAL '7 days', 5),
    (NEW.id, NEW.customer_id, 'ليلة المناسبة', 'يوم الحفل', NEW.event_date, 6);
  RETURN NEW;
END;
$$;

CREATE TRIGGER seed_milestones_on_event
  AFTER INSERT ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.seed_event_milestones();
