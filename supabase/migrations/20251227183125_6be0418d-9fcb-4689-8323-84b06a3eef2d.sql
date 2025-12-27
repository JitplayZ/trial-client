-- =====================================================
-- SECURITY FIX 1: Block direct subscription updates
-- Users could manipulate credits, plan, and quotas directly
-- =====================================================

-- Drop the permissive UPDATE policy that allows users to update their own subscription
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

-- Create a policy that blocks ALL direct UPDATE operations from regular users
-- All subscription modifications MUST go through SECURITY DEFINER functions:
-- - check_and_consume_quota()
-- - consume_quota_after_success()
-- - admin_update_user_credits()
-- - process_referral()
-- - admin_review_social_reward()
-- - reset_monthly_quotas()
CREATE POLICY "Block direct subscription updates"
ON public.subscriptions
FOR UPDATE
USING (false);

-- Allow admins to update subscriptions for emergency fixes via dashboard
CREATE POLICY "Admins can update subscriptions"
ON public.subscriptions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- SECURITY FIX 2: Hide admin user IDs in system_settings
-- Create a public view that excludes the updated_by column
-- =====================================================

-- Create a view that only exposes safe columns (no updated_by)
CREATE OR REPLACE VIEW public.system_settings_public AS
SELECT id, key, value, updated_at
FROM public.system_settings;

-- Grant access to the view for authenticated and anonymous users
GRANT SELECT ON public.system_settings_public TO anon, authenticated;

-- Update the RLS policy to restrict direct table access
-- Keep public read for backwards compatibility but the view is preferred
-- The existing "Anyone can read system settings" policy remains for RPC compatibility
-- Applications should migrate to use the view instead