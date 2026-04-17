-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL UNIQUE,
  vendor_id UUID NOT NULL,
  customer_id UUID NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  communication SMALLINT NOT NULL CHECK (communication BETWEEN 1 AND 5),
  punctuality SMALLINT NOT NULL CHECK (punctuality BETWEEN 1 AND 5),
  quality SMALLINT NOT NULL CHECK (quality BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_reviews_vendor_id ON public.reviews(vendor_id);
CREATE INDEX idx_reviews_customer_id ON public.reviews(customer_id);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews
CREATE POLICY "Reviews viewable by everyone"
ON public.reviews FOR SELECT
USING (true);

-- Customer can insert review only for own completed booking
CREATE POLICY "Customer can review own completed bookings"
ON public.reviews FOR INSERT
WITH CHECK (
  auth.uid() = customer_id
  AND EXISTS (
    SELECT 1 FROM public.bookings b
    WHERE b.id = reviews.booking_id
      AND b.customer_id = auth.uid()
      AND b.vendor_id = reviews.vendor_id
      AND b.status = 'completed'
  )
);

-- Customer can update own review
CREATE POLICY "Customer can update own review"
ON public.reviews FOR UPDATE
USING (auth.uid() = customer_id);

-- Customer or admin can delete review
CREATE POLICY "Customer or admin can delete review"
ON public.reviews FOR DELETE
USING (auth.uid() = customer_id OR has_role(auth.uid(), 'admin'::app_role));

-- Trigger to update updated_at
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Notify vendor when a new review is created
CREATE OR REPLACE FUNCTION public.notify_vendor_on_review()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  vendor_user UUID;
BEGIN
  SELECT user_id INTO vendor_user FROM public.vendors WHERE id = NEW.vendor_id;
  IF vendor_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (
      vendor_user,
      'general',
      'تقييم جديد',
      'استلمت تقييماً جديداً بـ ' || NEW.rating || ' نجوم'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_created
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.notify_vendor_on_review();

-- Vendor ratings summary view
CREATE OR REPLACE VIEW public.vendor_ratings_summary
WITH (security_invoker = true)
AS
SELECT
  v.id AS vendor_id,
  COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0) AS avg_rating,
  COALESCE(ROUND(AVG(r.communication)::numeric, 2), 0) AS avg_communication,
  COALESCE(ROUND(AVG(r.punctuality)::numeric, 2), 0) AS avg_punctuality,
  COALESCE(ROUND(AVG(r.quality)::numeric, 2), 0) AS avg_quality,
  COUNT(r.id)::int AS reviews_count,
  COUNT(DISTINCT b.id) FILTER (WHERE b.status = 'completed')::int AS completed_bookings
FROM public.vendors v
LEFT JOIN public.reviews r ON r.vendor_id = v.id
LEFT JOIN public.bookings b ON b.vendor_id = v.id
GROUP BY v.id;