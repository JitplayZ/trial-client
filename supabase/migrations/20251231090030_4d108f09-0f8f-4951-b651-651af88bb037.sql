-- Add ban_reason column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS ban_reason text DEFAULT NULL;

-- Update the admin_update_user_status function to accept ban_reason
CREATE OR REPLACE FUNCTION public.admin_update_user_status(
  _target_user_id uuid, 
  _new_status text, 
  _generation_enabled boolean,
  _ban_reason text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _admin_id UUID;
  _old_status TEXT;
  _old_generation BOOLEAN;
  _old_ban_reason TEXT;
BEGIN
  _admin_id := auth.uid();
  
  -- Verify admin role
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Unauthorized');
  END IF;
  
  -- Get current status
  SELECT status, generation_enabled, ban_reason INTO _old_status, _old_generation, _old_ban_reason
  FROM public.profiles
  WHERE user_id = _target_user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'message', 'User profile not found');
  END IF;
  
  -- Update profile - set ban_reason only when banning, clear it when unbanning
  UPDATE public.profiles
  SET 
    status = _new_status, 
    generation_enabled = _generation_enabled, 
    ban_reason = CASE 
      WHEN _new_status = 'suspended' AND NOT _generation_enabled THEN _ban_reason
      ELSE NULL
    END,
    updated_at = now()
  WHERE user_id = _target_user_id;
  
  -- Log the action
  INSERT INTO public.admin_audit_logs (admin_user_id, action_type, target_user_id, details)
  VALUES (_admin_id, 'status_update', _target_user_id, jsonb_build_object(
    'old_status', _old_status,
    'new_status', _new_status,
    'old_generation_enabled', _old_generation,
    'new_generation_enabled', _generation_enabled,
    'old_ban_reason', _old_ban_reason,
    'new_ban_reason', _ban_reason
  ));
  
  RETURN jsonb_build_object('ok', true, 'message', 'User status updated');
END;
$function$;