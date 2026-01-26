-- WEB-003: DNA Score Verification View
-- Task 3: MySoul DNA System
-- Date: 2026-01-20
--
-- Purpose: Provides QA with a single, unambiguous source for verifying DNA score calculations
-- This view exposes component scores with QA-friendly column names and includes
-- weighted contributions and recomputed totals for verification.
--
-- Verification Formula:
--   final_score = ROUND(
--     (trait_rarity_score × 0.35) +
--     (profile_depth_score × 0.25) +
--     (behavioral_uniqueness_score × 0.20) +
--     (content_originality_score × 0.15) +
--     (cultural_variance_score × 0.05),
--     2
--   )
--
-- IMPORTANT: Use ONLY the columns from this view for verification.
-- Do NOT use component_breakdown JSONB values - they are for UI/debug only.

CREATE OR REPLACE VIEW public.mysoul_dna_score_verification_view AS
SELECT
  -- Primary identifiers
  mds.user_id,
  mds.id AS score_id,
  mds.score AS final_score,
  mds.rarity_tier,
  mds.percentile_rank,
  mds.last_calculated_at,
  
  -- Component raw scores (0-100) - AUTHORITATIVE SOURCE FOR VERIFICATION
  mds.trait_rarity_raw_score AS trait_rarity_score,
  mds.profile_depth_raw_score AS profile_depth_score,
  mds.behavioral_raw_score AS behavioral_uniqueness_score,
  mds.content_raw_score AS content_originality_score,
  mds.cultural_raw_score AS cultural_variance_score,
  
  -- Component weights (constants)
  0.35 AS trait_rarity_weight,
  0.25 AS profile_depth_weight,
  0.20 AS behavioral_uniqueness_weight,
  0.15 AS content_originality_weight,
  0.05 AS cultural_variance_weight,
  
  -- Weighted contributions (raw_score × weight)
  -- COALESCE handles NULL values by treating them as 0 for calculation
  ROUND(COALESCE(mds.trait_rarity_raw_score, 0) * 0.35, 2) AS trait_rarity_contribution,
  ROUND(COALESCE(mds.profile_depth_raw_score, 0) * 0.25, 2) AS profile_depth_contribution,
  ROUND(COALESCE(mds.behavioral_raw_score, 0) * 0.20, 2) AS behavioral_uniqueness_contribution,
  ROUND(COALESCE(mds.content_raw_score, 0) * 0.15, 2) AS content_originality_contribution,
  ROUND(COALESCE(mds.cultural_raw_score, 0) * 0.05, 2) AS cultural_variance_contribution,
  
  -- Recomputed total (for verification) - shows precise calculation before rounding
  -- Note: final_score is stored as INTEGER, so it's rounded to nearest integer
  -- COALESCE handles NULL values by treating them as 0 for calculation
  ROUND(
    (COALESCE(mds.trait_rarity_raw_score, 0) * 0.35) +
    (COALESCE(mds.profile_depth_raw_score, 0) * 0.25) +
    (COALESCE(mds.behavioral_raw_score, 0) * 0.20) +
    (COALESCE(mds.content_raw_score, 0) * 0.15) +
    (COALESCE(mds.cultural_raw_score, 0) * 0.05),
    2
  ) AS recomputed_total_precise,
  
  -- Recomputed total rounded to integer (matches final_score storage)
  ROUND(
    (COALESCE(mds.trait_rarity_raw_score, 0) * 0.35) +
    (COALESCE(mds.profile_depth_raw_score, 0) * 0.25) +
    (COALESCE(mds.behavioral_raw_score, 0) * 0.20) +
    (COALESCE(mds.content_raw_score, 0) * 0.15) +
    (COALESCE(mds.cultural_raw_score, 0) * 0.05)
  ) AS recomputed_total_rounded,
  
  -- Verification check: difference between final_score and recomputed_total_rounded
  -- Should be 0 (exact match) since both are integers
  -- Returns NULL if final_score is NULL (no score calculated yet)
  CASE 
    WHEN mds.score IS NULL THEN NULL
    ELSE ABS(
      mds.score - ROUND(
        (COALESCE(mds.trait_rarity_raw_score, 0) * 0.35) +
        (COALESCE(mds.profile_depth_raw_score, 0) * 0.25) +
        (COALESCE(mds.behavioral_raw_score, 0) * 0.20) +
        (COALESCE(mds.content_raw_score, 0) * 0.15) +
        (COALESCE(mds.cultural_raw_score, 0) * 0.05)
      )
    )
  END AS verification_delta,
  
  -- Additional metadata
  mds.approved_insights_count,
  mds.days_active,
  mds.algorithm_version,
  mds.change_delta

FROM public.mysoul_dna_scores mds;

-- Add comments for documentation
COMMENT ON VIEW public.mysoul_dna_score_verification_view IS 
'QA Verification View for MySoul DNA Scores. 
Provides authoritative column names matching QA test case expectations.
Use ONLY these columns for manual verification - ignore component_breakdown JSONB.

Verification Steps:
1. Extract component scores: trait_rarity_score, profile_depth_score, behavioral_uniqueness_score, content_originality_score, cultural_variance_score
2. Multiply each by its weight (shown in *_weight columns)
3. Sum all weighted contributions
4. Round to nearest integer (final_score is stored as INTEGER)
5. Compare recomputed_total_rounded to final_score (should match exactly, delta = 0)

The recomputed_total_precise column shows the calculation with 2 decimal precision before rounding.
The verification_delta column shows the difference - should be 0 (exact match).';

COMMENT ON COLUMN public.mysoul_dna_score_verification_view.trait_rarity_score IS 
'AUTHORITATIVE: Raw trait rarity score (0-100). Use this for verification, NOT component_breakdown values.';

COMMENT ON COLUMN public.mysoul_dna_score_verification_view.profile_depth_score IS 
'AUTHORITATIVE: Raw profile depth score (0-100). Use this for verification, NOT component_breakdown values.';

COMMENT ON COLUMN public.mysoul_dna_score_verification_view.behavioral_uniqueness_score IS 
'AUTHORITATIVE: Raw behavioral uniqueness score (0-100). Use this for verification, NOT component_breakdown values.';

COMMENT ON COLUMN public.mysoul_dna_score_verification_view.content_originality_score IS 
'AUTHORITATIVE: Raw content originality score (0-100). Use this for verification, NOT component_breakdown values.';

COMMENT ON COLUMN public.mysoul_dna_score_verification_view.cultural_variance_score IS 
'AUTHORITATIVE: Raw cultural variance score (0-100). Use this for verification, NOT component_breakdown values.';

COMMENT ON COLUMN public.mysoul_dna_score_verification_view.recomputed_total_precise IS 
'Recomputed total using weighted formula with 2 decimal precision. Shows exact calculation before rounding.';

COMMENT ON COLUMN public.mysoul_dna_score_verification_view.recomputed_total_rounded IS 
'Recomputed total rounded to nearest integer. Should match final_score exactly (both are integers).';

COMMENT ON COLUMN public.mysoul_dna_score_verification_view.verification_delta IS 
'Difference between final_score and recomputed_total_rounded. Should be 0 (exact match).';

-- Grant access to authenticated users (for QA/testing)
GRANT SELECT ON public.mysoul_dna_score_verification_view TO authenticated;
GRANT SELECT ON public.mysoul_dna_score_verification_view TO service_role;
