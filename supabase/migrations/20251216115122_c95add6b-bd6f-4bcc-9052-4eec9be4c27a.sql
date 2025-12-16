-- Add length constraints to support_messages and admin_replies tables
-- This prevents oversized messages that could cause database bloat or DoS

ALTER TABLE public.support_messages 
ADD CONSTRAINT check_message_length 
CHECK (length(message) <= 5000);

ALTER TABLE public.admin_replies
ADD CONSTRAINT check_reply_length 
CHECK (length(reply) <= 10000);