-- ============================================================
-- 1. Incident reports (Quality / Dispute reports with images)
-- ============================================================
CREATE TYPE public.incident_kind AS ENUM ('quality', 'no_show', 'late', 'damage', 'safety', 'other');
CREATE TYPE public.incident_status AS ENUM ('open', 'in_review', 'resolved', 'dismissed');

CREATE TABLE public.incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  vendor_id UUID NOT NULL,
  booking_id UUID NOT NULL,
  kind public.incident_kind NOT NULL DEFAULT 'quality',
  description TEXT NOT NULL,
  attachments TEXT[] NOT NULL DEFAULT '{}',
  status public.incident_status NOT NULL DEFAULT 'open',
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_incident_reports_status ON public.incident_reports(status);
CREATE INDEX idx_incident_reports_vendor ON public.incident_reports(vendor_id);
CREATE INDEX idx_incident_reports_customer ON public.incident_reports(customer_id);

ALTER TABLE public.incident_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customer creates own incident report"
  ON public.incident_reports FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Stakeholders view incident reports"
  ON public.incident_reports FOR SELECT
  USING (
    auth.uid() = customer_id
    OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = vendor_id AND v.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Customer updates own report while open"
  ON public.incident_reports FOR UPDATE
  USING (auth.uid() = customer_id AND status IN ('open', 'in_review'));

CREATE POLICY "Admins manage incident reports"
  ON public.incident_reports FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete incident reports"
  ON public.incident_reports FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER incident_reports_updated_at
  BEFORE UPDATE ON public.incident_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notify admins on new incident report
CREATE OR REPLACE FUNCTION public.notify_admins_on_incident()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE vendor_name TEXT;
BEGIN
  SELECT business_name INTO vendor_name FROM public.vendors WHERE id = NEW.vendor_id;
  INSERT INTO public.notifications (user_id, type, title, body)
  SELECT ur.user_id, 'general',
         '🚨 بلاغ جودة جديد',
         'تم تقديم بلاغ جودة (' || NEW.kind::text || ') على المزوّد ' || COALESCE(vendor_name,'—')
  FROM public.user_roles ur WHERE ur.role = 'admin';
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_admins_on_incident
  AFTER INSERT ON public.incident_reports
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_incident();

-- ============================================================
-- 2. Storage bucket for incident attachments (private)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('incident-attachments', 'incident-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Customers upload to their own folder /<auth.uid>/...
CREATE POLICY "Customers upload own incident attachments"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'incident-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Customers view own incident attachments"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'incident-attachments'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.has_role(auth.uid(), 'admin')
    )
  );

CREATE POLICY "Customers delete own incident attachments"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'incident-attachments'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- 3. Auto-grant admin role for the primary admin phone
--    +966554430196 → synthetic email 966554430196@phone.tekillah.app
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_grant_primary_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email = '966554430196@phone.tekillah.app' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_grant_primary_admin ON auth.users;
CREATE TRIGGER trg_auto_grant_primary_admin
  AFTER INSERT OR UPDATE OF email ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_grant_primary_admin();

-- Backfill if the user already exists
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users
WHERE email = '966554430196@phone.tekillah.app'
ON CONFLICT DO NOTHING;