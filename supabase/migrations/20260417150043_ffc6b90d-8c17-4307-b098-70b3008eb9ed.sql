-- Add flagged columns
ALTER TABLE public.reviews ADD COLUMN flagged BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.review_replies ADD COLUMN flagged BOOLEAN NOT NULL DEFAULT false;

-- Enums
CREATE TYPE public.report_target AS ENUM ('review', 'reply');
CREATE TYPE public.report_reason AS ENUM ('inappropriate', 'spam', 'harassment', 'other');
CREATE TYPE public.report_status AS ENUM ('pending', 'approved', 'removed');

-- Reports table
CREATE TABLE public.content_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_type public.report_target NOT NULL,
  target_id UUID NOT NULL,
  reporter_id UUID NOT NULL,
  reason public.report_reason NOT NULL,
  details TEXT,
  status public.report_status NOT NULL DEFAULT 'pending',
  resolved_by UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_content_reports_status ON public.content_reports(status);
CREATE INDEX idx_content_reports_target ON public.content_reports(target_type, target_id);

ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reporter sees own reports"
ON public.content_reports FOR SELECT
USING (auth.uid() = reporter_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can file reports"
ON public.content_reports FOR INSERT
WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Admins can update reports"
ON public.content_reports FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete reports"
ON public.content_reports FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_content_reports_updated_at
BEFORE UPDATE ON public.content_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- On new report: flag the target + notify all admins
CREATE OR REPLACE FUNCTION public.handle_new_report()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.target_type = 'review' THEN
    UPDATE public.reviews SET flagged = true WHERE id = NEW.target_id;
  ELSIF NEW.target_type = 'reply' THEN
    UPDATE public.review_replies SET flagged = true WHERE id = NEW.target_id;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body)
  SELECT ur.user_id, 'general', 'بلاغ جديد بانتظار المراجعة',
         'تم تقديم بلاغ جديد على ' || (CASE WHEN NEW.target_type = 'review' THEN 'تقييم' ELSE 'رد' END)
  FROM public.user_roles ur
  WHERE ur.role = 'admin';

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_handle_new_report
AFTER INSERT ON public.content_reports
FOR EACH ROW EXECUTE FUNCTION public.handle_new_report();