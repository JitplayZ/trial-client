-- Create social_reward_requests table
CREATE TABLE public.social_reward_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('x', 'linkedin', 'reddit', 'youtube')),
  post_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  credits_awarded INTEGER,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_submission UNIQUE (user_id),
  CONSTRAINT unique_post_url UNIQUE (post_url)
);

-- Enable RLS
ALTER TABLE public.social_reward_requests ENABLE ROW LEVEL SECURITY;

-- Users can view their own requests
CREATE POLICY "Users can view their own requests"
ON public.social_reward_requests
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own requests (only if no existing request)
CREATE POLICY "Users can submit their own requests"
ON public.social_reward_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can view all requests"
ON public.social_reward_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update requests
CREATE POLICY "Admins can update requests"
ON public.social_reward_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function for admin to approve/reject social reward requests
CREATE OR REPLACE FUNCTION public.admin_review_social_reward(
  _request_id UUID,
  _approved BOOLEAN,
  _credits_amount INTEGER DEFAULT 3,
  _rejection_reason TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _admin_id UUID;
  _request RECORD;
BEGIN
  _admin_id := auth.uid();
  
  -- Verify admin role
  IF NOT public.has_role(_admin_id, 'admin') THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Unauthorized');
  END IF;
  
  -- Get the request
  SELECT * INTO _request FROM public.social_reward_requests WHERE id = _request_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Request not found');
  END IF;
  
  IF _request.status != 'pending' THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Request already reviewed');
  END IF;
  
  IF _approved THEN
    -- Update request status
    UPDATE public.social_reward_requests
    SET status = 'approved',
        credits_awarded = _credits_amount,
        reviewed_by = _admin_id,
        reviewed_at = now(),
        updated_at = now()
    WHERE id = _request_id;
    
    -- Add credits to user
    UPDATE public.subscriptions
    SET credits = credits + _credits_amount, updated_at = now()
    WHERE user_id = _request.user_id;
    
    -- Log the action
    INSERT INTO public.admin_audit_logs (admin_user_id, action_type, target_user_id, details)
    VALUES (_admin_id, 'social_reward_approved', _request.user_id, jsonb_build_object(
      'request_id', _request_id,
      'credits_awarded', _credits_amount,
      'platform', _request.platform,
      'post_url', _request.post_url
    ));
    
    -- Create notification for user
    INSERT INTO public.admin_notifications (admin_user_id, target_user_id, title, message)
    VALUES (_admin_id, _request.user_id, 'Social Reward Approved!', 
      format('Your social post has been approved! You earned %s credits.', _credits_amount));
    
    RETURN jsonb_build_object('ok', true, 'message', 'Request approved', 'credits_awarded', _credits_amount);
  ELSE
    -- Update request status as rejected
    UPDATE public.social_reward_requests
    SET status = 'rejected',
        rejection_reason = _rejection_reason,
        reviewed_by = _admin_id,
        reviewed_at = now(),
        updated_at = now()
    WHERE id = _request_id;
    
    -- Log the action
    INSERT INTO public.admin_audit_logs (admin_user_id, action_type, target_user_id, details)
    VALUES (_admin_id, 'social_reward_rejected', _request.user_id, jsonb_build_object(
      'request_id', _request_id,
      'rejection_reason', _rejection_reason,
      'platform', _request.platform,
      'post_url', _request.post_url
    ));
    
    -- Create notification for user
    INSERT INTO public.admin_notifications (admin_user_id, target_user_id, title, message)
    VALUES (_admin_id, _request.user_id, 'Social Reward Request Update', 
      COALESCE('Your social post was not approved. Reason: ' || _rejection_reason, 'Your social post was not approved.'));
    
    RETURN jsonb_build_object('ok', true, 'message', 'Request rejected');
  END IF;
END;
$$;