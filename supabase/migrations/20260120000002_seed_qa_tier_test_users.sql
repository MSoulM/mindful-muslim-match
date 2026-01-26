-- WEB-003: QA Tier Visual Testing - Test User Seed Data
-- Task 3: MySoul DNA System
-- Date: 2026-01-20
--
-- Purpose: Creates test users with pre-calculated DNA scores across all tiers
-- for QA to verify tier-specific visuals without waiting for prerequisites.
--
-- IMPORTANT: This is TEST-ONLY data. Do NOT use in production.
-- These users are seeded with calculated scores to bypass prerequisite gates.

-- ============================================================================
-- PART A: Create test users with profiles (if they don't exist)
-- ============================================================================

-- Test user IDs (using predictable IDs for QA)
-- Format: qa_tier_{tier_name}_{score}

-- COMMON tier test users (scores 0, 20, 40)
INSERT INTO public.profiles (clerk_user_id, first_name, last_name, created_at)
VALUES 
  ('qa_tier_common_0', 'QA', 'Common0', NOW() - INTERVAL '10 days'),
  ('qa_tier_common_20', 'QA', 'Common20', NOW() - INTERVAL '10 days'),
  ('qa_tier_common_40', 'QA', 'Common40', NOW() - INTERVAL '10 days')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- UNCOMMON tier test users (scores 41, 50, 60)
INSERT INTO public.profiles (clerk_user_id, first_name, last_name, created_at)
VALUES 
  ('qa_tier_uncommon_41', 'QA', 'Uncommon41', NOW() - INTERVAL '10 days'),
  ('qa_tier_uncommon_50', 'QA', 'Uncommon50', NOW() - INTERVAL '10 days'),
  ('qa_tier_uncommon_60', 'QA', 'Uncommon60', NOW() - INTERVAL '10 days')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- RARE tier test users (scores 61, 70, 80)
INSERT INTO public.profiles (clerk_user_id, first_name, last_name, created_at)
VALUES 
  ('qa_tier_rare_61', 'QA', 'Rare61', NOW() - INTERVAL '10 days'),
  ('qa_tier_rare_70', 'QA', 'Rare70', NOW() - INTERVAL '10 days'),
  ('qa_tier_rare_80', 'QA', 'Rare80', NOW() - INTERVAL '10 days')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- EPIC tier test users (scores 81, 90, 95)
INSERT INTO public.profiles (clerk_user_id, first_name, last_name, created_at)
VALUES 
  ('qa_tier_epic_81', 'QA', 'Epic81', NOW() - INTERVAL '10 days'),
  ('qa_tier_epic_90', 'QA', 'Epic90', NOW() - INTERVAL '10 days'),
  ('qa_tier_epic_95', 'QA', 'Epic95', NOW() - INTERVAL '10 days')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- LEGENDARY tier test users (scores 96, 98, 100)
INSERT INTO public.profiles (clerk_user_id, first_name, last_name, created_at)
VALUES 
  ('qa_tier_legendary_96', 'QA', 'Legendary96', NOW() - INTERVAL '10 days'),
  ('qa_tier_legendary_98', 'QA', 'Legendary98', NOW() - INTERVAL '10 days'),
  ('qa_tier_legendary_100', 'QA', 'Legendary100', NOW() - INTERVAL '10 days')
ON CONFLICT (clerk_user_id) DO NOTHING;

-- ============================================================================
-- PART B: Seed DNA scores for each tier
-- ============================================================================

-- Helper function to calculate component scores that sum to target final score
-- Using weighted formula: trait(35%) + depth(25%) + behavioral(20%) + content(15%) + cultural(5%)
-- For simplicity, we'll set all components to the same value to reach target score

-- COMMON tier (0-40)
INSERT INTO public.mysoul_dna_scores (
  user_id, score, rarity_tier,
  trait_rarity_raw_score, profile_depth_raw_score, behavioral_raw_score,
  content_raw_score, cultural_raw_score,
  approved_insights_count, days_active,
  algorithm_version, last_calculated_at
)
VALUES 
  -- Score 0 (seed state)
  ('qa_tier_common_0', 0, 'COMMON', 0, 0, 0, 0, 0, 0, 0, 'v1.0', NOW()),
  -- Score 20
  ('qa_tier_common_20', 20, 'COMMON', 20, 20, 20, 20, 20, 10, 10, 'v1.0', NOW()),
  -- Score 40 (boundary)
  ('qa_tier_common_40', 40, 'COMMON', 40, 40, 40, 40, 40, 10, 10, 'v1.0', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  score = EXCLUDED.score,
  rarity_tier = EXCLUDED.rarity_tier,
  trait_rarity_raw_score = EXCLUDED.trait_rarity_raw_score,
  profile_depth_raw_score = EXCLUDED.profile_depth_raw_score,
  behavioral_raw_score = EXCLUDED.behavioral_raw_score,
  content_raw_score = EXCLUDED.content_raw_score,
  cultural_raw_score = EXCLUDED.cultural_raw_score,
  last_calculated_at = EXCLUDED.last_calculated_at;

-- UNCOMMON tier (41-60)
INSERT INTO public.mysoul_dna_scores (
  user_id, score, rarity_tier,
  trait_rarity_raw_score, profile_depth_raw_score, behavioral_raw_score,
  content_raw_score, cultural_raw_score,
  approved_insights_count, days_active,
  algorithm_version, last_calculated_at
)
VALUES 
  -- Score 41 (boundary)
  ('qa_tier_uncommon_41', 41, 'UNCOMMON', 41, 41, 41, 41, 41, 10, 10, 'v1.0', NOW()),
  -- Score 50 (mid-range)
  ('qa_tier_uncommon_50', 50, 'UNCOMMON', 50, 50, 50, 50, 50, 10, 10, 'v1.0', NOW()),
  -- Score 60 (boundary)
  ('qa_tier_uncommon_60', 60, 'UNCOMMON', 60, 60, 60, 60, 60, 10, 10, 'v1.0', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  score = EXCLUDED.score,
  rarity_tier = EXCLUDED.rarity_tier,
  trait_rarity_raw_score = EXCLUDED.trait_rarity_raw_score,
  profile_depth_raw_score = EXCLUDED.profile_depth_raw_score,
  behavioral_raw_score = EXCLUDED.behavioral_raw_score,
  content_raw_score = EXCLUDED.content_raw_score,
  cultural_raw_score = EXCLUDED.cultural_raw_score,
  last_calculated_at = EXCLUDED.last_calculated_at;

-- RARE tier (61-80)
INSERT INTO public.mysoul_dna_scores (
  user_id, score, rarity_tier,
  trait_rarity_raw_score, profile_depth_raw_score, behavioral_raw_score,
  content_raw_score, cultural_raw_score,
  approved_insights_count, days_active,
  algorithm_version, last_calculated_at
)
VALUES 
  -- Score 61 (boundary)
  ('qa_tier_rare_61', 61, 'RARE', 61, 61, 61, 61, 61, 10, 10, 'v1.0', NOW()),
  -- Score 70 (mid-range)
  ('qa_tier_rare_70', 70, 'RARE', 70, 70, 70, 70, 70, 10, 10, 'v1.0', NOW()),
  -- Score 80 (boundary)
  ('qa_tier_rare_80', 80, 'RARE', 80, 80, 80, 80, 80, 10, 10, 'v1.0', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  score = EXCLUDED.score,
  rarity_tier = EXCLUDED.rarity_tier,
  trait_rarity_raw_score = EXCLUDED.trait_rarity_raw_score,
  profile_depth_raw_score = EXCLUDED.profile_depth_raw_score,
  behavioral_raw_score = EXCLUDED.behavioral_raw_score,
  content_raw_score = EXCLUDED.content_raw_score,
  cultural_raw_score = EXCLUDED.cultural_raw_score,
  last_calculated_at = EXCLUDED.last_calculated_at;

-- EPIC tier (81-95)
INSERT INTO public.mysoul_dna_scores (
  user_id, score, rarity_tier,
  trait_rarity_raw_score, profile_depth_raw_score, behavioral_raw_score,
  content_raw_score, cultural_raw_score,
  approved_insights_count, days_active,
  algorithm_version, last_calculated_at
)
VALUES 
  -- Score 81 (boundary)
  ('qa_tier_epic_81', 81, 'EPIC', 81, 81, 81, 81, 81, 10, 10, 'v1.0', NOW()),
  -- Score 90 (mid-range)
  ('qa_tier_epic_90', 90, 'EPIC', 90, 90, 90, 90, 90, 10, 10, 'v1.0', NOW()),
  -- Score 95 (boundary)
  ('qa_tier_epic_95', 95, 'EPIC', 95, 95, 95, 95, 95, 10, 10, 'v1.0', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  score = EXCLUDED.score,
  rarity_tier = EXCLUDED.rarity_tier,
  trait_rarity_raw_score = EXCLUDED.trait_rarity_raw_score,
  profile_depth_raw_score = EXCLUDED.profile_depth_raw_score,
  behavioral_raw_score = EXCLUDED.behavioral_raw_score,
  content_raw_score = EXCLUDED.content_raw_score,
  cultural_raw_score = EXCLUDED.cultural_raw_score,
  last_calculated_at = EXCLUDED.last_calculated_at;

-- LEGENDARY tier (96-100)
INSERT INTO public.mysoul_dna_scores (
  user_id, score, rarity_tier,
  trait_rarity_raw_score, profile_depth_raw_score, behavioral_raw_score,
  content_raw_score, cultural_raw_score,
  approved_insights_count, days_active,
  algorithm_version, last_calculated_at
)
VALUES 
  -- Score 96 (boundary)
  ('qa_tier_legendary_96', 96, 'LEGENDARY', 96, 96, 96, 96, 96, 10, 10, 'v1.0', NOW()),
  -- Score 98 (mid-range)
  ('qa_tier_legendary_98', 98, 'LEGENDARY', 98, 98, 98, 98, 98, 10, 10, 'v1.0', NOW()),
  -- Score 100 (max)
  ('qa_tier_legendary_100', 100, 'LEGENDARY', 100, 100, 100, 100, 100, 10, 10, 'v1.0', NOW())
ON CONFLICT (user_id) DO UPDATE SET
  score = EXCLUDED.score,
  rarity_tier = EXCLUDED.rarity_tier,
  trait_rarity_raw_score = EXCLUDED.trait_rarity_raw_score,
  profile_depth_raw_score = EXCLUDED.profile_depth_raw_score,
  behavioral_raw_score = EXCLUDED.behavioral_raw_score,
  content_raw_score = EXCLUDED.content_raw_score,
  cultural_raw_score = EXCLUDED.cultural_raw_score,
  last_calculated_at = EXCLUDED.last_calculated_at;

-- ============================================================================
-- PART C: Add component breakdown for visual testing
-- ============================================================================

-- Update component_breakdown for each test user to have realistic data
UPDATE public.mysoul_dna_scores
SET component_breakdown = jsonb_build_object(
  'traitRarity', jsonb_build_object(
    'score', trait_rarity_raw_score,
    'weight', 0.35,
    'weightedScore', ROUND(trait_rarity_raw_score * 0.35, 2),
    'explanation', 'Test data for QA visual testing'
  ),
  'profileDepth', jsonb_build_object(
    'score', profile_depth_raw_score,
    'weight', 0.25,
    'weightedScore', ROUND(profile_depth_raw_score * 0.25, 2),
    'explanation', 'Test data for QA visual testing'
  ),
  'behavioral', jsonb_build_object(
    'score', behavioral_raw_score,
    'weight', 0.20,
    'weightedScore', ROUND(behavioral_raw_score * 0.20, 2),
    'explanation', 'Test data for QA visual testing'
  ),
  'contentOriginality', jsonb_build_object(
    'score', content_raw_score,
    'weight', 0.15,
    'weightedScore', ROUND(content_raw_score * 0.15, 2),
    'explanation', 'Test data for QA visual testing'
  ),
  'culturalVariance', jsonb_build_object(
    'score', cultural_raw_score,
    'weight', 0.05,
    'weightedScore', ROUND(cultural_raw_score * 0.05, 2),
    'explanation', 'Test data for QA visual testing'
  )
)
WHERE user_id LIKE 'qa_tier_%';

-- ============================================================================
-- PART D: Add comments and documentation
-- ============================================================================

COMMENT ON TABLE public.mysoul_dna_scores IS 
'DNA scores table. Test users prefixed with qa_tier_* are seeded for QA visual testing.';

-- Create a view for easy QA access
CREATE OR REPLACE VIEW public.qa_tier_test_users AS
SELECT 
  p.clerk_user_id AS user_id,
  p.first_name || ' ' || p.last_name AS display_name,
  mds.score,
  mds.rarity_tier,
  mds.trait_rarity_raw_score,
  mds.profile_depth_raw_score,
  mds.behavioral_raw_score,
  mds.content_raw_score,
  mds.cultural_raw_score
FROM public.profiles p
JOIN public.mysoul_dna_scores mds ON p.clerk_user_id = mds.user_id
WHERE p.clerk_user_id LIKE 'qa_tier_%'
ORDER BY mds.score;

COMMENT ON VIEW public.qa_tier_test_users IS 
'QA test users with pre-seeded DNA scores across all tiers for visual testing. 
Use these user IDs to log in and verify tier-specific visuals.';

-- Grant access
GRANT SELECT ON public.qa_tier_test_users TO authenticated;
GRANT SELECT ON public.qa_tier_test_users TO service_role;
