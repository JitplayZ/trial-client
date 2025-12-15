-- Create admin_audit_logs table for tracking admin actions
CREATE TABLE public.admin_audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert audit logs
CREATE POLICY "Admins can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add status and generation_enabled columns to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS generation_enabled BOOLEAN DEFAULT true;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_user ON public.admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);

-- Create function for admins to update user credits (with audit logging)
CREATE OR REPLACE FUNCTION public.admin_update_user_credits(
  _target_user_id UUID,
  _credit_change INTEGER,
  _reason TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_id UUID;
  _current_credits INTEGER;
  _new_credits INTEGER;
BEGIN
  _admin_id := auth.uid();
  
  -- Verify admin role
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Unauthorized');
  END IF;
  
  -- Get current credits
  SELECT credits INTO _current_credits
  FROM public.subscriptions
  WHERE user_id = _target_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'message', 'User subscription not found');
  END IF;
  
  _new_credits := _current_credits + _credit_change;
  
  -- Prevent negative credits
  IF _new_credits < 0 THEN
    _new_credits := 0;
  END IF;
  
  -- Update credits
  UPDATE public.subscriptions
  SET credits = _new_credits, updated_at = now()
  WHERE user_id = _target_user_id;
  
  -- Log the action
  INSERT INTO public.admin_audit_logs (admin_user_id, action_type, target_user_id, details)
  VALUES (_admin_id, 'credit_update', _target_user_id, jsonb_build_object(
    'previous_credits', _current_credits,
    'credit_change', _credit_change,
    'new_credits', _new_credits,
    'reason', _reason
  ));
  
  RETURN jsonb_build_object('ok', true, 'message', 'Credits updated', 'new_credits', _new_credits);
END;
$$;

-- Create function for admins to update user status
CREATE OR REPLACE FUNCTION public.admin_update_user_status(
  _target_user_id UUID,
  _new_status TEXT,
  _generation_enabled BOOLEAN
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_id UUID;
  _old_status TEXT;
  _old_generation BOOLEAN;
BEGIN
  _admin_id := auth.uid();
  
  -- Verify admin role
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Unauthorized');
  END IF;
  
  -- Get current status
  SELECT status, generation_enabled INTO _old_status, _old_generation
  FROM public.profiles
  WHERE user_id = _target_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'message', 'User profile not found');
  END IF;
  
  -- Update profile
  UPDATE public.profiles
  SET status = _new_status, generation_enabled = _generation_enabled, updated_at = now()
  WHERE user_id = _target_user_id;
  
  -- Log the action
  INSERT INTO public.admin_audit_logs (admin_user_id, action_type, target_user_id, details)
  VALUES (_admin_id, 'status_update', _target_user_id, jsonb_build_object(
    'old_status', _old_status,
    'new_status', _new_status,
    'old_generation_enabled', _old_generation,
    'new_generation_enabled', _generation_enabled
  ));
  
  RETURN jsonb_build_object('ok', true, 'message', 'User status updated');
END;
$$;

-- RLS policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy for admins to update profiles
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy for admins to view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy for admins to view all projects
CREATE POLICY "Admins can view all projects"
ON public.projects
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy for admins to view all referrals
CREATE POLICY "Admins can view all referrals"
ON public.referrals
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policy for admins to view all referral_codes
CREATE POLICY "Admins can view all referral codes"
ON public.referral_codes
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));