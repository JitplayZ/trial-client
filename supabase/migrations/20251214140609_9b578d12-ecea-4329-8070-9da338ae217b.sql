-- Add admin role for clientstrial@gmail.com
INSERT INTO public.user_roles (user_id, role)
SELECT 'ffebe2a0-5608-4270-9db2-9d85d9e93ae5', 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = 'ffebe2a0-5608-4270-9db2-9d85d9e93ae5' 
  AND role = 'admin'
);