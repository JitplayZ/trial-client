-- Add policy to allow admins to delete projects (for cleaning stuck queues)
CREATE POLICY "Admins can delete all projects"
ON public.projects
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));