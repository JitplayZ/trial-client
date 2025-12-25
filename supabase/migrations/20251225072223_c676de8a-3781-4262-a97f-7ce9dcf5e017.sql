-- Update handle_new_user function to include Google OAuth avatar
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (NEW.id, 0, 1);
  
  INSERT INTO public.subscriptions (user_id, plan, credits, beginner_left, intermediate_left, veteran_left)
  VALUES (NEW.id, 'free', 0, -1, 2, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Also update existing users who signed up with Google but don't have avatar_url set
-- This will sync avatars for users who already signed up with Google
UPDATE public.profiles p
SET avatar_url = u.raw_user_meta_data->>'picture'
FROM auth.users u
WHERE p.user_id = u.id 
  AND p.avatar_url IS NULL 
  AND u.raw_user_meta_data->>'picture' IS NOT NULL;