-- Approval status enum
CREATE TYPE public.approval_status AS ENUM ('pending_approval', 'approved', 'rejected');

-- VENDORS: add IBAN, doc, location, approval fields
ALTER TABLE public.vendors
  ADD COLUMN iban TEXT,
  ADD COLUMN iban_certificate_url TEXT,
  ADD COLUMN google_maps_url TEXT,
  ADD COLUMN approval_status public.approval_status NOT NULL DEFAULT 'pending_approval',
  ADD COLUMN rejection_reason TEXT,
  ADD COLUMN reviewed_at TIMESTAMPTZ,
  ADD COLUMN reviewed_by UUID;

-- Existing vendors must re-verify (per user choice)
UPDATE public.vendors SET approval_status = 'pending_approval';

-- PACKAGES: add approval fields
ALTER TABLE public.packages
  ADD COLUMN approval_status public.approval_status NOT NULL DEFAULT 'pending_approval',
  ADD COLUMN rejection_reason TEXT,
  ADD COLUMN reviewed_at TIMESTAMPTZ,
  ADD COLUMN reviewed_by UUID;

UPDATE public.packages SET approval_status = 'pending_approval';

-- Update vendors visibility policy: only approved vendors visible to public
DROP POLICY IF EXISTS "Vendors viewable by everyone" ON public.vendors;
CREATE POLICY "Vendors viewable by everyone"
  ON public.vendors FOR SELECT
  USING (
    (active = true AND approval_status = 'approved')
    OR auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin')
  );

-- Update packages visibility: only approved packages whose vendor is approved
DROP POLICY IF EXISTS "Packages viewable by everyone" ON public.packages;
CREATE POLICY "Packages viewable by everyone"
  ON public.packages FOR SELECT
  USING (
    approval_status = 'approved'
    OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = packages.vendor_id AND v.user_id = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

-- Trigger: when vendor is edited after rejection, auto-flip back to pending_approval
CREATE OR REPLACE FUNCTION public.vendor_resubmit_on_edit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Skip if this update is itself a status change by an admin
  IF NEW.approval_status IS DISTINCT FROM OLD.approval_status THEN
    RETURN NEW;
  END IF;
  -- If currently rejected and any meaningful field changed, flip back to pending
  IF OLD.approval_status = 'rejected' AND (
       NEW.business_name IS DISTINCT FROM OLD.business_name
    OR NEW.bio IS DISTINCT FROM OLD.bio
    OR NEW.city IS DISTINCT FROM OLD.city
    OR NEW.phone IS DISTINCT FROM OLD.phone
    OR NEW.iban IS DISTINCT FROM OLD.iban
    OR NEW.iban_certificate_url IS DISTINCT FROM OLD.iban_certificate_url
    OR NEW.commercial_register_url IS DISTINCT FROM OLD.commercial_register_url
    OR NEW.google_maps_url IS DISTINCT FROM OLD.google_maps_url
    OR NEW.portfolio_urls IS DISTINCT FROM OLD.portfolio_urls
  ) THEN
    NEW.approval_status := 'pending_approval';
    NEW.rejection_reason := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_vendor_resubmit_on_edit
BEFORE UPDATE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION public.vendor_resubmit_on_edit();

-- Trigger: same behavior for packages
CREATE OR REPLACE FUNCTION public.package_resubmit_on_edit()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.approval_status IS DISTINCT FROM OLD.approval_status THEN
    RETURN NEW;
  END IF;
  IF OLD.approval_status = 'rejected' AND (
       NEW.name IS DISTINCT FROM OLD.name
    OR NEW.tier IS DISTINCT FROM OLD.tier
    OR NEW.price IS DISTINCT FROM OLD.price
    OR NEW.description IS DISTINCT FROM OLD.description
    OR NEW.includes IS DISTINCT FROM OLD.includes
  ) THEN
    NEW.approval_status := 'pending_approval';
    NEW.rejection_reason := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_package_resubmit_on_edit
BEFORE UPDATE ON public.packages
FOR EACH ROW EXECUTE FUNCTION public.package_resubmit_on_edit();

-- Trigger: notify vendor on approval status change
CREATE OR REPLACE FUNCTION public.notify_vendor_on_status_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  vendor_user UUID;
  pkg_vendor_id UUID;
  notif_title TEXT;
  notif_body TEXT;
BEGIN
  IF NEW.approval_status IS NOT DISTINCT FROM OLD.approval_status THEN
    RETURN NEW;
  END IF;

  IF TG_TABLE_NAME = 'vendors' THEN
    vendor_user := NEW.user_id;
  ELSE
    SELECT user_id INTO vendor_user FROM public.vendors WHERE id = NEW.vendor_id;
  END IF;

  IF vendor_user IS NULL THEN RETURN NEW; END IF;

  IF NEW.approval_status = 'approved' THEN
    notif_title := 'تمت الموافقة';
    notif_body := CASE WHEN TG_TABLE_NAME = 'vendors'
      THEN 'تمت الموافقة على ملف عملك. أصبح ظاهراً للعملاء.'
      ELSE 'تمت الموافقة على باقتك. أصبحت متاحة للحجز.' END;
  ELSIF NEW.approval_status = 'rejected' THEN
    notif_title := 'تم رفض الطلب';
    notif_body := COALESCE('سبب الرفض: ' || NEW.rejection_reason, 'تم رفض الطلب — يرجى مراجعة البيانات.');
  ELSE
    notif_title := 'قيد المراجعة';
    notif_body := 'طلبك قيد المراجعة من فريق التحقق.';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body)
  VALUES (vendor_user, 'general', notif_title, notif_body);

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_vendor_status_change
AFTER UPDATE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION public.notify_vendor_on_status_change();

CREATE TRIGGER trg_notify_vendor_pkg_status_change
AFTER UPDATE ON public.packages
FOR EACH ROW EXECUTE FUNCTION public.notify_vendor_on_status_change();

-- Storage bucket for IBAN certificates (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('iban-documents', 'iban-documents', false)
ON CONFLICT (id) DO NOTHING;

-- IBAN docs RLS: vendor uploads/views own; admins view all
CREATE POLICY "Vendor can upload own iban doc"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'iban-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Vendor can view own iban doc"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'iban-documents'
    AND (auth.uid()::text = (storage.foldername(name))[1] OR public.has_role(auth.uid(), 'admin'))
  );

CREATE POLICY "Vendor can update own iban doc"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'iban-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Vendor can delete own iban doc"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'iban-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow admin to view vendor-documents (commercial register) bucket too
CREATE POLICY "Admin can view all vendor documents"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-documents' AND public.has_role(auth.uid(), 'admin'));