-- Create a function to validate social reward URLs on insert/update only
CREATE OR REPLACE FUNCTION public.validate_social_reward_url()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate that post_url is HTTPS and from allowed platforms
  IF NEW.post_url !~ '^https://(www\.)?(x\.com|twitter\.com|linkedin\.com|reddit\.com|youtube\.com|youtu\.be)/[^/]+' THEN
    RAISE EXCEPTION 'Invalid URL. Must be a valid HTTPS link from X/Twitter, LinkedIn, Reddit, or YouTube with a valid path.';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for INSERT operations
CREATE TRIGGER validate_social_reward_url_insert
  BEFORE INSERT ON public.social_reward_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_social_reward_url();

-- Create trigger for UPDATE operations (when post_url changes)
CREATE TRIGGER validate_social_reward_url_update
  BEFORE UPDATE ON public.social_reward_requests
  FOR EACH ROW
  WHEN (OLD.post_url IS DISTINCT FROM NEW.post_url)
  EXECUTE FUNCTION public.validate_social_reward_url();