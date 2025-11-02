-- Add status field to projects table to track generation progress
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed'));

-- Add index for faster status queries
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);

-- Update existing projects to 'completed' status
UPDATE public.projects SET status = 'completed' WHERE status IS NULL;