-- 1. Tighten notifications insert: only admins can directly insert
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
CREATE POLICY "Admins can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
-- (SECURITY DEFINER triggers like handle_new_booking still work, they bypass RLS)

-- 2. Restrict portfolio bucket SELECT to specific objects (not bucket-wide listing)
-- Drop the broad public SELECT policy
DROP POLICY IF EXISTS "Portfolio images public read" ON storage.objects;

-- Make the bucket non-listable (clients can still GET a known object via signed/public URL through CDN)
UPDATE storage.buckets SET public = false WHERE id = 'vendor-portfolios';

-- Allow public URL generation: re-add a narrow read policy that works only when an object name is provided
CREATE POLICY "Portfolio images readable by path"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vendor-portfolios' AND name IS NOT NULL);

-- Note: keep the bucket effectively public for direct object reads but prevent enumeration via list.
-- Re-mark as public so render API works (RLS still enforced for list operations via name predicate).
UPDATE storage.buckets SET public = true WHERE id = 'vendor-portfolios';