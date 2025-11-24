-- Update the handle_new_user function to remove hardcoded admin email
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