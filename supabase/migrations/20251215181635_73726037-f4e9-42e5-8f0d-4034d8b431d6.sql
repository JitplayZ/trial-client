-- Create support_messages table for user-to-admin communication
CREATE TABLE public.support_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_replies table for admin responses to support messages
CREATE TABLE public.admin_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  support_message_id UUID REFERENCES public.support_messages(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL,
  reply TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin_notifications table for admin-to-user notifications
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  target_user_id UUID, -- NULL means global notification to all users
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_notification_reads table to track which notifications users have read
CREATE TABLE public.user_notification_reads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_id UUID NOT NULL REFERENCES public.admin_notifications(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_id)
);

-- Enable RLS on all tables
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notification_reads ENABLE ROW LEVEL SECURITY;

-- RLS policies for support_messages
CREATE POLICY "Users can create their own support messages"
  ON public.support_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own support messages"
  ON public.support_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all support messages"
  ON public.support_messages FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for admin_replies
CREATE POLICY "Admins can create replies"
  ON public.admin_replies FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view replies to their messages"
  ON public.admin_replies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_messages sm
      WHERE sm.id = support_message_id AND sm.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all replies"
  ON public.admin_replies FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for admin_notifications
CREATE POLICY "Admins can create notifications"
  ON public.admin_notifications FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all notifications"
  ON public.admin_notifications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view their notifications"
  ON public.admin_notifications FOR SELECT
  USING (target_user_id = auth.uid() OR target_user_id IS NULL);

-- RLS policies for user_notification_reads
CREATE POLICY "Users can mark notifications as read"
  ON public.user_notification_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their read status"
  ON public.user_notification_reads FOR SELECT
  USING (auth.uid() = user_id);

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_replies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;