-- Fix MySoul DNA Identity Model
-- Task 3 Compliance: Use profiles.id (UUID) as canonical user identifier
-- Date: 2026-01-18

-- ============================================================================
-- PART A: Add profile_id column to mysoul_dna_scores and migrate data
-- ============================================================================

ALTER TABLE public.mysoul_dna_scores
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Migrate existing data: map clerk_user_id -> profiles.id
UPDATE public.mysoul_dna_scores mds
SET profile_id = p.id
FROM public.profiles p
WHERE mds.user_id = p.clerk_user_id
  AND mds.profile_id IS NULL;

-- Make profile_id NOT NULL and create unique constraint
ALTER TABLE public.mysoul_dna_scores
  ALTER COLUMN profile_id SET NOT NULL,
  DROP CONSTRAINT IF EXISTS mysoul_dna_scores_user_id_key;

-- Add unique constraint on profile_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_mysoul_dna_scores_profile_id 
  ON public.mysoul_dna_scores(profile_id);

-- Add index on profile_id for joins
CREATE INDEX IF NOT EXISTS idx_mysoul_dna_scores_profile_id_idx
  ON public.mysoul_dna_scores(profile_id);

-- Add index on final score DESC for leaderboard
CREATE INDEX IF NOT EXISTS idx_mysoul_dna_scores_final_score_desc
  ON public.mysoul_dna_scores(score DESC);

-- ============================================================================
-- PART B: Update mysoul_score_history to use profile_id
-- ============================================================================

ALTER TABLE public.mysoul_score_history
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Migrate existing data
UPDATE public.mysoul_score_history msh
SET profile_id = p.id
FROM public.profiles p
WHERE msh.user_id = p.clerk_user_id
  AND msh.profile_id IS NULL;

ALTER TABLE public.mysoul_score_history
  ALTER COLUMN profile_id SET NOT NULL;

-- Recreate index with profile_id
DROP INDEX IF EXISTS idx_score_history_user_time;
CREATE INDEX IF NOT EXISTS idx_score_history_profile_time 
  ON public.mysoul_score_history(profile_id, calculated_at DESC);

-- ============================================================================
-- PART C: Update mysoul_achievements to use profile_id
-- ============================================================================

ALTER TABLE public.mysoul_achievements
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Migrate existing data
UPDATE public.mysoul_achievements ma
SET profile_id = p.id
FROM public.profiles p
WHERE ma.user_id = p.clerk_user_id
  AND ma.profile_id IS NULL;

ALTER TABLE public.mysoul_achievements
  ALTER COLUMN profile_id SET NOT NULL;

-- Recreate index with profile_id
DROP INDEX IF EXISTS idx_mysoul_achievements_user;
CREATE INDEX IF NOT EXISTS idx_mysoul_achievements_profile 
  ON public.mysoul_achievements(profile_id, earned_at DESC);

-- ============================================================================
-- PART D: Update behavioral_tracking to use profile_id
-- ============================================================================

-- Check if user_id column exists and is TEXT
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'behavioral_tracking' 
    AND column_name = 'clerk_user_id'
    AND data_type = 'text'
  ) THEN
    ALTER TABLE public.behavioral_tracking
      ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

    -- Migrate existing data
    UPDATE public.behavioral_tracking bt
    SET profile_id = p.id
    FROM public.profiles p
    WHERE bt.user_id = p.clerk_user_id::text
      AND bt.profile_id IS NULL;

    -- Make profile_id NOT NULL if data exists
    IF EXISTS (SELECT 1 FROM public.behavioral_tracking WHERE profile_id IS NOT NULL) THEN
      ALTER TABLE public.behavioral_tracking
        ALTER COLUMN profile_id SET NOT NULL;
    END IF;
  END IF;
END $$;

-- Add index on profile_id
CREATE INDEX IF NOT EXISTS idx_behavioral_tracking_profile_id
  ON public.behavioral_tracking(profile_id);

-- ============================================================================
-- PART E: Update RLS policies to use profile_id
-- ============================================================================

-- mysoul_dna_scores RLS
DROP POLICY IF EXISTS "Users can view their own DNA score" ON public.mysoul_dna_scores;
DROP POLICY IF EXISTS "Users can insert their own DNA score" ON public.mysoul_dna_scores;
DROP POLICY IF EXISTS "Users can update their own DNA score" ON public.mysoul_dna_scores;

CREATE POLICY "Users can view their own DNA score"
ON public.mysoul_dna_scores FOR SELECT
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE clerk_user_id = (auth.uid())::text
  )
);

CREATE POLICY "Users can insert their own DNA score"
ON public.mysoul_dna_scores FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE clerk_user_id = (auth.uid())::text
  )
);

CREATE POLICY "Users can update their own DNA score"
ON public.mysoul_dna_scores FOR UPDATE
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE clerk_user_id = (auth.uid())::text
  )
);

-- mysoul_score_history RLS
DROP POLICY IF EXISTS "Users can view their own score history" ON public.mysoul_score_history;

CREATE POLICY "Users can view their own score history"
ON public.mysoul_score_history FOR SELECT
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE clerk_user_id = (auth.uid())::text
  )
);

-- mysoul_achievements RLS
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.mysoul_achievements;
DROP POLICY IF EXISTS "Users can update their own achievements" ON public.mysoul_achievements;

CREATE POLICY "Users can view their own achievements"
ON public.mysoul_achievements FOR SELECT
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE clerk_user_id = (auth.uid())::text
  )
);

CREATE POLICY "Users can update their own achievements"
ON public.mysoul_achievements FOR UPDATE
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE clerk_user_id = (auth.uid())::text
  )
);

-- ============================================================================
-- PART F: Update trait_distribution_stats function to use profiles.id
-- ============================================================================

CREATE OR REPLACE FUNCTION refresh_trait_distribution_stats()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  refreshed_count INTEGER := 0;
  total_users_count INTEGER;
BEGIN
  -- Count distinct profiles.id (not clerk_user_id)
  SELECT COUNT(DISTINCT id) INTO total_users_count
  FROM public.profiles 
  WHERE deleted_at IS NULL;
  
  UPDATE public.trait_distribution_stats
  SET total_users = total_users_count;
  
  GET DIAGNOSTICS refreshed_count = ROW_COUNT;
  
  RETURN refreshed_count;
END;
$$;

COMMENT ON FUNCTION refresh_trait_distribution_stats IS 'Refresh total_users count using profiles.id as canonical identifier';

-- ============================================================================
-- PART G: Update user_city_assignments to use profile_id
-- ============================================================================

ALTER TABLE public.user_city_assignments
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Migrate existing data
UPDATE public.user_city_assignments uca
SET profile_id = p.id
FROM public.profiles p
WHERE uca.clerk_user_id = p.clerk_user_id
  AND uca.profile_id IS NULL;

-- Make profile_id NOT NULL if data exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_city_assignments WHERE profile_id IS NOT NULL) THEN
    ALTER TABLE public.user_city_assignments
      ALTER COLUMN profile_id SET NOT NULL;
  END IF;
END $$;

-- Update unique constraint to use profile_id
DROP INDEX IF EXISTS idx_user_city_assignments_unique_current;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_city_assignments_unique_current 
ON public.user_city_assignments(profile_id) 
WHERE is_current = true;

-- Add index on profile_id
CREATE INDEX IF NOT EXISTS idx_user_city_assignments_profile_id
  ON public.user_city_assignments(profile_id);

-- Update RLS policy
DROP POLICY IF EXISTS "Users can view their own city assignments" ON public.user_city_assignments;
CREATE POLICY "Users can view their own city assignments"
ON public.user_city_assignments FOR SELECT
TO authenticated
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE clerk_user_id = (auth.uid())::text
  )
);

-- ============================================================================
-- PART H: Update content_similarity_cache to use profile_id
-- ============================================================================

ALTER TABLE public.content_similarity_cache
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Migrate existing data
UPDATE public.content_similarity_cache csc
SET profile_id = p.id
FROM public.profiles p
WHERE csc.user_id = p.clerk_user_id
  AND csc.profile_id IS NULL;

-- Make profile_id NOT NULL if data exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.content_similarity_cache WHERE profile_id IS NOT NULL) THEN
    ALTER TABLE public.content_similarity_cache
      ALTER COLUMN profile_id SET NOT NULL;
  END IF;
END $$;

-- Update unique constraint to use profile_id
ALTER TABLE public.content_similarity_cache
  DROP CONSTRAINT IF EXISTS content_similarity_cache_user_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_content_similarity_cache_profile_id
  ON public.content_similarity_cache(profile_id);

-- Update RLS policy
DROP POLICY IF EXISTS "Users can view their own similarity cache" ON public.content_similarity_cache;
CREATE POLICY "Users can view their own similarity cache"
ON public.content_similarity_cache FOR SELECT
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE clerk_user_id = (auth.uid())::text
  )
);

-- ============================================================================
-- PART I: Update posts table to use profile_id (optional - keep clerk_user_id for backward compat)
-- ============================================================================

-- Note: Posts table will continue to use clerk_user_id for now to maintain compatibility
-- Calculator will look up clerk_user_id from profile_id when needed

-- ============================================================================
-- PART J: Update user_insights to use profile_id
-- ============================================================================

ALTER TABLE public.user_insights
  ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Migrate existing data
UPDATE public.user_insights ui
SET profile_id = p.id
FROM public.profiles p
WHERE ui.clerk_user_id = p.clerk_user_id
  AND ui.profile_id IS NULL;

-- Make profile_id NOT NULL if data exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.user_insights WHERE profile_id IS NOT NULL) THEN
    ALTER TABLE public.user_insights
      ALTER COLUMN profile_id SET NOT NULL;
  END IF;
END $$;

-- Add index on profile_id
CREATE INDEX IF NOT EXISTS idx_user_insights_profile_id
  ON public.user_insights(profile_id);

-- Update composite index
CREATE INDEX IF NOT EXISTS idx_user_insights_profile_status
  ON public.user_insights(profile_id, status);

-- Update RLS policies to use profile_id
DROP POLICY IF EXISTS "Users can view their own insights" ON public.user_insights;
DROP POLICY IF EXISTS "Users can insert their own insights" ON public.user_insights;
DROP POLICY IF EXISTS "Users can update their own insights" ON public.user_insights;

CREATE POLICY "Users can view their own insights"
ON public.user_insights FOR SELECT
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE clerk_user_id = (auth.uid())::text
  )
);

CREATE POLICY "Users can insert their own insights"
ON public.user_insights FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE clerk_user_id = (auth.uid())::text
  )
);

CREATE POLICY "Users can update their own insights"
ON public.user_insights FOR UPDATE
USING (
  profile_id IN (
    SELECT id FROM public.profiles WHERE clerk_user_id = (auth.uid())::text
  )
)
WITH CHECK (
  profile_id IN (
    SELECT id FROM public.profiles WHERE clerk_user_id = (auth.uid())::text
  )
);

-- ============================================================================
-- PART K: Update behavioral_tracking to ensure profile_id exists
-- ============================================================================

-- Update behavioral_tracking queries to use profile_id
-- The table structure was already handled in PART D above
