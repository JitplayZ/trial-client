-- Update the handle_new_user_subscription function to give 5 starting credits (not 10)
-- and set beginner_left to 3 (not 5)
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
    3,   -- 3 free beginner projects per month (updated from 5)
    2,   -- 2 free intermediate projects per month
    0,   -- veteran locked (0 = locked for free plan)
    5    -- 5 starting credits for new users (updated from 10)
  );
  RETURN NEW;
END;
$function$;

-- Update the reset_monthly_quotas function with new beginner quota values
CREATE OR REPLACE FUNCTION public.reset_monthly_quotas()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Reset quotas based on plan
  UPDATE public.subscriptions
  SET 
    beginner_left = CASE plan
      WHEN 'free' THEN 3     -- Updated from 5 to 3
      WHEN 'pro' THEN 10
      WHEN 'proplus' THEN 20
      ELSE 3
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
$function$;

-- Create a new function that only checks quota without consuming it
-- This allows us to validate before processing
CREATE OR REPLACE FUNCTION public.check_quota_availability(_user_id uuid, _level text)
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
    WHEN 'veteran' THEN _credit_cost := 5; _free_column := 'veteran_left';
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
    RETURN jsonb_build_object('ok', true, 'status', 200, 'message', 'Free quota available', 'credits_to_use', 0, 'use_free_quota', true);
  END IF;
  
  -- No free quota, check credits
  IF _subscription.credits < _credit_cost THEN
    RETURN jsonb_build_object(
      'ok', false, 
      'status', 402, 
      'message', format('You have insufficient credit balance. Required: %s, Available: %s', _credit_cost, _subscription.credits)
    );
  END IF;
  
  RETURN jsonb_build_object('ok', true, 'status', 200, 'message', 'Credits available', 'credits_to_use', _credit_cost, 'use_free_quota', false);
END;
$function$;

-- Create a function to consume quota AFTER successful generation
CREATE OR REPLACE FUNCTION public.consume_quota_after_success(_user_id uuid, _level text)
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
BEGIN
  -- Get user subscription
  SELECT * INTO _subscription FROM public.subscriptions WHERE user_id = _user_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Subscription not found');
  END IF;
  
  -- Determine credit cost per level
  CASE _level
    WHEN 'beginner' THEN _credit_cost := 1; _free_column := 'beginner_left';
    WHEN 'intermediate' THEN _credit_cost := 2; _free_column := 'intermediate_left';
    WHEN 'veteran' THEN _credit_cost := 5; _free_column := 'veteran_left';
    ELSE RETURN jsonb_build_object('ok', false, 'message', 'Invalid level');
  END CASE;
  
  -- Get current free quota
  EXECUTE format('SELECT %I FROM public.subscriptions WHERE user_id = $1', _free_column)
    INTO _free_left USING _user_id;
  
  -- Check if free quota available - consume it first
  IF _free_left > 0 THEN
    EXECUTE format('UPDATE public.subscriptions SET %I = %I - 1 WHERE user_id = $1', _free_column, _free_column)
      USING _user_id;
    RETURN jsonb_build_object('ok', true, 'message', 'Free quota consumed', 'credits_used', 0);
  END IF;
  
  -- No free quota, deduct credits
  UPDATE public.subscriptions 
  SET credits = credits - _credit_cost 
  WHERE user_id = _user_id;
  
  RETURN jsonb_build_object('ok', true, 'message', 'Credits consumed', 'credits_used', _credit_cost);
END;
$function$;