-- Create admin_delete_user function to properly delete users from auth.users
CREATE OR REPLACE FUNCTION public.admin_delete_user(_target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_id UUID;
  _target_email TEXT;
BEGIN
  _admin_id := auth.uid();
  
  -- Verify admin role
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;
  
  -- Prevent self-deletion
  IF _admin_id = _target_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'Cannot delete your own account');
  END IF;
  
  -- Get target user email for audit log
  SELECT email INTO _target_email FROM public.profiles WHERE user_id = _target_user_id;
  
  IF _target_email IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'User not found');
  END IF;
  
  -- Log the action before deletion
  INSERT INTO public.admin_audit_logs (admin_user_id, action_type, target_user_id, details)
  VALUES (_admin_id, 'user_deleted', _target_user_id, jsonb_build_object(
    'deleted_email', _target_email,
    'deleted_at', now()
  ));
  
  -- Delete from auth.users (this will cascade to all related tables)
  DELETE FROM auth.users WHERE id = _target_user_id;
  
  RETURN jsonb_build_object('success', true, 'message', 'User deleted successfully');
END;
$$;