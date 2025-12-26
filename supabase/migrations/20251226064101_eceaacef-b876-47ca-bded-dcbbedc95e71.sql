-- ============================================
-- FIX: referral_codes_update - Block all UPDATE operations
-- Only SECURITY DEFINER functions (process_referral) can update
-- ============================================
CREATE POLICY "Block referral code updates"
ON public.referral_codes
FOR UPDATE
USING (false);

-- ============================================
-- FIX: client_side_subscription_insert - Block direct INSERT
-- Subscriptions should ONLY be created by:
-- 1. handle_new_user_subscription() trigger on signup
-- 2. Admin functions for manual intervention
-- ============================================
DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.subscriptions;

CREATE POLICY "Block direct subscription creation"
ON public.subscriptions
FOR INSERT
WITH CHECK (false);