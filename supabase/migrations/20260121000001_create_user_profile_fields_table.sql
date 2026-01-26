-- Create user_profile_fields table for Profile Depth scoring
-- Task 3: MySoul DNA System - Profile Depth Component
-- Date: 2026-01-21

-- ============================================================================
-- PART A: Create user_profile_fields table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profile_fields (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL, -- clerk_user_id
  dimension TEXT NOT NULL CHECK (dimension IN ('religious', 'career', 'personality', 'lifestyle', 'family')),
  completion_percentage NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, dimension)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profile_fields_user_id ON public.user_profile_fields(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profile_fields_dimension ON public.user_profile_fields(dimension);
CREATE INDEX IF NOT EXISTS idx_user_profile_fields_user_dimension ON public.user_profile_fields(user_id, dimension);

-- Add comments
COMMENT ON TABLE public.user_profile_fields IS 'Stores profile completion percentage by dimension for DNA Profile Depth scoring';
COMMENT ON COLUMN public.user_profile_fields.user_id IS 'Clerk user ID (clerk_user_id)';
COMMENT ON COLUMN public.user_profile_fields.dimension IS 'Profile dimension: religious, career, personality, lifestyle, or family';
COMMENT ON COLUMN public.user_profile_fields.completion_percentage IS 'Completion percentage for this dimension (0-100)';

-- ============================================================================
-- PART B: Create function to update profile field completion
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_user_profile_field(
  p_user_id TEXT,
  p_dimension TEXT,
  p_completion_percentage NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profile_fields (user_id, dimension, completion_percentage)
  VALUES (p_user_id, p_dimension, p_completion_percentage)
  ON CONFLICT (user_id, dimension) DO UPDATE
  SET completion_percentage = EXCLUDED.completion_percentage,
      last_updated = now();
END;
$$;

COMMENT ON FUNCTION upsert_user_profile_field IS 'Upsert profile field completion percentage for a user dimension';

-- ============================================================================
-- PART C: Create function to calculate profile depth score
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_profile_depth_score(p_user_id TEXT)
RETURNS NUMERIC(5,2)
LANGUAGE plpgsql
AS $$
DECLARE
  v_avg_completion NUMERIC(5,2);
  v_dimension_count INTEGER;
BEGIN
  -- Get average completion across all 5 dimensions
  -- Missing dimensions are treated as 0
  SELECT 
    COALESCE(AVG(completion_percentage), 0)::NUMERIC(5,2),
    COUNT(*)::INTEGER
  INTO v_avg_completion, v_dimension_count
  FROM public.user_profile_fields
  WHERE user_id = p_user_id
    AND dimension IN ('religious', 'career', 'personality', 'lifestyle', 'family');
  
  -- If no records exist, return 0
  IF v_dimension_count = 0 THEN
    RETURN 0;
  END IF;
  
  -- Clamp to 0-100 and round to 2 decimals
  RETURN LEAST(100, GREATEST(0, ROUND(v_avg_completion, 2)));
END;
$$;

COMMENT ON FUNCTION calculate_profile_depth_score IS 'Calculate profile depth score as average completion across 5 dimensions (0-100, rounded to 2 decimals)';
