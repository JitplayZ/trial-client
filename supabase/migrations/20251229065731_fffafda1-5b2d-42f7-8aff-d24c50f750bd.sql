-- Backend-enforced social reward cooldown state (server-time based)
CREATE OR REPLACE FUNCTION public.get_social_reward_cooldown()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _last_approved record;
  _now timestamptz;
  _cooldown_end timestamptz;
  _pending_exists boolean;
  _ms_remaining bigint;
BEGIN
  _user_id := auth.uid();

  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'message', 'User must be authenticated');
  END IF;

  _now := now();

  SELECT EXISTS(
    SELECT 1
    FROM public.social_reward_requests
    WHERE user_id = _user_id
      AND status = 'pending'
  ) INTO _pending_exists;

  SELECT id, reviewed_at
  INTO _last_approved
  FROM public.social_reward_requests
  WHERE user_id = _user_id
    AND status = 'approved'
    AND reviewed_at IS NOT NULL
  ORDER BY reviewed_at DESC
  LIMIT 1;

  IF _last_approved IS NULL THEN
    IF _pending_exists THEN
      RETURN jsonb_build_object(
        'ok', true,
        'allowed', false,
        'reason', 'You have a pending request awaiting review',
        'now', _now,
        'last_approved_at', NULL,
        'cooldown_end', NULL,
        'ms_remaining', NULL
      );
    END IF;

    RETURN jsonb_build_object(
      'ok', true,
      'allowed', true,
      'reason', 'No previous submissions',
      'now', _now,
      'last_approved_at', NULL,
      'cooldown_end', NULL,
      'ms_remaining', NULL
    );
  END IF;

  _cooldown_end := _last_approved.reviewed_at + interval '7 days';

  IF _now < _cooldown_end THEN
    _ms_remaining := (EXTRACT(EPOCH FROM (_cooldown_end - _now)) * 1000)::bigint;

    RETURN jsonb_build_object(
      'ok', true,
      'allowed', false,
      'reason', 'Cooldown active',
      'now', _now,
      'last_approved_at', _last_approved.reviewed_at,
      'cooldown_end', _cooldown_end,
      'ms_remaining', _ms_remaining
    );
  END IF;

  -- Cooldown complete; still block if a pending request exists.
  IF _pending_exists THEN
    RETURN jsonb_build_object(
      'ok', true,
      'allowed', false,
      'reason', 'You have a pending request awaiting review',
      'now', _now,
      'last_approved_at', _last_approved.reviewed_at,
      'cooldown_end', _cooldown_end,
      'ms_remaining', 0
    );
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'allowed', true,
    'reason', 'Eligible for new submission',
    'now', _now,
    'last_approved_at', _last_approved.reviewed_at,
    'cooldown_end', _cooldown_end,
    'ms_remaining', 0
  );
END;
$$;

-- Admin-only: set a user's most recent approved reviewed_at=now() for cooldown testing (NO credits, NO notifications)
CREATE OR REPLACE FUNCTION public.admin_set_social_reward_reviewed_at_now(_target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_id uuid;
  _target_request record;
  _previous_reviewed_at timestamptz;
  _new_reviewed_at timestamptz;
BEGIN
  _admin_id := auth.uid();

  IF NOT public.has_role(_admin_id, 'admin') THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Unauthorized');
  END IF;

  SELECT id, reviewed_at
  INTO _target_request
  FROM public.social_reward_requests
  WHERE user_id = _target_user_id
    AND status = 'approved'
  ORDER BY reviewed_at DESC NULLS LAST
  LIMIT 1;

  IF _target_request IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'message', 'No approved request found for this user');
  END IF;

  _previous_reviewed_at := _target_request.reviewed_at;
  _new_reviewed_at := now();

  UPDATE public.social_reward_requests
  SET reviewed_at = _new_reviewed_at,
      updated_at = now()
  WHERE id = _target_request.id;

  INSERT INTO public.admin_audit_logs (admin_user_id, action_type, target_user_id, details)
  VALUES (
    _admin_id,
    'social_reward_test_reviewed_at',
    _target_user_id,
    jsonb_build_object(
      'request_id', _target_request.id,
      'previous_reviewed_at', _previous_reviewed_at,
      'new_reviewed_at', _new_reviewed_at
    )
  );

  RETURN jsonb_build_object(
    'ok', true,
    'message', 'reviewed_at updated for testing',
    'request_id', _target_request.id,
    'new_reviewed_at', _new_reviewed_at
  );
END;
$$;
