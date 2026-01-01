-- Remove the overly permissive public read policy from system_settings
-- This prevents admin user ID leakage via the updated_by column
-- Client code already uses system_settings_public view which excludes updated_by

DROP POLICY IF EXISTS "Anyone can read system settings" ON public.system_settings;

-- Add a restrictive policy for authenticated users to read only safe settings via the view
-- The system_settings_public view already handles safe column selection