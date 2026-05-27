-- Enable pg_cron (Pro feature)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres role
GRANT USAGE ON SCHEMA cron TO postgres;

-- 1. Clean up AI generation history older than 30 days
--    lark_gen_history is only needed for hourly/daily rate windows,
--    so anything >30 days is dead weight.
SELECT cron.schedule(
  'cleanup-gen-history',
  '0 3 * * *',
  $$DELETE FROM public.lark_gen_history WHERE generated_at < NOW() - INTERVAL '30 days'$$
);

-- 2. Clean up bug reports older than 90 days
SELECT cron.schedule(
  'cleanup-bug-reports',
  '30 3 * * *',
  $$DELETE FROM public.lark_bug_reports WHERE created_at < NOW() - INTERVAL '90 days'$$
);

-- View scheduled jobs: SELECT * FROM cron.job;
-- Remove a job:        SELECT cron.unschedule('job-name');
