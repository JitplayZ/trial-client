-- Add unique constraint on post_url to prevent duplicate submissions
-- Drop existing constraint if exists (safe operation)
ALTER TABLE public.social_reward_requests DROP CONSTRAINT IF EXISTS unique_post_url;
ALTER TABLE public.social_reward_requests ADD CONSTRAINT unique_post_url UNIQUE (post_url);

-- Create a function to check if user can submit a social reward request (weekly limit)
CREATE OR REPLACE FUNCTION public.can_submit_social_reward(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _last_approved RECORD;
  _days_since_last integer;
BEGIN
  -- Find the most recent approved request for this user
  SELECT * INTO _last_approved
  FROM public.social_reward_requests
  WHERE user_id = _user_id
    AND status = 'approved'
  ORDER BY reviewed_at DESC
  LIMIT 1;
  
  -- If no approved request exists, user can submit
  IF _last_approved IS NULL THEN
    -- Check if there's a pending request
    IF EXISTS (SELECT 1 FROM public.social_reward_requests WHERE user_id = _user_id AND status = 'pending') THEN
      RETURN jsonb_build_object('allowed', false, 'reason', 'You have a pending request awaiting review');
    END IF;
    RETURN jsonb_build_object('allowed', true, 'reason', 'No previous submissions');
  END IF;
  
  -- Calculate days since last approved request
  _days_since_last := EXTRACT(DAY FROM (now() - _last_approved.reviewed_at));
  
  -- Check if 7 days have passed
  IF _days_since_last < 7 THEN
    RETURN jsonb_build_object(
      'allowed', false, 
      'reason', format('You can submit again in %s day(s)', 7 - _days_since_last),
      'days_remaining', 7 - _days_since_last,
      'last_approved_at', _last_approved.reviewed_at
    );
  END IF;
  
  -- Check if there's already a pending request
  IF EXISTS (SELECT 1 FROM public.social_reward_requests WHERE user_id = _user_id AND status = 'pending') THEN
    RETURN jsonb_build_object('allowed', false, 'reason', 'You have a pending request awaiting review');
  END IF;
  
  RETURN jsonb_build_object('allowed', true, 'reason', 'Eligible for new submission');
END;
$$;

-- Create a trigger function to enforce weekly limit on insert
CREATE OR REPLACE FUNCTION public.enforce_social_reward_weekly_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _check_result jsonb;
BEGIN
  -- Check if user can submit
  _check_result := public.can_submit_social_reward(NEW.user_id);
  
  IF NOT (_check_result->>'allowed')::boolean THEN
    RAISE EXCEPTION 'Social reward submission blocked: %', _check_result->>'reason';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS enforce_weekly_social_reward ON public.social_reward_requests;

-- Create trigger to enforce weekly limit
CREATE TRIGGER enforce_weekly_social_reward
  BEFORE INSERT ON public.social_reward_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_social_reward_weekly_limit();