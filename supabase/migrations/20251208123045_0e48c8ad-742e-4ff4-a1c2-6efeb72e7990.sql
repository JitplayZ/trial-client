-- =============================================
-- REFERRAL SYSTEM TABLES
-- =============================================

-- Referral codes table (one per user)
CREATE TABLE public.referral_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Users can view their own referral code
CREATE POLICY "Users can view their own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own referral code
CREATE POLICY "Users can create their own referral code"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Referral tracking table
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL UNIQUE, -- Each user can only be referred once
  credits_awarded boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Users can view referrals where they are the referrer
CREATE POLICY "Users can view their referrals"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

-- Daily referral limit tracking table
CREATE TABLE public.referral_daily_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  reward_date date NOT NULL DEFAULT CURRENT_DATE,
  reward_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, reward_date)
);

-- Enable RLS
ALTER TABLE public.referral_daily_limits ENABLE ROW LEVEL SECURITY;

-- Users can view their own daily limits
CREATE POLICY "Users can view their own daily limits"
  ON public.referral_daily_limits FOR SELECT
  USING (auth.uid() = user_id);

-- =============================================
-- FUNCTION: Generate unique referral code
-- =============================================
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- =============================================
-- FUNCTION: Process referral signup
-- =============================================
CREATE OR REPLACE FUNCTION public.process_referral(
  _referral_code text,
  _referred_user_id uuid
)
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
  
  -- Check referrer's daily limit
  SELECT * INTO _daily_limit
  FROM public.referral_daily_limits
  WHERE user_id = _referrer_id AND reward_date = _today;
  
  IF _daily_limit IS NOT NULL AND _daily_limit.reward_count >= 1 THEN
    -- Still create the referral but don't award credits to referrer today
    INSERT INTO public.referrals (referrer_id, referred_id, credits_awarded)
    VALUES (_referrer_id, _referred_user_id, false);
    
    -- Award credits only to the new user
    UPDATE public.subscriptions
    SET credits = credits + 2
    WHERE user_id = _referred_user_id;
    
    RETURN jsonb_build_object(
      'ok', true, 
      'message', 'Referral recorded. New user received credits. Referrer daily limit reached.',
      'referrer_credits', 0,
      'referred_credits', 2
    );
  END IF;
  
  -- Create referral record
  INSERT INTO public.referrals (referrer_id, referred_id, credits_awarded)
  VALUES (_referrer_id, _referred_user_id, true);
  
  -- Update or create daily limit record for referrer
  INSERT INTO public.referral_daily_limits (user_id, reward_date, reward_count)
  VALUES (_referrer_id, _today, 1)
  ON CONFLICT (user_id, reward_date) 
  DO UPDATE SET reward_count = referral_daily_limits.reward_count + 1;
  
  -- Award credits to both users
  UPDATE public.subscriptions
  SET credits = credits + 2
  WHERE user_id IN (_referrer_id, _referred_user_id);
  
  RETURN jsonb_build_object(
    'ok', true, 
    'message', 'Referral successful! Both users received 2 credits.',
    'referrer_credits', 2,
    'referred_credits', 2
  );
END;
$$;

-- =============================================
-- TRIGGER: Auto-create referral code on user signup
-- =============================================
CREATE OR REPLACE FUNCTION public.create_user_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  attempts integer := 0;
BEGIN
  -- Generate unique code with retry logic
  LOOP
    new_code := generate_referral_code();
    BEGIN
      INSERT INTO public.referral_codes (user_id, code)
      VALUES (NEW.id, new_code);
      EXIT; -- Success, exit loop
    EXCEPTION WHEN unique_violation THEN
      attempts := attempts + 1;
      IF attempts >= 10 THEN
        RAISE EXCEPTION 'Could not generate unique referral code';
      END IF;
    END;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new users
CREATE TRIGGER on_user_created_referral_code
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_referral_code();

-- =============================================
-- MONTHLY QUOTA RESET FUNCTION (for cron job)
-- =============================================
CREATE OR REPLACE FUNCTION public.reset_monthly_quotas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Reset quotas based on plan
  UPDATE public.subscriptions
  SET 
    beginner_left = CASE plan
      WHEN 'free' THEN 5
      WHEN 'pro' THEN 10
      WHEN 'proplus' THEN 20
      ELSE 5
    END,
    intermediate_left = CASE plan
      WHEN 'free' THEN 2
      WHEN 'pro' THEN 5
      WHEN 'proplus' THEN 10
      ELSE 2
    END,
    veteran_left = CASE plan
      WHEN 'free' THEN 0
      WHEN 'pro' THEN 2
      WHEN 'proplus' THEN 5
      ELSE 0
    END,
    reset_at = date_trunc('month', now()) + interval '1 month',
    updated_at = now()
  WHERE reset_at <= now();
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX idx_referral_daily_limits_user_date ON public.referral_daily_limits(user_id, reward_date);