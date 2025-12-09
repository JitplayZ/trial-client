-- Update handle_new_user_subscription to give 10 starting credits to new users
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, beginner_left, intermediate_left, veteran_left, credits)
  VALUES (
    NEW.id,
    'free',
    5,   -- 5 free beginner projects per month
    2,   -- 2 free intermediate projects per month
    0,   -- veteran locked (0 = locked for free plan)
    10   -- 10 starting credits for new users
  );
  RETURN NEW;
END;
$$;

-- Update process_referral to ensure both users get +2 credits
CREATE OR REPLACE FUNCTION public.process_referral(_referral_code text, _referred_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $$
DECLARE
  _referrer_id uuid;
  _existing_referral record;
  _daily_limit record;
  _today date := CURRENT_DATE;
BEGIN
  -- Find the referrer by code
  SELECT user_id INTO _referrer_id
  FROM public.referral_codes
  WHERE code = upper(_referral_code);
  
  IF _referrer_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Invalid referral code');
  END IF;
  
  -- Cannot refer yourself
  IF _referrer_id = _referred_user_id THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Cannot use your own referral code');
  END IF;
  
  -- Check if user was already referred
  SELECT * INTO _existing_referral
  FROM public.referrals
  WHERE referred_id = _referred_user_id;
  
  IF _existing_referral IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'message', 'User already has a referrer');
  END IF;
  
  -- Check referrer's daily limit (max 1 referral reward per day)
  SELECT * INTO _daily_limit
  FROM public.referral_daily_limits
  WHERE user_id = _referrer_id AND reward_date = _today;
  
  IF _daily_limit IS NOT NULL AND _daily_limit.reward_count >= 1 THEN
    -- Still create the referral record but don't award credits to referrer today
    INSERT INTO public.referrals (referrer_id, referred_id, credits_awarded)
    VALUES (_referrer_id, _referred_user_id, false);
    
    -- Award credits only to the new user (+2 bonus on top of their 10 starting credits)
    UPDATE public.subscriptions
    SET credits = credits + 2
    WHERE user_id = _referred_user_id;
    
    RETURN jsonb_build_object(
      'ok', true, 
      'message', 'Referral recorded. New user received 2 bonus credits. Referrer daily limit reached.',
      'referrer_credits', 0,
      'referred_credits', 2
    );
  END IF;
  
  -- Create referral record with credits awarded
  INSERT INTO public.referrals (referrer_id, referred_id, credits_awarded)
  VALUES (_referrer_id, _referred_user_id, true);
  
  -- Update or create daily limit record for referrer
  INSERT INTO public.referral_daily_limits (user_id, reward_date, reward_count)
  VALUES (_referrer_id, _today, 1)
  ON CONFLICT (user_id, reward_date) 
  DO UPDATE SET reward_count = referral_daily_limits.reward_count + 1;
  
  -- Award +2 credits to the referrer
  UPDATE public.subscriptions
  SET credits = credits + 2
  WHERE user_id = _referrer_id;
  
  -- Award +2 bonus credits to the new user (they already have 10 starting credits)
  UPDATE public.subscriptions
  SET credits = credits + 2
  WHERE user_id = _referred_user_id;
  
  RETURN jsonb_build_object(
    'ok', true, 
    'message', 'Referral successful! Both users received 2 credits.',
    'referrer_credits', 2,
    'referred_credits', 2
  );
END;
$$;