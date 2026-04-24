-- Allow admins to fully manage packages and vendor_availability,
-- which is required to support permanent vendor deletion from the admin panel.

CREATE POLICY "Admins can manage packages"
ON public.packages
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage vendor_availability"
ON public.vendor_availability
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));
