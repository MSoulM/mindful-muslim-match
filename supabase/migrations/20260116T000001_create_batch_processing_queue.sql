CREATE TABLE IF NOT EXISTS public.batch_processing_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  job_type VARCHAR(30) NOT NULL CHECK (job_type IN ('content_analysis', 'dna_recalculation', 'match_generation', 'embedding_update')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'retry')),
  priority INTEGER NOT NULL DEFAULT 5 CHECK (priority >= 1 AND priority <= 10),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_batch_queue_status_priority_scheduled 
  ON public.batch_processing_queue(status, priority DESC, scheduled_for ASC);

CREATE INDEX IF NOT EXISTS idx_batch_queue_user_id 
  ON public.batch_processing_queue(user_id);

CREATE INDEX IF NOT EXISTS idx_batch_queue_job_type 
  ON public.batch_processing_queue(job_type);

CREATE INDEX IF NOT EXISTS idx_batch_queue_created_at 
  ON public.batch_processing_queue(created_at DESC);

ALTER TABLE public.batch_processing_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage all queue items"
ON public.batch_processing_queue
FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view their own queue items"
ON public.batch_processing_queue
FOR SELECT
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

COMMENT ON TABLE public.batch_processing_queue IS 'Queue for batch processing jobs with retry logic';
COMMENT ON COLUMN public.batch_processing_queue.job_type IS 'Type of job: content_analysis, dna_recalculation, match_generation, embedding_update';
COMMENT ON COLUMN public.batch_processing_queue.priority IS 'Job priority (1=highest, 10=lowest)';
COMMENT ON COLUMN public.batch_processing_queue.attempts IS 'Number of processing attempts';
COMMENT ON COLUMN public.batch_processing_queue.scheduled_for IS 'When job should be processed (for retry backoff)';
