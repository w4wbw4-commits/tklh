-- Add mandatory location detail fields and conditional extras for venues
ALTER TABLE public.vendors
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS extra_services text[] NOT NULL DEFAULT '{}';

-- Update the vendor_resubmit_on_edit trigger to include the new fields so
-- meaningful edits by a rejected vendor flip the row back to pending review.
CREATE OR REPLACE FUNCTION public.vendor_resubmit_on_edit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.approval_status IS DISTINCT FROM OLD.approval_status THEN
    RETURN NEW;
  END IF;
  IF OLD.approval_status = 'rejected' AND (
       NEW.business_name IS DISTINCT FROM OLD.business_name
    OR NEW.bio IS DISTINCT FROM OLD.bio
    OR NEW.city IS DISTINCT FROM OLD.city
    OR NEW.region IS DISTINCT FROM OLD.region
    OR NEW.district IS DISTINCT FROM OLD.district
    OR NEW.phone IS DISTINCT FROM OLD.phone
    OR NEW.iban IS DISTINCT FROM OLD.iban
    OR NEW.iban_certificate_url IS DISTINCT FROM OLD.iban_certificate_url
    OR NEW.commercial_register_url IS DISTINCT FROM OLD.commercial_register_url
    OR NEW.google_maps_url IS DISTINCT FROM OLD.google_maps_url
    OR NEW.portfolio_urls IS DISTINCT FROM OLD.portfolio_urls
    OR NEW.extra_services IS DISTINCT FROM OLD.extra_services
  ) THEN
    NEW.approval_status := 'pending_approval';
    NEW.rejection_reason := NULL;
  END IF;
  RETURN NEW;
END;
$function$;