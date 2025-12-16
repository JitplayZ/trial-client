-- Add usage tracking and limit to referral_codes table
ALTER TABLE public.referral_codes 
ADD COLUMN IF NOT EXISTS max_uses integer NOT NULL DEFAULT 10,
ADD COLUMN IF NOT EXISTS use_count integer NOT NULL DEFAULT 0;

-- Update process_referral function to enforce max uses per code
CREATE OR REPLACE FUNCTION public.process_referral(_referral_code text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _referrer_id uuid;
  _referred_user_id uuid;
  _existing_referral record;
  _daily_limit record;
  _referral_code_record record;
  _today date := CURRENT_DATE;
BEGIN
  -- Use auth.uid() instead of accepting user_id as parameter (security fix)
  _referred_user_id := auth.uid();
  
  IF _referred_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'message', 'User must be authenticated');
  END IF;

  -- Find the referrer by code and check usage limits
  SELECT user_id, max_uses, use_count INTO _referral_code_record
  FROM public.referral_codes
  WHERE code = upper(_referral_code);
  
  IF _referral_code_record IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Invalid referral code');
  END IF;
  
  _referrer_id := _referral_code_record.user_id;
  
  -- Check if referral code has reached max uses
  IF _referral_code_record.use_count >= _referral_code_record.max_uses THEN
    RETURN jsonb_build_object('ok', false, 'message', 'This referral code has reached its maximum usage limit');
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
  
  -- Increment referral code use count
  UPDATE public.referral_codes
  SET use_count = use_count + 1
  WHERE code = upper(_referral_code);
  
  -- Check referrer's daily limit (max 1 referral reward per day)
  SELECT * INTO _daily_limit
  FROM public.referral_daily_limits
  WHERE user_id = _referrer_id AND reward_date = _today;
  
  IF _daily_limit IS NOT NULL AND _daily_limit.reward_count >= 1 THEN
    -- Still create the referral record but don't award credits to referrer today
    INSERT INTO public.referrals (referrer_id, referred_id, credits_awarded)
    VALUES (_referrer_id, _referred_user_id, false);
    
    -- Award credits only to the new user (+2 bonus on top of their 5 starting credits)
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
  
  -- Award +2 bonus credits to the new user (they already have 5 starting credits)
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
$function$;