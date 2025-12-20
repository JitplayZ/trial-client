-- Add DELETE policy for admins on user_badges table
CREATE POLICY "Admins can delete badges"
ON public.user_badges
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));