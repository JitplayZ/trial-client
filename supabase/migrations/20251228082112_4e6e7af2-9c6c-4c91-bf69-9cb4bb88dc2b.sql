-- Drop the redundant subscription trigger that's causing duplicate key errors
-- The handle_new_user function already handles subscription creation with ON CONFLICT DO NOTHING

DROP TRIGGER IF EXISTS on_auth_user_created_subscription ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_subscription();

-- Also update handle_new_user to use the correct initial values from the dropped trigger
-- and add ON CONFLICT handling for all tables to prevent any future issues

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert profile with conflict handling
  INSERT INTO public.profiles (user_id, display_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert XP with conflict handling
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (NEW.id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Insert subscription with correct initial values and conflict handling
  INSERT INTO public.subscriptions (user_id, plan, credits, beginner_left, intermediate_left, veteran_left)
  VALUES (NEW.id, 'free', 5, 3, 2, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;