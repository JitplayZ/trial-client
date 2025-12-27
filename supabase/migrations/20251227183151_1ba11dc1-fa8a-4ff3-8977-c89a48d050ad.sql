-- Fix Security Definer View issue
-- Drop the view and recreate with SECURITY INVOKER (default in Postgres)
DROP VIEW IF EXISTS public.system_settings_public;

-- Recreate view with explicit SECURITY INVOKER to ensure RLS is respected
CREATE VIEW public.system_settings_public 
WITH (security_invoker = true)
AS
SELECT id, key, value, updated_at
FROM public.system_settings;

-- Grant access to the view
GRANT SELECT ON public.system_settings_public TO anon, authenticated;