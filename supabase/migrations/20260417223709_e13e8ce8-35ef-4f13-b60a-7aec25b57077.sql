
-- 1) Warmer copy for new booking request notification (vendor side)
CREATE OR REPLACE FUNCTION public.handle_new_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vendor_user UUID;
  vendor_name TEXT;
BEGIN
  -- Block date on vendor calendar
  INSERT INTO public.vendor_availability (vendor_id, date, status, booking_id, note)
  VALUES (NEW.vendor_id, NEW.event_date, 'pending', NEW.id, 'حجز جديد بانتظار التأكيد')
  ON CONFLICT (vendor_id, date) DO UPDATE
    SET status = EXCLUDED.status,
        booking_id = EXCLUDED.booking_id,
        note = EXCLUDED.note;

  SELECT user_id, business_name INTO vendor_user, vendor_name
  FROM public.vendors WHERE id = NEW.vendor_id;

  IF vendor_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (
      vendor_user,
      'booking_request',
      '✨ طلب حجز جديد عبر تكلّة',
      'لديك طلب حجز جديد بتاريخ ' || NEW.event_date::TEXT || '. سارع بالرد لتأكيد المناسبة وضمان مكانك في تقويم العميل.'
    );
  END IF;

  RETURN NEW;
END;
$$;

-- 2) Notify customer when vendor confirms / rejects booking
CREATE OR REPLACE FUNCTION public.notify_customer_on_booking_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vendor_name TEXT;
  notif_title TEXT;
  notif_body  TEXT;
  notif_type  notification_type;
BEGIN
  IF NEW.status IS NOT DISTINCT FROM OLD.status THEN
    RETURN NEW;
  END IF;

  SELECT business_name INTO vendor_name FROM public.vendors WHERE id = NEW.vendor_id;

  IF NEW.status = 'confirmed' THEN
    notif_type  := 'booking_confirmed';
    notif_title := '🎉 تم تأكيد حجزك مع ' || COALESCE(vendor_name, 'المزوّد');
    notif_body  := 'تم تأكيد الحجز بتاريخ ' || NEW.event_date::TEXT || '. كل التفاصيل محفوظة في تكلّة — استمتع بالتخطيط لليلة لا تُنسى.';
  ELSIF NEW.status = 'rejected' THEN
    notif_type  := 'general';
    notif_title := 'اعتذر المزوّد عن الحجز';
    notif_body  := COALESCE(vendor_name, 'المزوّد') || ' لم يستطع تأكيد الحجز هذه المرة. يمكنك تصفّح خيارات أخرى من تكلّة دون أي رسوم.';
  ELSIF NEW.status = 'completed' THEN
    notif_type  := 'general';
    notif_title := 'شكراً لاختياركم تكلّة 💚';
    notif_body  := 'اكتملت خدمة ' || COALESCE(vendor_name, 'المزوّد') || '. شاركنا تقييمك ليساعد بقية الضيوف على اختيار الأفضل.';
  ELSE
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, body)
  VALUES (NEW.customer_id, notif_type, notif_title, notif_body);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_customer_on_booking_status_trg ON public.bookings;
CREATE TRIGGER notify_customer_on_booking_status_trg
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_customer_on_booking_status();

-- 3) Notify customer + vendor on payment received (held in escrow)
CREATE OR REPLACE FUNCTION public.notify_on_payment_received()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vendor_user UUID;
  vendor_name TEXT;
BEGIN
  SELECT user_id, business_name INTO vendor_user, vendor_name
  FROM public.vendors WHERE id = NEW.vendor_id;

  -- Customer confirmation
  INSERT INTO public.notifications (user_id, type, title, body)
  VALUES (
    NEW.customer_id,
    'payment_confirmed',
    '✅ تم استلام الدفعة بنجاح',
    'استلمنا دفعتك بقيمة ' || NEW.total_charged::TEXT || ' ر.س وتم حفظها في الضمان حتى تقديم الخدمة. شكراً لثقتك بـ تكلّة.'
  );

  -- Vendor heads-up
  IF vendor_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (
      vendor_user,
      'payment_confirmed',
      '💰 وصلت دفعة جديدة',
      'تم استلام دفعة بقيمة ' || NEW.vendor_net::TEXT || ' ر.س (صافي) وحفظها في الضمان. سيتم تحويلها بعد إتمام الخدمة.'
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS notify_on_payment_received_trg ON public.payments;
CREATE TRIGGER notify_on_payment_received_trg
  AFTER INSERT ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_payment_received();
