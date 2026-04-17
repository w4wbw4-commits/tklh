CREATE OR REPLACE FUNCTION public.notify_vendor_on_status_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  vendor_user UUID;
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
    IF TG_TABLE_NAME = 'vendors' THEN
      notif_title := '🎉 حسابك أصبح مفعّلاً';
      notif_body  := 'تمت الموافقة على ملفك. حسابك الآن يظهر للعملاء ويمكنهم البدء بالحجز فوراً.';
    ELSE
      notif_title := '✅ تمت الموافقة على باقتك';
      notif_body  := 'باقتك أصبحت متاحة للحجز من العملاء.';
    END IF;
  ELSIF NEW.approval_status = 'rejected' THEN
    notif_title := 'تم رفض الطلب';
    notif_body  := COALESCE('سبب الرفض: ' || NEW.rejection_reason, 'تم رفض الطلب — يرجى مراجعة البيانات وإعادة الإرسال.');
  ELSE
    notif_title := 'قيد المراجعة';
    notif_body  := 'طلبك قيد المراجعة من فريق التحقق. سنخبرك فور صدور القرار.';
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body)
  VALUES (vendor_user, 'general', notif_title, notif_body);

  RETURN NEW;
END;
$function$;