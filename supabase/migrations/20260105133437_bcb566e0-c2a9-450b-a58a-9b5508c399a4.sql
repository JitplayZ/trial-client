-- Ensure maintenance_mode setting exists (toggle previously updated 0 rows if missing)
INSERT INTO public.system_settings (key, value)
VALUES (
  'maintenance_mode',
  jsonb_build_object(
    'enabled', false,
    'message', 'We are currently undergoing scheduled maintenance.'
  )
)
ON CONFLICT (key) DO NOTHING;

-- Make maintenance check safe when row is missing
CREATE OR REPLACE FUNCTION public.is_maintenance_mode()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (
      SELECT (value->>'enabled')::boolean
      FROM public.system_settings
      WHERE key = 'maintenance_mode'
      LIMIT 1
    ),
    false
  );
$$;

-- Upsert maintenance mode so admin toggle actually persists even if the row doesn't exist yet
CREATE OR REPLACE FUNCTION public.set_maintenance_mode(_enabled boolean, _message text DEFAULT NULL::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _admin_id UUID;
  _existing_message text;
  _final_message text;
BEGIN
  _admin_id := auth.uid();

  -- Verify admin role
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Unauthorized');
  END IF;

  SELECT value->>'message'
    INTO _existing_message
  FROM public.system_settings
  WHERE key = 'maintenance_mode'
  LIMIT 1;

  _final_message := COALESCE(
    _message,
    _existing_message,
    'We are currently undergoing scheduled maintenance.'
  );

  INSERT INTO public.system_settings (key, value, updated_by)
  VALUES (
    'maintenance_mode',
    jsonb_build_object('enabled', _enabled, 'message', _final_message),
    _admin_id
  )
  ON CONFLICT (key)
  DO UPDATE SET
    value = jsonb_build_object('enabled', _enabled, 'message', _final_message),
    updated_at = now(),
    updated_by = _admin_id;

  -- Log the action
  INSERT INTO public.admin_audit_logs (admin_user_id, action_type, details)
  VALUES (
    _admin_id,
    'maintenance_mode_changed',
    jsonb_build_object('enabled', _enabled, 'message', _final_message)
  );

  RETURN jsonb_build_object('ok', true, 'message', 'Maintenance mode updated', 'enabled', _enabled);
END;
$$;

-- =========================================================
-- Backend enforcement: block non-admin user table access during maintenance
-- (Policies are PERMISSIVE/ORed; so we must modify existing user policies)
-- =========================================================

-- admin_notifications
DROP POLICY IF EXISTS "Users can view their notifications" ON public.admin_notifications;
CREATE POLICY "Users can view their notifications"
ON public.admin_notifications
FOR SELECT
TO public
USING (
  ((target_user_id = auth.uid()) OR (target_user_id IS NULL))
  AND NOT public.is_maintenance_mode()
);

-- profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO public
USING (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO public
USING (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

-- projects
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
CREATE POLICY "Users can view their own projects"
ON public.projects
FOR SELECT
TO public
USING (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
CREATE POLICY "Users can create their own projects"
ON public.projects
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
ON public.projects
FOR UPDATE
TO public
USING (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects"
ON public.projects
FOR DELETE
TO public
USING (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

-- referral_codes
DROP POLICY IF EXISTS "Users can view their own referral code" ON public.referral_codes;
CREATE POLICY "Users can view their own referral code"
ON public.referral_codes
FOR SELECT
TO public
USING (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

DROP POLICY IF EXISTS "Users can create their own referral code" ON public.referral_codes;
CREATE POLICY "Users can create their own referral code"
ON public.referral_codes
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

-- referrals
DROP POLICY IF EXISTS "Users can view their referrals" ON public.referrals;
CREATE POLICY "Users can view their referrals"
ON public.referrals
FOR SELECT
TO public
USING (
  (auth.uid() = referrer_id)
  AND NOT public.is_maintenance_mode()
);

DROP POLICY IF EXISTS "System can insert referrals via function" ON public.referrals;
CREATE POLICY "System can insert referrals via function"
ON public.referrals
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = referred_id)
  AND NOT public.is_maintenance_mode()
);

-- social_reward_requests
DROP POLICY IF EXISTS "Users can view their own requests" ON public.social_reward_requests;
CREATE POLICY "Users can view their own requests"
ON public.social_reward_requests
FOR SELECT
TO public
USING (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

DROP POLICY IF EXISTS "Users can submit their own requests" ON public.social_reward_requests;
CREATE POLICY "Users can submit their own requests"
ON public.social_reward_requests
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

-- subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.subscriptions;
CREATE POLICY "Users can view their own subscription"
ON public.subscriptions
FOR SELECT
TO public
USING (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

-- support_messages
DROP POLICY IF EXISTS "Users can view their own support messages" ON public.support_messages;
CREATE POLICY "Users can view their own support messages"
ON public.support_messages
FOR SELECT
TO public
USING (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

DROP POLICY IF EXISTS "Users can create their own support messages" ON public.support_messages;
CREATE POLICY "Users can create their own support messages"
ON public.support_messages
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

-- user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO public
USING (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

-- user_xp
DROP POLICY IF EXISTS "Users can view their own XP" ON public.user_xp;
CREATE POLICY "Users can view their own XP"
ON public.user_xp
FOR SELECT
TO public
USING (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

DROP POLICY IF EXISTS "Users can insert their own XP" ON public.user_xp;
CREATE POLICY "Users can insert their own XP"
ON public.user_xp
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

DROP POLICY IF EXISTS "Users can update their own XP" ON public.user_xp;
CREATE POLICY "Users can update their own XP"
ON public.user_xp
FOR UPDATE
TO public
USING (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

-- xp_events
DROP POLICY IF EXISTS "Users can view their own XP events" ON public.xp_events;
CREATE POLICY "Users can view their own XP events"
ON public.xp_events
FOR SELECT
TO public
USING (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);

DROP POLICY IF EXISTS "Users can insert their own XP events" ON public.xp_events;
CREATE POLICY "Users can insert their own XP events"
ON public.xp_events
FOR INSERT
TO public
WITH CHECK (
  (auth.uid() = user_id)
  AND NOT public.is_maintenance_mode()
);
