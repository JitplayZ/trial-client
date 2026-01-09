-- Block anonymous access to profiles table
-- This prevents unauthenticated users from accessing sensitive user data

CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);