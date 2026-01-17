-- MySoul DNA Schema Alignment to Spec
-- Task 3: MySoul DNA System
-- Date: 2026-01-17

-- ============================================================================
-- PART A: Extend mysoul_dna_scores table with missing columns
-- ============================================================================

ALTER TABLE public.mysoul_dna_scores
  ADD COLUMN IF NOT EXISTS percentile_rank NUMERIC(5,2) CHECK (percentile_rank >= 0 AND percentile_rank <= 100),
  ADD COLUMN IF NOT EXISTS component_breakdown JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS rare_traits JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS unique_behaviors JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS algorithm_version TEXT DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS change_delta NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS last_significant_change TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_mysoul_dna_percentile_rank 
  ON public.mysoul_dna_scores(percentile_rank DESC);

CREATE INDEX IF NOT EXISTS idx_mysoul_dna_rarity_tier 
  ON public.mysoul_dna_scores(rarity_tier);

COMMENT ON COLUMN public.mysoul_dna_scores.percentile_rank IS 'Percentile rank vs all users (0-100, higher = rarer)';
COMMENT ON COLUMN public.mysoul_dna_scores.component_breakdown IS 'Detailed breakdown of each component for UI display';
COMMENT ON COLUMN public.mysoul_dna_scores.rare_traits IS 'Array of user''s rare traits (IDF < 0.1)';
COMMENT ON COLUMN public.mysoul_dna_scores.unique_behaviors IS 'Array of unique behavioral patterns (Z-score > 2)';
COMMENT ON COLUMN public.mysoul_dna_scores.algorithm_version IS 'Version of calculation algorithm used';
COMMENT ON COLUMN public.mysoul_dna_scores.change_delta IS 'Difference from previous score';
COMMENT ON COLUMN public.mysoul_dna_scores.last_significant_change IS 'Last time score changed by >5 points';

-- ============================================================================
-- PART B: Update rarity_tier constraint to use uppercase values per spec
-- ============================================================================

ALTER TABLE public.mysoul_dna_scores
  DROP CONSTRAINT IF EXISTS mysoul_dna_scores_rarity_tier_check;

ALTER TABLE public.mysoul_dna_scores
  ADD CONSTRAINT mysoul_dna_scores_rarity_tier_check 
  CHECK (rarity_tier IN ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'));

COMMENT ON COLUMN public.mysoul_dna_scores.rarity_tier IS 'Rarity tier: COMMON (0-40), UNCOMMON (41-60), RARE (61-80), EPIC (81-95), LEGENDARY (96-100)';

-- ============================================================================
-- PART C: Rename component score columns to store raw 0-100 scores
-- ============================================================================

ALTER TABLE public.mysoul_dna_scores
  RENAME COLUMN trait_uniqueness_score TO trait_rarity_raw_score;
ALTER TABLE public.mysoul_dna_scores
  RENAME COLUMN profile_completeness_score TO profile_depth_raw_score;
ALTER TABLE public.mysoul_dna_scores
  RENAME COLUMN behavior_score TO behavioral_raw_score;

ALTER TABLE public.mysoul_dna_scores
  DROP CONSTRAINT IF EXISTS mysoul_dna_scores_trait_uniqueness_score_check,
  DROP CONSTRAINT IF EXISTS mysoul_dna_scores_profile_completeness_score_check,
  DROP CONSTRAINT IF EXISTS mysoul_dna_scores_behavior_score_check,
  DROP CONSTRAINT IF EXISTS mysoul_dna_scores_content_score_check,
  DROP CONSTRAINT IF EXISTS mysoul_dna_scores_cultural_score_check;

ALTER TABLE public.mysoul_dna_scores
  ADD CONSTRAINT mysoul_dna_scores_trait_rarity_raw_score_check 
    CHECK (trait_rarity_raw_score >= 0 AND trait_rarity_raw_score <= 100),
  ADD CONSTRAINT mysoul_dna_scores_profile_depth_raw_score_check 
    CHECK (profile_depth_raw_score >= 0 AND profile_depth_raw_score <= 100),
  ADD CONSTRAINT mysoul_dna_scores_behavioral_raw_score_check 
    CHECK (behavioral_raw_score >= 0 AND behavioral_raw_score <= 100);

ALTER TABLE public.mysoul_dna_scores
  RENAME COLUMN content_score TO content_raw_score;
ALTER TABLE public.mysoul_dna_scores
  RENAME COLUMN cultural_score TO cultural_raw_score;

ALTER TABLE public.mysoul_dna_scores
  ADD CONSTRAINT mysoul_dna_scores_content_raw_score_check 
    CHECK (content_raw_score >= 0 AND content_raw_score <= 100),
  ADD CONSTRAINT mysoul_dna_scores_cultural_raw_score_check 
    CHECK (cultural_raw_score >= 0 AND cultural_raw_score <= 100);

COMMENT ON COLUMN public.mysoul_dna_scores.trait_rarity_raw_score IS 'Trait Rarity raw score (0-100) - 35% weight in final score';
COMMENT ON COLUMN public.mysoul_dna_scores.profile_depth_raw_score IS 'Profile Depth raw score (0-100) - 25% weight in final score';
COMMENT ON COLUMN public.mysoul_dna_scores.behavioral_raw_score IS 'Behavioral Uniqueness raw score (0-100) - 20% weight in final score';
COMMENT ON COLUMN public.mysoul_dna_scores.content_raw_score IS 'Content Originality raw score (0-100) - 15% weight in final score';
COMMENT ON COLUMN public.mysoul_dna_scores.cultural_raw_score IS 'Cultural Variance raw score (0-100) - 5% weight in final score';

-- ============================================================================
-- PART D: Create RPC function to calculate percentile rank
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_dna_percentile_rank(user_score INTEGER)
RETURNS NUMERIC(5,2)
LANGUAGE plpgsql
AS $$
DECLARE
  total_users INTEGER;
  users_below INTEGER;
  percentile NUMERIC(5,2);
BEGIN
  SELECT COUNT(*) INTO total_users FROM public.mysoul_dna_scores WHERE score > 0;
  
  IF total_users = 0 THEN
    RETURN 50.00;
  END IF;
  
  SELECT COUNT(*) INTO users_below FROM public.mysoul_dna_scores WHERE score < user_score;
  
  percentile := ROUND((users_below::NUMERIC / total_users::NUMERIC) * 100, 2);
  
  RETURN LEAST(100.00, GREATEST(0.00, percentile));
END;
$$;

COMMENT ON FUNCTION calculate_dna_percentile_rank IS 'Calculate percentile rank for a given DNA score (0-100)';

-- ============================================================================
-- PART E: Create trigger to update percentile_rank on score changes
-- ============================================================================

CREATE OR REPLACE FUNCTION update_dna_percentile_rank()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.percentile_rank := calculate_dna_percentile_rank(NEW.score);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_dna_percentile_rank
BEFORE INSERT OR UPDATE OF score ON public.mysoul_dna_scores
FOR EACH ROW
EXECUTE FUNCTION update_dna_percentile_rank();

-- ============================================================================
-- PART F: Batch update existing records to use uppercase rarity tiers
-- ============================================================================

UPDATE public.mysoul_dna_scores SET rarity_tier = 'COMMON' WHERE LOWER(rarity_tier) = 'common';
UPDATE public.mysoul_dna_scores SET rarity_tier = 'UNCOMMON' WHERE LOWER(rarity_tier) = 'uncommon';
UPDATE public.mysoul_dna_scores SET rarity_tier = 'RARE' WHERE LOWER(rarity_tier) = 'rare';
UPDATE public.mysoul_dna_scores SET rarity_tier = 'EPIC' WHERE LOWER(rarity_tier) IN ('epic', 'ultra rare');
UPDATE public.mysoul_dna_scores SET rarity_tier = 'LEGENDARY' WHERE LOWER(rarity_tier) = 'legendary';
