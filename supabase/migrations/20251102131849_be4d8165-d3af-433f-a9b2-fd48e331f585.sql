-- Allow users to insert their own subscription
CREATE POLICY "Users can insert their own subscription"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);