-- =============================================================
-- ENABLE CRON JOBS FOR SCHEDULED NOTIFICATIONS
-- Prerequisites: 
--   1. Enable pg_cron extension in Supabase Dashboard → Database → Extensions
--   2. Enable pg_net extension in Supabase Dashboard → Database → Extensions
--   3. Replace YOUR_SERVICE_ROLE_KEY with your actual service role key
-- =============================================================

-- Enable extensions (may need to be done via Dashboard instead)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule Task Reminders (Daily at 8 AM UTC)
SELECT cron.schedule(
  'check-task-reminders',
  '0 8 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://rwrmmoylueicvplmowls.supabase.co/functions/v1/check-task-reminders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- Schedule Low Stock Alerts (Daily at 9 AM UTC)
SELECT cron.schedule(
  'check-inventory-alerts',
  '0 9 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://rwrmmoylueicvplmowls.supabase.co/functions/v1/check-inventory-alerts',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
      body:='{}'::jsonb
    ) as request_id;
  $$
);

-- =============================================================
-- IMPORTANT: Replace YOUR_SERVICE_ROLE_KEY above with your actual 
-- Supabase service role key from Dashboard → Settings → API
-- =============================================================
