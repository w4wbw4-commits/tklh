-- Grant admin role to phone +966544057854 if user exists; safe no-op otherwise.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role
FROM auth.users
WHERE phone = '966544057854' OR email = '966544057854@phone.tekillah.app'
ON CONFLICT (user_id, role) DO NOTHING;