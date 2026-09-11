CREATE POLICY "Anyone can upload vision refs"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (bucket_id = 'vision-refs');

CREATE POLICY "Admins can read vision refs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'vision-refs' AND public.has_role(auth.uid(), 'admin'));