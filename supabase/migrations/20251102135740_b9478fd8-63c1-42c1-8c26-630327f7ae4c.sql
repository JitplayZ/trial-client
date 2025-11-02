-- Add missing columns to projects table
ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS level text,
ADD COLUMN IF NOT EXISTS industry text,
ADD COLUMN IF NOT EXISTS brief_data jsonb;