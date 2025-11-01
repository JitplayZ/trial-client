-- Create subscriptions table for server-side quota management
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'proplus')),
  beginner_left integer NOT NULL DEFAULT -1,
  intermediate_left integer NOT NULL DEFAULT 2,
  veteran_left integer NOT NULL DEFAULT 0,
  reset_at timestamp with time zone NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own quota consumption (for client-side tracking)
CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-create subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_subscription()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.subscriptions (user_id, plan, beginner_left, intermediate_left, veteran_left)
  VALUES (
    NEW.id,
    'free',
    -1,  -- unlimited beginner
    2,   -- 2 intermediate for free
    0    -- 0 veteran for free (locked)
  );
  RETURN NEW;
END;
$$;

-- Trigger to create subscription on user creation
CREATE TRIGGER on_auth_user_created_subscription
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_subscription();

-- Update trigger for timestamps
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();