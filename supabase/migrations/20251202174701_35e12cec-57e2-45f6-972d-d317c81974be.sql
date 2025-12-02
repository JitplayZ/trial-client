-- Remove the UPDATE policy that allows users to modify their own subscription
-- This prevents privilege escalation where users can upgrade their plan without payment
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;