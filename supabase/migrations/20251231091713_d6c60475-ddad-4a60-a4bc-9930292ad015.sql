-- Drop the old function signature (without _ban_reason)
DROP FUNCTION IF EXISTS public.admin_update_user_status(uuid, text, boolean);

-- The function with _ban_reason parameter already exists and will be kept