-- Add function to calculate population statistics for behavioral metrics
-- Task 3: MySoul DNA System - Behavioral Uniqueness Calculation
-- Date: 2026-01-21

-- ============================================================================
-- PART A: Create function to calculate population statistics for a metric
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_metric_population_stats(
  metric_column TEXT,
  period_start DATE,
  period_end DATE
)
RETURNS TABLE(
  mean NUMERIC,
  stddev NUMERIC
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_mean NUMERIC;
  v_stddev NUMERIC;
  v_sql TEXT;
BEGIN
  -- Build dynamic SQL to calculate mean and stddev for the specified column
  v_sql := format('
    SELECT 
      AVG(%I)::NUMERIC AS mean,
      STDDEV(%I)::NUMERIC AS stddev
    FROM public.behavioral_tracking
    WHERE period_start = $1
      AND period_end = $2
      AND %I IS NOT NULL
  ', metric_column, metric_column, metric_column);
  
  EXECUTE v_sql INTO v_mean, v_stddev USING period_start, period_end;
  
  RETURN QUERY SELECT 
    COALESCE(v_mean, 0)::NUMERIC,
    COALESCE(v_stddev, 0)::NUMERIC;
END;
$$;

COMMENT ON FUNCTION calculate_metric_population_stats IS 'Calculate population mean and standard deviation for a behavioral metric in a given period';

-- ============================================================================
-- PART B: Ensure mysoul_dna_scores has behavioral_uniqueness_score column
-- ============================================================================

-- Add behavioral_uniqueness_score column if it doesn't exist
ALTER TABLE public.mysoul_dna_scores
  ADD COLUMN IF NOT EXISTS behavioral_uniqueness_score NUMERIC(5,2) 
  CHECK (behavioral_uniqueness_score >= 0 AND behavioral_uniqueness_score <= 100);

COMMENT ON COLUMN public.mysoul_dna_scores.behavioral_uniqueness_score IS 'Behavioral uniqueness score (0-100) calculated from Z-scores';

-- Ensure unique_behaviors column exists (should already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'mysoul_dna_scores' 
    AND column_name = 'unique_behaviors'
  ) THEN
    ALTER TABLE public.mysoul_dna_scores
      ADD COLUMN unique_behaviors JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

COMMENT ON COLUMN public.mysoul_dna_scores.unique_behaviors IS 'Array of unique behavioral patterns detected (JSONB)';
