-- Update the handle_new_user function to auto-assign admin role for specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
  
  -- Auto-assign admin role for specific email
  IF NEW.email = 'ashgreninja123456788@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Also assign admin role to the user if they already exist
DO $$
DECLARE
  target_user_id uuid;
BEGIN
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = 'ashgreninja123456788@gmail.com';
  
  IF target_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;