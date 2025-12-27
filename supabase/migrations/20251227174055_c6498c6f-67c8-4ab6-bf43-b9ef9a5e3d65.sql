-- Create system_settings table for maintenance mode and other system-wide settings
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read system settings (needed to check maintenance mode)
CREATE POLICY "Anyone can read system settings"
ON public.system_settings
FOR SELECT
USING (true);

-- Only admins can update system settings
CREATE POLICY "Admins can update system settings"
ON public.system_settings
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert system settings
CREATE POLICY "Admins can insert system settings"
ON public.system_settings
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Insert default maintenance mode setting
INSERT INTO public.system_settings (key, value)
VALUES ('maintenance_mode', '{"enabled": false, "message": "We are currently undergoing scheduled maintenance. Please check back shortly."}'::jsonb);

-- Create function to check maintenance mode (for use in edge functions)
CREATE OR REPLACE FUNCTION public.is_maintenance_mode()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((value->>'enabled')::boolean, false)
  FROM public.system_settings
  WHERE key = 'maintenance_mode'
  LIMIT 1
$$;

-- Create function to toggle maintenance mode (admin only)
CREATE OR REPLACE FUNCTION public.set_maintenance_mode(_enabled boolean, _message text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_id UUID;
  _current_value jsonb;
BEGIN
  _admin_id := auth.uid();
  
  -- Verify admin role
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Unauthorized');
  END IF;
  
  -- Get current value to preserve message if not provided
  SELECT value INTO _current_value
  FROM public.system_settings
  WHERE key = 'maintenance_mode';
  
  -- Update maintenance mode
  UPDATE public.system_settings
  SET 
    value = jsonb_build_object(
      'enabled', _enabled,
      'message', COALESCE(_message, _current_value->>'message', 'We are currently undergoing scheduled maintenance.')
    ),
    updated_at = now(),
    updated_by = _admin_id
  WHERE key = 'maintenance_mode';
  
  -- Log the action
  INSERT INTO public.admin_audit_logs (admin_user_id, action_type, details)
  VALUES (_admin_id, 'maintenance_mode_changed', jsonb_build_object(
    'enabled', _enabled,
    'message', COALESCE(_message, _current_value->>'message')
  ));
  
  RETURN jsonb_build_object('ok', true, 'message', 'Maintenance mode updated', 'enabled', _enabled);
END;
$$;