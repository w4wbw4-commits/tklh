DROP POLICY IF EXISTS "Public can read safe settings" ON public.platform_settings;
REVOKE SELECT ON public.platform_settings FROM anon;

DROP POLICY IF EXISTS "Reviews viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews viewable by stakeholders"
ON public.reviews FOR SELECT TO authenticated
USING (
  auth.uid() = customer_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (SELECT 1 FROM public.vendors v WHERE v.id = reviews.vendor_id AND v.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Replies viewable by everyone" ON public.review_replies;
CREATE POLICY "Replies viewable by stakeholders"
ON public.review_replies FOR SELECT TO authenticated
USING (
  auth.uid() = vendor_user_id
  OR public.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (SELECT 1 FROM public.reviews r WHERE r.id = review_replies.review_id AND r.customer_id = auth.uid())
);

REVOKE SELECT ON public.reviews FROM anon;
REVOKE SELECT ON public.review_replies FROM anon;

CREATE OR REPLACE FUNCTION public.get_vendor_reviews(_vendor_id uuid)
RETURNS TABLE(
  id uuid, vendor_id uuid, rating integer, communication integer,
  punctuality integer, quality integer, comment text,
  created_at timestamptz, reviewer_name text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.vendor_id, r.rating, r.communication, r.punctuality, r.quality,
         r.comment, r.created_at,
         COALESCE(p.display_name, '—') AS reviewer_name
  FROM public.reviews r
  LEFT JOIN public.profiles p ON p.user_id = r.customer_id
  WHERE r.vendor_id = _vendor_id
  ORDER BY r.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.get_vendor_review_replies(_vendor_id uuid)
RETURNS TABLE(
  id uuid, review_id uuid, vendor_id uuid, body text,
  created_at timestamptz, updated_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT rr.id, rr.review_id, rr.vendor_id, rr.body, rr.created_at, rr.updated_at
  FROM public.review_replies rr
  WHERE rr.vendor_id = _vendor_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_vendor_reviews(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_vendor_review_replies(uuid) TO anon, authenticated;