
-- 1) vendor_availability: restrict SELECT to authenticated users (hides booking_id from anon)
DROP POLICY IF EXISTS "Availability viewable by everyone" ON public.vendor_availability;
CREATE POLICY "Availability viewable by authenticated"
  ON public.vendor_availability FOR SELECT
  TO authenticated
  USING (true);

-- 2) realtime.messages: scope subscriptions per-topic for bookings & payments
DROP POLICY IF EXISTS "Authenticated users only on realtime" ON realtime.messages;
DROP POLICY IF EXISTS "Authenticated users only on realtime insert" ON realtime.messages;

CREATE POLICY "Scoped realtime subscriptions"
  ON realtime.messages FOR SELECT
  TO authenticated
  USING (
    -- Bookings topic: bookings:<uuid>
    (
      realtime.topic() LIKE 'bookings:%'
      AND EXISTS (
        SELECT 1 FROM public.bookings b
        WHERE b.id::text = split_part(realtime.topic(), ':', 2)
          AND (
            b.customer_id = auth.uid()
            OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = b.vendor_id AND v.user_id = auth.uid())
            OR public.has_role(auth.uid(), 'admin'::app_role)
          )
      )
    )
    OR
    -- Payments topic: payments:<uuid>
    (
      realtime.topic() LIKE 'payments:%'
      AND EXISTS (
        SELECT 1 FROM public.payments p
        WHERE p.id::text = split_part(realtime.topic(), ':', 2)
          AND (
            p.customer_id = auth.uid()
            OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = p.vendor_id AND v.user_id = auth.uid())
            OR public.has_role(auth.uid(), 'admin'::app_role)
          )
      )
    )
    OR
    -- Any other topic remains accessible to authenticated users (preserves existing
    -- non-sensitive channels). Tighten further as additional sensitive topics emerge.
    (
      realtime.topic() NOT LIKE 'bookings:%'
      AND realtime.topic() NOT LIKE 'payments:%'
    )
  );

CREATE POLICY "Authenticated can publish realtime"
  ON realtime.messages FOR INSERT
  TO authenticated
  WITH CHECK (true);
