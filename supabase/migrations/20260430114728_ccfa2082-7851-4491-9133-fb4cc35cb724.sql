DO $$
DECLARE
  partner_uid CONSTANT UUID := '1fe3b739-45ea-41a2-9003-025ba179a280';
  hall1_id UUID := gen_random_uuid();
  hall2_id UUID := gen_random_uuid();
  hall3_id UUID := gen_random_uuid();
  booking_id UUID;
  hall_ids UUID[];
  prices NUMERIC[];
  statuses TEXT[];
  pay_statuses TEXT[];
  customer_names TEXT[];
  i INT;
  vat NUMERIC; fee NUMERIC; net NUMERIC; total NUMERIC; price NUMERIC;
BEGIN
  -- Idempotent reset of prior demo rows for this partner.
  DELETE FROM public.payments WHERE vendor_id IN (SELECT id FROM public.vendors WHERE user_id = partner_uid);
  DELETE FROM public.bookings WHERE vendor_id IN (SELECT id FROM public.vendors WHERE user_id = partner_uid);
  DELETE FROM public.vendor_availability WHERE vendor_id IN (SELECT id FROM public.vendors WHERE user_id = partner_uid);
  DELETE FROM public.vendors WHERE user_id = partner_uid;

  -- Three halls at different price tiers — approved & active.
  INSERT INTO public.vendors (id, user_id, business_name, category, city, region, district, bio, phone, weekday_price, weekend_price, starting_price, men_capacity, women_capacity, daily_capacity, active, verified, approval_status)
  VALUES
    (hall1_id, partner_uid, 'قاعة الأصالة الاقتصادية', 'hall', 'الرياض', 'الرياض', 'الملقا', 'قاعة أنيقة بأسعار مناسبة لمختلف المناسبات.', '+966544057854', 8000, 12000, 8000, 200, 200, 1, true, true, 'approved'),
    (hall2_id, partner_uid, 'قاعة الياسمين الفاخرة', 'hall', 'الرياض', 'الرياض', 'حطين', 'قاعة فاخرة بتصميم عصري ومرافق متكاملة.', '+966544057854', 18000, 25000, 18000, 400, 400, 1, true, true, 'approved'),
    (hall3_id, partner_uid, 'قاعة الماس الملكية VIP', 'hall', 'الرياض', 'الرياض', 'الياسمين', 'قاعة VIP بمستوى رفاهية استثنائي وخدمات حصرية.', '+966544057854', 35000, 50000, 35000, 600, 600, 1, true, true, 'approved');

  -- Ten demo bookings — all attributed to the partner's own auth user as the
  -- customer (acceptable for a self-test; satisfies the FK on auth.users).
  hall_ids := ARRAY[hall1_id, hall2_id, hall3_id, hall1_id, hall2_id, hall3_id, hall1_id, hall2_id, hall3_id, hall2_id];
  prices   := ARRAY[8000, 18000, 50000, 12000, 25000, 35000, 8000, 18000, 50000, 25000];
  statuses := ARRAY['confirmed','confirmed','completed','pending','confirmed','completed','confirmed','pending','completed','confirmed'];
  pay_statuses := ARRAY['held','held','released','held','held','released','held','held','released','held'];
  customer_names := ARRAY['أحمد العتيبي','سارة القحطاني','محمد الحربي','نورة السبيعي','عبدالله الدوسري','ريم الشمري','خالد المطيري','هيا الزهراني','فيصل الغامدي','منيرة العنزي'];

  FOR i IN 1..10 LOOP
    booking_id := gen_random_uuid();
    price := prices[i];

    INSERT INTO public.bookings (id, customer_id, vendor_id, event_date, status, total_price, paid_amount, guest_count, notes, created_at)
    VALUES (
      booking_id,
      partner_uid,
      hall_ids[i],
      (CURRENT_DATE + ((i - 5) * INTERVAL '7 days'))::date,
      statuses[i]::booking_status,
      price,
      CASE WHEN statuses[i] IN ('confirmed','completed') THEN price ELSE 0 END,
      150 + i * 25,
      'عميل: ' || customer_names[i] || ' — حجز تجريبي #' || i,
      now() - (i * INTERVAL '2 days')
    );

    IF statuses[i] IN ('confirmed','completed') THEN
      vat := ROUND(price * 0.15, 2);
      fee := ROUND(price * 0.12, 2);
      net := price - fee;
      total := price + vat;

      INSERT INTO public.payments (booking_id, customer_id, vendor_id, amount, vat_amount, platform_fee, vendor_net, total_charged, method, status, reference, released_at, released_by, created_at)
      VALUES (
        booking_id, partner_uid, hall_ids[i],
        price, vat, fee, net, total,
        'mada'::payment_method,
        pay_statuses[i]::payment_status,
        'DEMO-' || lpad(i::text, 4, '0'),
        CASE WHEN pay_statuses[i] = 'released' THEN now() - INTERVAL '1 day' ELSE NULL END,
        CASE WHEN pay_statuses[i] = 'released' THEN partner_uid ELSE NULL END,
        now() - (i * INTERVAL '2 days') + INTERVAL '1 hour'
      );
    END IF;
  END LOOP;
END $$;