-- MySoul DNA Supporting Tables
-- Task 3: MySoul DNA System
-- Date: 2026-01-17

-- ============================================================================
-- PART A: trait_distribution_stats - Global trait frequencies for IDF calculation
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.trait_distribution_stats (
  trait_key TEXT PRIMARY KEY,
  trait_category TEXT NOT NULL CHECK (trait_category IN ('religious', 'career', 'personality', 'lifestyle', 'family', 'content')),
  trait_display_name TEXT,
  user_count INTEGER NOT NULL DEFAULT 0 CHECK (user_count >= 0),
  total_users INTEGER NOT NULL DEFAULT 1 CHECK (total_users >= 1),
  frequency NUMERIC(6,5) GENERATED ALWAYS AS (
    CASE WHEN total_users > 0 THEN user_count::NUMERIC / total_users::NUMERIC ELSE 0 END
  ) STORED,
  idf_score NUMERIC(6,3) GENERATED ALWAYS AS (
    CASE WHEN user_count > 0 THEN LN(total_users::NUMERIC / user_count::NUMERIC) ELSE 0 END
  ) STORED,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_trait_distribution_category 
  ON public.trait_distribution_stats(trait_category);

CREATE INDEX IF NOT EXISTS idx_trait_distribution_idf 
  ON public.trait_distribution_stats(idf_score DESC);

CREATE INDEX IF NOT EXISTS idx_trait_distribution_frequency 
  ON public.trait_distribution_stats(frequency);

COMMENT ON TABLE public.trait_distribution_stats IS 'Global trait frequencies for IDF-based trait rarity calculation';
COMMENT ON COLUMN public.trait_distribution_stats.trait_key IS 'Unique identifier for trait (e.g., "sect:shia", "occupation:engineer")';
COMMENT ON COLUMN public.trait_distribution_stats.frequency IS 'Proportion of users with this trait (0-1)';
COMMENT ON COLUMN public.trait_distribution_stats.idf_score IS 'Inverse document frequency: ln(total_users / user_count). Higher = rarer';

-- ============================================================================
-- PART B: mysoul_score_history - 12-month score history retention
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mysoul_score_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  rarity_tier TEXT NOT NULL CHECK (rarity_tier IN ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY')),
  percentile_rank NUMERIC(5,2) CHECK (percentile_rank >= 0 AND percentile_rank <= 100),
  component_breakdown JSONB DEFAULT '{}'::jsonb,
  trait_rarity_raw_score INTEGER CHECK (trait_rarity_raw_score >= 0 AND trait_rarity_raw_score <= 100),
  profile_depth_raw_score INTEGER CHECK (profile_depth_raw_score >= 0 AND profile_depth_raw_score <= 100),
  behavioral_raw_score INTEGER CHECK (behavioral_raw_score >= 0 AND behavioral_raw_score <= 100),
  content_raw_score INTEGER CHECK (content_raw_score >= 0 AND content_raw_score <= 100),
  cultural_raw_score INTEGER CHECK (cultural_raw_score >= 0 AND cultural_raw_score <= 100),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  algorithm_version TEXT DEFAULT 'v1.0',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_score_history_user_time 
  ON public.mysoul_score_history(user_id, calculated_at DESC);

CREATE INDEX IF NOT EXISTS idx_score_history_calculated_at 
  ON public.mysoul_score_history(calculated_at DESC);

COMMENT ON TABLE public.mysoul_score_history IS 'Historical DNA scores - retained for 12 months for trend analysis';

-- Enable RLS
ALTER TABLE public.mysoul_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own score history"
ON public.mysoul_score_history FOR SELECT
USING ((auth.uid())::text = user_id);

-- ============================================================================
-- PART C: behavioral_tracking - ALREADY EXISTS (skip creation)
-- ============================================================================

-- NOTE: behavioral_tracking table already exists with richer schema than initially planned.
-- Existing table has detailed metrics: response times, message patterns, activity patterns.
-- This is BETTER than the generic JSONB approach - we'll use the existing table.
-- 
-- Existing schema includes:
-- - avg_response_time_hours, median_response_time_hours, response_time_stddev
-- - messages_per_match, avg_message_length, emoji_usage_rate
-- - voice_message_ratio, profile_views_per_day, match_acceptance_rate
-- - peak_activity_hour, weekend_activity_ratio
-- - profile_completion_speed_days, insights_approval_rate, avg_swipe_time_seconds
-- - tracking_period_start, tracking_period_end (TIMESTAMPTZ)
-- - period_start, period_end (DATE)
--
-- The MySoul DNA calculator will adapt to use these existing rich metrics.

-- Add z_scores and uniqueness_score columns to existing table if not present
ALTER TABLE public.behavioral_tracking
  ADD COLUMN IF NOT EXISTS z_scores JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS uniqueness_score NUMERIC(5,2) CHECK (uniqueness_score >= 0 AND uniqueness_score <= 100);

COMMENT ON COLUMN public.behavioral_tracking.z_scores IS 'Z-scores vs population for each behavioral metric';
COMMENT ON COLUMN public.behavioral_tracking.uniqueness_score IS 'Overall behavioral uniqueness score (0-100) calculated from z_scores';

-- ============================================================================
-- PART D: mysoul_achievements - DNA achievements and milestones
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mysoul_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN (
    'rare_trait_discovered',
    'tier_upgrade',
    'score_milestone',
    'percentile_milestone',
    'component_mastery',
    'streak_achievement'
  )),
  achievement_data JSONB DEFAULT '{}'::jsonb,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  viewed BOOLEAN DEFAULT false,
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mysoul_achievements_user 
  ON public.mysoul_achievements(user_id, earned_at DESC);

CREATE INDEX IF NOT EXISTS idx_mysoul_achievements_type 
  ON public.mysoul_achievements(achievement_type);

CREATE INDEX IF NOT EXISTS idx_mysoul_achievements_unviewed 
  ON public.mysoul_achievements(user_id, viewed) WHERE viewed = false;

COMMENT ON TABLE public.mysoul_achievements IS 'DNA achievements and milestones earned by users';
COMMENT ON COLUMN public.mysoul_achievements.achievement_data IS 'Achievement details: {title, description, icon, value, etc.}';

-- Enable RLS
ALTER TABLE public.mysoul_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements"
ON public.mysoul_achievements FOR SELECT
USING ((auth.uid())::text = user_id);

CREATE POLICY "Users can update their own achievements"
ON public.mysoul_achievements FOR UPDATE
USING ((auth.uid())::text = user_id);

-- ============================================================================
-- PART E: RPC Functions for DNA calculations
-- ============================================================================

-- Function to refresh trait distribution stats (run periodically via cron or batch)
CREATE OR REPLACE FUNCTION refresh_trait_distribution_stats()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  refreshed_count INTEGER := 0;
BEGIN
  UPDATE public.trait_distribution_stats
  SET total_users = (SELECT COUNT(DISTINCT clerk_user_id) FROM public.profiles WHERE deleted_at IS NULL);
  
  GET DIAGNOSTICS refreshed_count = ROW_COUNT;
  
  RETURN refreshed_count;
END;
$$;

COMMENT ON FUNCTION refresh_trait_distribution_stats IS 'Refresh total_users count in trait_distribution_stats table';

-- Function to cleanup old score history (retain 12 months)
CREATE OR REPLACE FUNCTION cleanup_score_history()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.mysoul_score_history
  WHERE calculated_at < NOW() - INTERVAL '12 months';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  RETURN deleted_count;
END;
$$;

COMMENT ON FUNCTION cleanup_score_history IS 'Delete score history older than 12 months';

-- Function to record score history (called by batch process)
CREATE OR REPLACE FUNCTION record_score_history(
  p_user_id TEXT,
  p_score INTEGER,
  p_rarity_tier TEXT,
  p_percentile_rank NUMERIC,
  p_component_breakdown JSONB,
  p_trait_rarity_raw_score INTEGER,
  p_profile_depth_raw_score INTEGER,
  p_behavioral_raw_score INTEGER,
  p_content_raw_score INTEGER,
  p_cultural_raw_score INTEGER,
  p_algorithm_version TEXT
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  history_id UUID;
BEGIN
  INSERT INTO public.mysoul_score_history (
    user_id,
    score,
    rarity_tier,
    percentile_rank,
    component_breakdown,
    trait_rarity_raw_score,
    profile_depth_raw_score,
    behavioral_raw_score,
    content_raw_score,
    cultural_raw_score,
    algorithm_version
  ) VALUES (
    p_user_id,
    p_score,
    p_rarity_tier,
    p_percentile_rank,
    p_component_breakdown,
    p_trait_rarity_raw_score,
    p_profile_depth_raw_score,
    p_behavioral_raw_score,
    p_content_raw_score,
    p_cultural_raw_score,
    p_algorithm_version
  )
  RETURNING id INTO history_id;
  
  RETURN history_id;
END;
$$;

COMMENT ON FUNCTION record_score_history IS 'Record a snapshot of DNA score in history table';

-- ============================================================================
-- PART F: Trigger to auto-record history on score changes
-- ============================================================================

CREATE OR REPLACE FUNCTION auto_record_score_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND (OLD.score IS DISTINCT FROM NEW.score) THEN
    PERFORM record_score_history(
      NEW.user_id,
      NEW.score,
      NEW.rarity_tier,
      NEW.percentile_rank,
      NEW.component_breakdown,
      NEW.trait_rarity_raw_score,
      NEW.profile_depth_raw_score,
      NEW.behavioral_raw_score,
      NEW.content_raw_score,
      NEW.cultural_raw_score,
      NEW.algorithm_version
    );
    
    NEW.change_delta := NEW.score - OLD.score;
    
    IF ABS(NEW.score - OLD.score) >= 5 THEN
      NEW.last_significant_change := NOW();
    END IF;
  ELSIF TG_OP = 'INSERT' THEN
    PERFORM record_score_history(
      NEW.user_id,
      NEW.score,
      NEW.rarity_tier,
      NEW.percentile_rank,
      NEW.component_breakdown,
      NEW.trait_rarity_raw_score,
      NEW.profile_depth_raw_score,
      NEW.behavioral_raw_score,
      NEW.content_raw_score,
      NEW.cultural_raw_score,
      NEW.algorithm_version
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_auto_record_score_history
BEFORE INSERT OR UPDATE OF score ON public.mysoul_dna_scores
FOR EACH ROW
EXECUTE FUNCTION auto_record_score_history();

-- ============================================================================
-- PART G: Seed initial trait distribution stats (examples)
-- ============================================================================

INSERT INTO public.trait_distribution_stats (trait_key, trait_category, trait_display_name, user_count, total_users)
VALUES
  ('sect:sunni', 'religious', 'Sunni', 0, 1),
  ('sect:shia', 'religious', 'Shia', 0, 1),
  ('sect:sufi', 'religious', 'Sufi', 0, 1),
  ('practice_level:very_practicing', 'religious', 'Very Practicing', 0, 1),
  ('practice_level:moderate', 'religious', 'Moderate', 0, 1),
  ('practice_level:cultural', 'religious', 'Cultural', 0, 1),
  ('education:masters', 'career', 'Master''s Degree', 0, 1),
  ('education:phd', 'career', 'PhD', 0, 1),
  ('occupation:engineer', 'career', 'Engineer', 0, 1),
  ('occupation:doctor', 'career', 'Doctor', 0, 1),
  ('occupation:teacher', 'career', 'Teacher', 0, 1),
  ('depth_level:4', 'content', 'Depth Level 4', 0, 1),
  ('depth_level:5', 'content', 'Depth Level 5', 0, 1),
  ('marital_status:never_married', 'family', 'Never Married', 0, 1),
  ('marital_status:divorced', 'family', 'Divorced', 0, 1),
  ('wants_children:true', 'family', 'Wants Children', 0, 1),
  ('exercise:daily', 'lifestyle', 'Daily Exercise', 0, 1),
  ('smoking:never', 'lifestyle', 'Never Smoked', 0, 1)
ON CONFLICT (trait_key) DO NOTHING;
