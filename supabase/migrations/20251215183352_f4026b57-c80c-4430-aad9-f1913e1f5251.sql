-- Enable admin delete of support messages and their replies

-- Support messages: admins can delete
CREATE POLICY "Admins can delete all support messages"
ON public.support_messages
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin replies: admins can delete
CREATE POLICY "Admins can delete all replies"
ON public.admin_replies
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Add table to track deleted notifications per user (for persistent deletion)
CREATE TABLE IF NOT EXISTS public.user_deleted_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  notification_id uuid NOT NULL,
  deleted_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_id)
);

-- Enable RLS
ALTER TABLE public.user_deleted_notifications ENABLE ROW LEVEL SECURITY;

-- Users can insert their own deletions
CREATE POLICY "Users can mark notifications as deleted"
ON public.user_deleted_notifications
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own deleted notifications
CREATE POLICY "Users can view their deleted notifications"
ON public.user_deleted_notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Enable realtime for this table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_deleted_notifications;