-- Add credits column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS credits integer NOT NULL DEFAULT 0;

-- Update the free plan defaults to match new rules:
-- Beginner: 5 free/month (was unlimited/-1)
-- Intermediate: 2 free/month (same)
-- Veteran: 0 (locked until paid)

-- Update the trigger function for new users with new defaults
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, beginner_left, intermediate_left, veteran_left, credits)
  VALUES (
    NEW.id,
    'free',
    5,   -- 5 free beginner projects per month
    2,   -- 2 free intermediate projects per month
    0,   -- veteran locked (0 = locked for free plan)
    0    -- start with 0 credits
  );
  RETURN NEW;
END;
$function$;

-- Create a function to check and consume credits (used by edge function)
CREATE OR REPLACE FUNCTION public.check_and_consume_quota(
  _user_id uuid,
  _level text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _subscription record;
  _free_column text;
  _free_left integer;
  _credit_cost integer;
  _result jsonb;
BEGIN
  -- Get user subscription
  SELECT * INTO _subscription FROM public.subscriptions WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'status', 404, 'message', 'Subscription not found');
  END IF;
  
  -- Determine credit cost per level
  CASE _level
    WHEN 'beginner' THEN _credit_cost := 1; _free_column := 'beginner_left';
    WHEN 'intermediate' THEN _credit_cost := 2; _free_column := 'intermediate_left';
    WHEN 'veteran' THEN _credit_cost := 4; _free_column := 'veteran_left';
    ELSE RETURN jsonb_build_object('ok', false, 'status', 400, 'message', 'Invalid level');
  END CASE;
  
  -- Get current free quota
  EXECUTE format('SELECT %I FROM public.subscriptions WHERE user_id = $1', _free_column)
    INTO _free_left USING _user_id;
  
  -- Veteran level check: must have paid plan
  IF _level = 'veteran' AND _subscription.plan = 'free' THEN
    RETURN jsonb_build_object('ok', false, 'status', 403, 'message', 'Veteran level requires a paid plan');
  END IF;
  
  -- Check if free quota available
  IF _free_left > 0 THEN
    -- Consume free quota
    EXECUTE format('UPDATE public.subscriptions SET %I = %I - 1 WHERE user_id = $1', _free_column, _free_column)
      USING _user_id;
    RETURN jsonb_build_object('ok', true, 'status', 200, 'message', 'Free quota consumed', 'credits_used', 0);
  END IF;
  
  -- No free quota, check credits
  IF _subscription.credits < _credit_cost THEN
    RETURN jsonb_build_object(
      'ok', false, 
      'status', 402, 
      'message', format('Insufficient credits. Required: %s, Available: %s', _credit_cost, _subscription.credits)
    );
  END IF;
  
  -- Deduct credits
  UPDATE public.subscriptions 
  SET credits = credits - _credit_cost 
  WHERE user_id = _user_id;
  
  RETURN jsonb_build_object('ok', true, 'status', 200, 'message', 'Credits consumed', 'credits_used', _credit_cost);
END;
$function$;

-- Create index on credits for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_credits ON public.subscriptions(credits);