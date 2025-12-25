-- Add Content and Cultural score fields to mysoul_dna_scores table
-- These represent the 5 DNA strands: Trait Rarity (35%), Profile Depth (25%), 
-- Behavioral (20%), Content (15%), Cultural (5%)

ALTER TABLE public.mysoul_dna_scores
  ADD COLUMN IF NOT EXISTS content_score INTEGER NOT NULL DEFAULT 0 CHECK (content_score >= 0 AND content_score <= 15),
  ADD COLUMN IF NOT EXISTS cultural_score INTEGER NOT NULL DEFAULT 0 CHECK (cultural_score >= 0 AND cultural_score <= 5),
  ADD COLUMN IF NOT EXISTS approved_insights_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS days_active INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS previous_tier TEXT,
  ADD COLUMN IF NOT EXISTS tier_changed_at TIMESTAMP WITH TIME ZONE;

-- Add index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_mysoul_dna_scores_city_rank 
  ON public.mysoul_dna_scores(score DESC, last_calculated_at DESC);

-- Add comment for documentation
COMMENT ON COLUMN public.mysoul_dna_scores.trait_uniqueness_score IS 'Trait Rarity strand - 35% weight';
COMMENT ON COLUMN public.mysoul_dna_scores.profile_completeness_score IS 'Profile Depth strand - 25% weight';
COMMENT ON COLUMN public.mysoul_dna_scores.behavior_score IS 'Behavioral strand - 20% weight';
COMMENT ON COLUMN public.mysoul_dna_scores.content_score IS 'Content originality strand - 15% weight';
COMMENT ON COLUMN public.mysoul_dna_scores.cultural_score IS 'Cultural variance strand - 5% weight (calculated against city cluster)';

