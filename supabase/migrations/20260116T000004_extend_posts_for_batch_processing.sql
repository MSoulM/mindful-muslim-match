ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS content_hash TEXT,
ADD COLUMN IF NOT EXISTS processing_status VARCHAR(20) DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed', 'skipped')),
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS analysis_result JSONB,
ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE INDEX IF NOT EXISTS idx_posts_content_hash 
  ON public.posts(content_hash) WHERE content_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_posts_processing_status 
  ON public.posts(processing_status);

CREATE INDEX IF NOT EXISTS idx_posts_processed_at 
  ON public.posts(processed_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_embedding 
  ON public.posts USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100) 
  WHERE embedding IS NOT NULL;

COMMENT ON COLUMN public.posts.content_hash IS 'SHA256 hash of content for deduplication';
COMMENT ON COLUMN public.posts.processing_status IS 'Batch processing status for content analysis';
COMMENT ON COLUMN public.posts.processed_at IS 'When content analysis was completed';
COMMENT ON COLUMN public.posts.analysis_result IS 'Cached analysis result for deduplication reuse';
COMMENT ON COLUMN public.posts.embedding IS 'Vector embedding for semantic matching (1536 dimensions)';
