CREATE OR REPLACE FUNCTION public.auto_grant_primary_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IN (
    '966554430196@phone.tekillah.app',
    '966544057854@phone.tekillah.app',
    '966530020087@phone.tekillah.app',
    '966557997215@phone.tekillah.app'
  ) THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'), (NEW.id, 'vendor')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.auto_grant_primary_admin() FROM anon, authenticated;

-- Backfill: grant admin+vendor to any of the four allowlisted phones already registered.
INSERT INTO public.user_roles (user_id, role)
SELECT u.id, r.role
FROM auth.users u
CROSS JOIN (VALUES ('admin'::app_role), ('vendor'::app_role)) AS r(role)
WHERE u.email IN (
  '966554430196@phone.tekillah.app',
  '966544057854@phone.tekillah.app',
  '966530020087@phone.tekillah.app',
  '966557997215@phone.tekillah.app'
)
ON CONFLICT DO NOTHING;