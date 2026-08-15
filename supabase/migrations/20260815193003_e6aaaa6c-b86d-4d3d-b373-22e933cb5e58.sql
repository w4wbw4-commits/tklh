-- Ensure the primary owner phone (+966554430196) always holds both admin and vendor roles
CREATE OR REPLACE FUNCTION public.auto_grant_primary_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email IN ('966554430196@phone.tekillah.app', '966544057854@phone.tekillah.app') THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'), (NEW.id, 'vendor')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

INSERT INTO public.user_roles (user_id, role)
SELECT id, r::app_role FROM auth.users, (VALUES ('admin'), ('vendor')) AS t(r)
WHERE email IN ('966554430196@phone.tekillah.app', '966544057854@phone.tekillah.app')
ON CONFLICT DO NOTHING;