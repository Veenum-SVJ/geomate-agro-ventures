-- ==================== NOTIFICATIONS SYSTEM (WHATSAPP) ====================
-- Add notification preferences and logging tables

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  whatsapp_notifications BOOLEAN NOT NULL DEFAULT true,
  task_reminders BOOLEAN NOT NULL DEFAULT true,
  low_stock_alerts BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create notifications_log table for tracking sent notifications
CREATE TABLE IF NOT EXISTS public.notifications_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('task_reminder', 'low_stock', 'general', 'test')),
  channel TEXT NOT NULL DEFAULT 'whatsapp',
  message TEXT,
  recipient_phone TEXT,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending'))
);

-- Enable RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_preferences
CREATE POLICY "Users can view their own notification preferences"
ON public.notification_preferences
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own notification preferences"
ON public.notification_preferences
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own notification preferences"
ON public.notification_preferences
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for notifications_log
CREATE POLICY "Users can view their own notification logs"
ON public.notifications_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Only service role can insert into notifications_log (Edge Functions)
CREATE POLICY "Service role can insert notification logs"
ON public.notifications_log
FOR INSERT
TO service_role
WITH CHECK (true);

-- Admins can view all notification logs
CREATE POLICY "Admins can view all notification logs"
ON public.notifications_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Add updated_at trigger for notification_preferences
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create default notification preferences for all existing users
INSERT INTO public.notification_preferences (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Create function to automatically create notification preferences for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create notification preferences for new users
DROP TRIGGER IF EXISTS on_auth_user_created_notifications ON auth.users;
CREATE TRIGGER on_auth_user_created_notifications
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_notifications();

-- Enable pg_cron extension if not already enabled (Note: Dashboard toggle might be preferred)
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule Task Reminders (Daily at 8 AM UTC)
-- SELECT cron.schedule(
--   'check-task-reminders',
--   '0 8 * * *',
--   $$
--   SELECT
--     net.http_post(
--       url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-task-reminders',
--       headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
--       body:='{}'::jsonb
--     ) as request_id;
--   $$
-- );

-- Schedule Low Stock Alerts (Daily at 9 AM UTC)
-- SELECT cron.schedule(
--   'check-inventory-alerts',
--   '0 9 * * *',
--   $$
--   SELECT
--     net.http_post(
--       url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-inventory-alerts',
--       headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
--       body:='{}'::jsonb
--     ) as request_id;
--   $$
-- );
