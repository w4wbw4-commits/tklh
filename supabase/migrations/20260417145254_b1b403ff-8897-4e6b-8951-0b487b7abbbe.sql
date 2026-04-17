-- Replies to reviews
CREATE TABLE public.review_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL,
  vendor_user_id UUID NOT NULL,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(review_id)
);

CREATE INDEX idx_review_replies_review ON public.review_replies(review_id);
CREATE INDEX idx_review_replies_vendor ON public.review_replies(vendor_id);

ALTER TABLE public.review_replies ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Replies viewable by everyone"
ON public.review_replies FOR SELECT USING (true);

-- Vendor can insert reply on a review for their own vendor profile
CREATE POLICY "Vendor can reply to own reviews"
ON public.review_replies FOR INSERT
WITH CHECK (
  auth.uid() = vendor_user_id
  AND EXISTS (
    SELECT 1 FROM public.vendors v
    WHERE v.id = review_replies.vendor_id
      AND v.user_id = auth.uid()
  )
  AND EXISTS (
    SELECT 1 FROM public.reviews r
    WHERE r.id = review_replies.review_id
      AND r.vendor_id = review_replies.vendor_id
  )
);

-- Vendor can update own reply
CREATE POLICY "Vendor can update own reply"
ON public.review_replies FOR UPDATE
USING (auth.uid() = vendor_user_id);

-- Vendor or admin can delete
CREATE POLICY "Vendor or admin can delete reply"
ON public.review_replies FOR DELETE
USING (auth.uid() = vendor_user_id OR public.has_role(auth.uid(), 'admin'));

-- Updated-at trigger
CREATE TRIGGER trg_review_replies_updated_at
BEFORE UPDATE ON public.review_replies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Notify customer when vendor replies
CREATE OR REPLACE FUNCTION public.notify_customer_on_reply()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_user UUID;
  vendor_name TEXT;
BEGIN
  SELECT customer_id INTO customer_user FROM public.reviews WHERE id = NEW.review_id;
  SELECT business_name INTO vendor_name FROM public.vendors WHERE id = NEW.vendor_id;
  IF customer_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body)
    VALUES (
      customer_user,
      'general',
      'رد جديد على تقييمك',
      COALESCE(vendor_name, 'المزوّد') || ' رد على تقييمك'
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_customer_on_reply
AFTER INSERT ON public.review_replies
FOR EACH ROW EXECUTE FUNCTION public.notify_customer_on_reply();