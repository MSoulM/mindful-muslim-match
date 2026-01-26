-- WEB-003: QA Test User Verification Script
-- Run this to verify test users are seeded correctly

-- ============================================================================
-- PART A: Check if test users exist
-- ============================================================================

SELECT 
  'Test Users Check' AS check_type,
  COUNT(*) AS user_count,
  CASE 
    WHEN COUNT(*) = 15 THEN '✓ All test users exist'
    WHEN COUNT(*) > 0 THEN '⚠ Some test users missing'
    ELSE '✗ No test users found'
  END AS status
FROM public.qa_tier_test_users;

-- ============================================================================
-- PART B: Verify tier distribution
-- ============================================================================

SELECT 
  rarity_tier,
  COUNT(*) AS user_count,
  MIN(score) AS min_score,
  MAX(score) AS max_score,
  CASE 
    WHEN rarity_tier = 'COMMON' AND MIN(score) = 0 AND MAX(score) = 40 THEN '✓'
    WHEN rarity_tier = 'UNCOMMON' AND MIN(score) = 41 AND MAX(score) = 60 THEN '✓'
    WHEN rarity_tier = 'RARE' AND MIN(score) = 61 AND MAX(score) = 80 THEN '✓'
    WHEN rarity_tier = 'EPIC' AND MIN(score) = 81 AND MAX(score) = 95 THEN '✓'
    WHEN rarity_tier = 'LEGENDARY' AND MIN(score) = 96 AND MAX(score) = 100 THEN '✓'
    ELSE '✗'
  END AS tier_check
FROM public.qa_tier_test_users
GROUP BY rarity_tier
ORDER BY MIN(score);

-- ============================================================================
-- PART C: Verify boundary cases
-- ============================================================================

SELECT 
  'Boundary Cases' AS check_type,
  user_id,
  score,
  rarity_tier,
  CASE 
    WHEN score = 40 AND rarity_tier = 'COMMON' THEN '✓'
    WHEN score = 41 AND rarity_tier = 'UNCOMMON' THEN '✓'
    WHEN score = 60 AND rarity_tier = 'UNCOMMON' THEN '✓'
    WHEN score = 61 AND rarity_tier = 'RARE' THEN '✓'
    WHEN score = 80 AND rarity_tier = 'RARE' THEN '✓'
    WHEN score = 81 AND rarity_tier = 'EPIC' THEN '✓'
    WHEN score = 95 AND rarity_tier = 'EPIC' THEN '✓'
    WHEN score = 96 AND rarity_tier = 'LEGENDARY' THEN '✓'
    WHEN score = 100 AND rarity_tier = 'LEGENDARY' THEN '✓'
    ELSE '✗'
  END AS boundary_check
FROM public.qa_tier_test_users
WHERE score IN (0, 40, 41, 60, 61, 80, 81, 95, 96, 100)
ORDER BY score;

-- ============================================================================
-- PART D: List all test users for easy reference
-- ============================================================================

SELECT 
  user_id,
  display_name,
  score,
  rarity_tier,
  'Use this user ID to log in and test visuals' AS usage
FROM public.qa_tier_test_users
ORDER BY score;

-- ============================================================================
-- PART E: Verify component scores are set
-- ============================================================================

SELECT 
  'Component Scores' AS check_type,
  COUNT(*) AS users_with_components,
  COUNT(*) FILTER (WHERE trait_rarity_raw_score IS NOT NULL) AS has_trait,
  COUNT(*) FILTER (WHERE profile_depth_raw_score IS NOT NULL) AS has_depth,
  COUNT(*) FILTER (WHERE behavioral_raw_score IS NOT NULL) AS has_behavioral,
  COUNT(*) FILTER (WHERE content_raw_score IS NOT NULL) AS has_content,
  COUNT(*) FILTER (WHERE cultural_raw_score IS NOT NULL) AS has_cultural
FROM public.mysoul_dna_scores
WHERE user_id LIKE 'qa_tier_%';

-- ============================================================================
-- PART F: Summary report
-- ============================================================================

SELECT 
  'SUMMARY' AS report_section,
  (SELECT COUNT(*) FROM public.qa_tier_test_users) AS total_test_users,
  (SELECT COUNT(DISTINCT rarity_tier) FROM public.qa_tier_test_users) AS tiers_covered,
  (SELECT COUNT(*) FROM public.qa_tier_test_users WHERE score = 0) AS seed_state_users,
  (SELECT COUNT(*) FROM public.qa_tier_test_users WHERE score > 0) AS calculated_users,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.qa_tier_test_users) = 15 
      AND (SELECT COUNT(DISTINCT rarity_tier) FROM public.qa_tier_test_users) = 5
    THEN '✓ All test users ready'
    ELSE '⚠ Setup incomplete'
  END AS overall_status;
