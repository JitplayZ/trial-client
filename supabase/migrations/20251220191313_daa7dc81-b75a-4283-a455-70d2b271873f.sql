-- Add INSERT policy for referrals table (used by process_referral SECURITY DEFINER function)
-- This makes the policy explicit for clarity even though SECURITY DEFINER bypasses RLS
CREATE POLICY "System can insert referrals via function"
ON public.referrals
FOR INSERT
WITH CHECK (
  -- Only allow inserts where the referred user is the authenticated user
  -- This supports the process_referral() function flow
  auth.uid() = referred_id
);