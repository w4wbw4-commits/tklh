DROP POLICY IF EXISTS "Portfolio images readable by path" ON storage.objects;

CREATE POLICY "Portfolio images readable for visible vendors"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'vendor-portfolios'
  AND (
    (auth.uid())::text = (storage.foldername(name))[1]
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.vendors v
      WHERE (v.user_id)::text = (storage.foldername(name))[1]
        AND v.active = true
        AND v.approval_status = 'approved'
        AND v.hidden = false
    )
  )
);