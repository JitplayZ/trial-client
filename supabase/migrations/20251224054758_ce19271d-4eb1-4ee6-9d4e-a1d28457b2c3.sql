-- Add last_ip column to profiles table for IP tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_ip TEXT,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Create index for IP queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_ip ON public.profiles(last_ip);

-- Create function to update last login info (called by edge function)
CREATE OR REPLACE FUNCTION public.update_user_login_info(_user_id UUID, _ip_address TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_ip = _ip_address,
      last_login_at = now(),
      updated_at = now()
  WHERE user_id = _user_id;
  
  RETURN jsonb_build_object('ok', true);
END;
$$;