-- bookings
DROP POLICY "Customer or vendor can update booking" ON public.bookings;
CREATE POLICY "Customer or vendor can update booking"
ON public.bookings FOR UPDATE
USING (
  auth.uid() = customer_id
  OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = bookings.vendor_id AND v.user_id = auth.uid())
)
WITH CHECK (
  auth.uid() = customer_id
  OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = bookings.vendor_id AND v.user_id = auth.uid())
);

-- customer_leads
DROP POLICY "Users update own lead" ON public.customer_leads;
CREATE POLICY "Users update own lead"
ON public.customer_leads FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- emergency_requests
DROP POLICY "Customer updates own emergency" ON public.emergency_requests;
CREATE POLICY "Customer updates own emergency"
ON public.emergency_requests FOR UPDATE
USING (auth.uid() = customer_id)
WITH CHECK (auth.uid() = customer_id);

-- incident_reports
DROP POLICY "Customer updates own report while open" ON public.incident_reports;
CREATE POLICY "Customer updates own report while open"
ON public.incident_reports FOR UPDATE
USING (auth.uid() = customer_id AND status = ANY (ARRAY['open'::incident_status, 'in_review'::incident_status]))
WITH CHECK (auth.uid() = customer_id AND status = ANY (ARRAY['open'::incident_status, 'in_review'::incident_status]));

-- profiles
DROP POLICY "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- review_replies
DROP POLICY "Vendor can update own reply" ON public.review_replies;
CREATE POLICY "Vendor can update own reply"
ON public.review_replies FOR UPDATE
USING (auth.uid() = vendor_user_id)
WITH CHECK (auth.uid() = vendor_user_id);

-- reviews
DROP POLICY "Customer can update own review" ON public.reviews;
CREATE POLICY "Customer can update own review"
ON public.reviews FOR UPDATE
USING (auth.uid() = customer_id)
WITH CHECK (auth.uid() = customer_id);

-- vendors
DROP POLICY "Vendor can update own profile (non-verification fields)" ON public.vendors;
CREATE POLICY "Vendor can update own profile (non-verification fields)"
ON public.vendors FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);