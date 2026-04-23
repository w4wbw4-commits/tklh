
-- Extend handle_new_booking to also notify admins and confirm to customer
CREATE OR REPLACE FUNCTION public.handle_new_booking()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  vendor_user UUID;
  vendor_name TEXT;
  vendor_cat  TEXT;
  pkg_name    TEXT;
  service_label TEXT;
  price_text  TEXT;
BEGIN
  -- Block date on vendor calendar
  INSERT INTO public.vendor_availability (vendor_id, date, status, booking_id, note)
  VALUES (NEW.vendor_id, NEW.event_date, 'pending', NEW.id, 'حجز جديد بانتظار التأكيد')
  ON CONFLICT (vendor_id, date) DO UPDATE
    SET status = EXCLUDED.status,
        booking_id = EXCLUDED.booking_id,
        note = EXCLUDED.note;

  SELECT user_id, business_name, category::text
    INTO vendor_user, vendor_name, vendor_cat
  FROM public.vendors WHERE id = NEW.vendor_id;

  IF NEW.package_id IS NOT NULL THEN
    SELECT name INTO pkg_name FROM public.packages WHERE id = NEW.package_id;
    service_label := COALESCE('باقة ' || pkg_name, 'باقة');
  ELSE
    service_label := 'تنسيق خاص';
  END IF;

  price_text := COALESCE(NEW.total_price::TEXT, '—') || ' ر.س';

  -- Vendor notification (existing behaviour, kept here)
  IF vendor_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (
      vendor_user,
      'booking_request',
      '✨ طلب حجز جديد عبر تكلّة',
      'لديك طلب حجز جديد بتاريخ ' || NEW.event_date::TEXT ||
      ' — ' || service_label || ' بقيمة ' || price_text ||
      '. يرجى مراجعة التفاصيل والرد بسرعة.'
    );
  END IF;

  -- Customer confirmation
  INSERT INTO public.notifications (user_id, type, title, body)
  VALUES (
    NEW.customer_id,
    'general',
    '✅ تم استلام طلبك بنجاح',
    'استلمنا طلب حجزك (' || service_label || ') بتاريخ ' || NEW.event_date::TEXT ||
    ' — مزوّد الخدمة سيقوم بمراجعة الطلب والتواصل معك قريباً.'
  );

  -- Admin notifications (every active admin)
  INSERT INTO public.notifications (user_id, type, title, body)
  SELECT ur.user_id, 'booking_request',
         '📥 حجز جديد على المنصة',
         'حجز جديد لـ ' || service_label || ' بقيمة ' || price_text ||
         ' — المزوّد: ' || COALESCE(vendor_name, '—') ||
         ' (' || COALESCE(vendor_cat, '—') || ') بتاريخ ' || NEW.event_date::TEXT
  FROM public.user_roles ur
  WHERE ur.role = 'admin';

  RETURN NEW;
END;
$function$;
