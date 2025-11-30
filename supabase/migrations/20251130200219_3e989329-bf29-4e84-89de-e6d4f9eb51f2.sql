-- Update handle_new_user function to use new admin email
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  
  -- Insert XP
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (NEW.id, 0, 1);
  
  -- Note: Admin roles should be assigned manually via secure database queries
  -- Example: INSERT INTO public.user_roles (user_id, role) VALUES ('<user_id>', 'admin'::app_role);
  
  RETURN NEW;
END;
$function$;

-- Remove admin role from old email if exists
DO $$
DECLARE
  old_user_id uuid;
BEGIN
  SELECT id INTO old_user_id 
  FROM auth.users 
  WHERE email = 'ashgreninja123456788@gmail.com';
  
  IF old_user_id IS NOT NULL THEN
    DELETE FROM public.user_roles 
    WHERE user_id = old_user_id AND role = 'admin'::app_role;
  END IF;
END $$;

-- Assign admin role to new email if exists
DO $$
DECLARE
  new_user_id uuid;
BEGIN
  SELECT id INTO new_user_id 
  FROM auth.users 
  WHERE email = 'clientstrial@gmail.com';
  
  IF new_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;