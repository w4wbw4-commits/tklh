-- Assign master admin role to shamia9960@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role FROM auth.users WHERE email = 'shamia9960@gmail.com'
ON CONFLICT DO NOTHING;