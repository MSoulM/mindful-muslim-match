-- TASK 9: Content Originality System
-- Migration to add originality scoring infrastructure
-- Created: 2026-01-16

-- ============================================================================
-- PART A: Extend mysoul_dna_scores with originality columns
-- ============================================================================

ALTER TABLE public.mysoul_dna_scores
  ADD COLUMN IF NOT EXISTS content_originality_score INTEGER DEFAULT 50 CHECK (content_originality_score >= 0 AND content_originality_score <= 100),
  ADD COLUMN IF NOT EXISTS content_originality_percentile DECIMAL(5,2) CHECK (content_originality_percentile >= 0 AND content_originality_percentile <= 100),
  ADD COLUMN IF NOT EXISTS content_originality_calculated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_dna_originality 
  ON public.mysoul_dna_scores(content_originality_score DESC);

COMMENT ON COLUMN public.mysoul_dna_scores.content_originality_score IS 'Measures content uniqueness vs population (0-100, higher = more unique) using embedding cosine similarity';
COMMENT ON COLUMN public.mysoul_dna_scores.content_originality_percentile IS 'Percentile rank of originality score (0-100)';
COMMENT ON COLUMN public.mysoul_dna_scores.content_originality_calculated_at IS 'Last time originality was calculated';

-- ============================================================================
-- PART B: Create content_similarity_cache table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.content_similarity_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  avg_similarity_to_population DECIMAL(5,4) CHECK (avg_similarity_to_population >= 0 AND avg_similarity_to_population <= 1),
  min_similarity DECIMAL(5,4) CHECK (min_similarity >= 0 AND min_similarity <= 1),
  max_similarity DECIMAL(5,4) CHECK (max_similarity >= 0 AND max_similarity <= 1),
  content_count INTEGER NOT NULL DEFAULT 0,
  originality_score INTEGER CHECK (originality_score >= 0 AND originality_score <= 100),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_similarity_cache_user 
  ON public.content_similarity_cache(user_id);

CREATE INDEX IF NOT EXISTS idx_similarity_cache_valid 
  ON public.content_similarity_cache(valid_until) 
  WHERE valid_until > now();

ALTER TABLE public.content_similarity_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own similarity cache"
ON public.content_similarity_cache
FOR SELECT
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY "Service role can manage all similarity cache"
ON public.content_similarity_cache
FOR ALL
USING (true)
WITH CHECK (true);

COMMENT ON TABLE public.content_similarity_cache IS 'Caches originality calculations to avoid recomputing when no new content added';
COMMENT ON COLUMN public.content_similarity_cache.avg_similarity_to_population IS 'Average cosine similarity to sampled population (0-1)';
COMMENT ON COLUMN public.content_similarity_cache.valid_until IS 'Cache expires at this timestamp (7 days from calculation or next Sunday batch)';

-- ============================================================================
-- PART C: Create calculate_originality_percentiles RPC function
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_originality_percentiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.mysoul_dna_scores
  SET content_originality_percentile = subquery.percentile
  FROM (
    SELECT 
      user_id,
      ROUND(
        PERCENT_RANK() OVER (ORDER BY content_originality_score) * 100,
        2
      ) AS percentile
    FROM public.mysoul_dna_scores
    WHERE content_originality_score IS NOT NULL
  ) AS subquery
  WHERE mysoul_dna_scores.user_id = subquery.user_id;
  
  RAISE NOTICE 'Updated originality percentiles for % users', 
    (SELECT COUNT(*) FROM mysoul_dna_scores WHERE content_originality_percentile IS NOT NULL);
END;
$$;

COMMENT ON FUNCTION calculate_originality_percentiles IS 'Calculates percentile rank for all users with originality scores using PERCENT_RANK window function';

-- ============================================================================
-- PART D: Trigger to invalidate cache when posts are deleted
-- ============================================================================

CREATE OR REPLACE FUNCTION invalidate_originality_cache_on_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    UPDATE public.content_similarity_cache
    SET valid_until = now()
    WHERE user_id = OLD.clerk_user_id;
    
    RAISE NOTICE 'Invalidated originality cache for user % due to post deletion', OLD.clerk_user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_invalidate_originality_cache ON public.posts;
CREATE TRIGGER trg_invalidate_originality_cache
  AFTER UPDATE OF deleted_at ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_originality_cache_on_delete();

COMMENT ON FUNCTION invalidate_originality_cache_on_delete IS 'Invalidates originality cache when user deletes content';

-- ============================================================================
-- PART E: Helper function to check if cache is valid
-- ============================================================================

CREATE OR REPLACE FUNCTION is_originality_cache_valid(p_user_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_cache_record RECORD;
  v_latest_post_date TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_cache_record
  FROM public.content_similarity_cache
  WHERE user_id = p_user_id;
  
  IF v_cache_record IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF v_cache_record.valid_until < now() THEN
    RETURN FALSE;
  END IF;
  
  SELECT MAX(created_at) INTO v_latest_post_date
  FROM public.posts
  WHERE clerk_user_id = p_user_id
    AND deleted_at IS NULL
    AND embedding IS NOT NULL;
  
  IF v_latest_post_date IS NULL THEN
    RETURN TRUE;
  END IF;
  
  IF v_latest_post_date > v_cache_record.calculated_at THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

COMMENT ON FUNCTION is_originality_cache_valid IS 'Checks if cached originality score is still valid (not expired and no new content since calculation)';

-- ============================================================================
-- PART F: Grant permissions for service role operations
-- ============================================================================

GRANT EXECUTE ON FUNCTION calculate_originality_percentiles TO service_role;
GRANT EXECUTE ON FUNCTION is_originality_cache_valid TO service_role, authenticated;

-- ============================================================================
-- Migration completed successfully
-- ============================================================================
