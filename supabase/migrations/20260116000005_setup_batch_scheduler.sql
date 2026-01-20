CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
  'weekly-dna-batch-processing',
  '0 2 * * 0',
  $$
  SELECT
    net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/weekly-batch',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key')
      ),
      body := jsonb_build_object(
        'run_type', 'weekly_full',
        'trigger', 'cron'
      )
    ) AS request_id;
  $$
);

COMMENT ON EXTENSION pg_cron IS 'pg_cron extension for scheduling batch jobs';

INSERT INTO public.batch_run_history (run_type, status, started_at, completed_at)
VALUES ('manual', 'completed', now(), now())
RETURNING id;

COMMENT ON SCHEMA cron IS 'Cron scheduler for weekly DNA batch processing - Runs Sunday 2 AM UTC';
