CREATE TABLE IF NOT EXISTS public.batch_run_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_type VARCHAR(30) NOT NULL CHECK (run_type IN ('weekly_full', 'daily_incremental', 'manual')),
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_jobs INTEGER NOT NULL DEFAULT 0,
  completed_jobs INTEGER NOT NULL DEFAULT 0,
  failed_jobs INTEGER NOT NULL DEFAULT 0,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  api_cost_cents INTEGER NOT NULL DEFAULT 0,
  duration_seconds INTEGER,
  status VARCHAR(20) NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  error_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_batch_run_history_started_at 
  ON public.batch_run_history(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_batch_run_history_status 
  ON public.batch_run_history(status);

CREATE INDEX IF NOT EXISTS idx_batch_run_history_run_type 
  ON public.batch_run_history(run_type);

ALTER TABLE public.batch_run_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all run history"
ON public.batch_run_history
FOR ALL
USING (true)
WITH CHECK (true);

COMMENT ON TABLE public.batch_run_history IS 'History of batch processing runs with metrics and error logs';
COMMENT ON COLUMN public.batch_run_history.run_type IS 'Type of run: weekly_full, daily_incremental, manual';
COMMENT ON COLUMN public.batch_run_history.tokens_used IS 'Total tokens consumed during this run';
COMMENT ON COLUMN public.batch_run_history.api_cost_cents IS 'Estimated API cost in cents';
COMMENT ON COLUMN public.batch_run_history.error_log IS 'Array of error objects: [{jobId, error, timestamp}]';
COMMENT ON COLUMN public.batch_run_history.metadata IS 'Additional run metadata (job type counts, etc.)';
