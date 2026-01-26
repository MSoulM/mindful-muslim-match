# WEB-003: QA Quick Reference - DNA Score Behavior

## TL;DR

**New accounts get a seed state (score = 0), not a calculated score.**

## What to Expect

### ✅ New Account (Just Created)
- DNA score record **exists** in database
- `final_score = 0`
- `rarity_tier = 'COMMON'`
- All component scores = 0
- This is **correct behavior** (seed state)

### ✅ Account with Prerequisites Met
- DNA score record **exists** in database
- `final_score > 0` (actual calculated value)
- `rarity_tier` matches score range
- Component scores are calculated
- This is a **calculated score**

## Quick Verification Queries

### Check if Account Has Seed State or Calculated Score

```sql
SELECT 
  user_id,
  score AS final_score,
  rarity_tier,
  approved_insights_count,
  days_active,
  CASE 
    WHEN score = 0 AND approved_insights_count < 5 THEN 'SEED STATE'
    WHEN score > 0 THEN 'CALCULATED'
    ELSE 'UNKNOWN'
  END AS score_type
FROM mysoul_dna_scores
WHERE user_id = 'your_test_user_id';
```

### Verify Tier Boundaries (Only for Calculated Scores)

```sql
SELECT 
  score,
  rarity_tier,
  CASE 
    WHEN score BETWEEN 0 AND 40 AND rarity_tier = 'COMMON' THEN '✓'
    WHEN score BETWEEN 41 AND 60 AND rarity_tier = 'UNCOMMON' THEN '✓'
    WHEN score BETWEEN 61 AND 80 AND rarity_tier = 'RARE' THEN '✓'
    WHEN score BETWEEN 81 AND 95 AND rarity_tier = 'EPIC' THEN '✓'
    WHEN score BETWEEN 96 AND 100 AND rarity_tier = 'LEGENDARY' THEN '✓'
    ELSE '✗ FAIL'
  END AS tier_check
FROM mysoul_dna_scores
WHERE score > 0  -- Only test calculated scores
ORDER BY score;
```

## Test Case Expectations

### ❌ WRONG Expectation
> "Every time I create an account, the DNA scoring is automatically completed."

**Why it's wrong:** This implies a calculated score, but new accounts only get seed state.

### ✅ CORRECT Expectation
> "Every time I create an account, a DNA score record is created with seed state (score = 0, tier = COMMON). Calculated scores appear after prerequisites are met."

## Prerequisites for Calculated Score

1. **≥ 5 approved insights** (required for trait rarity calculation)
2. **≥ 7 days of activity** (required for behavioral component)
3. **Calculation triggered** (weekly batch or manual)

## Common Test Scenarios

### Scenario 1: New Account Test
**Setup:** Create fresh account  
**Expected:** Seed state (score = 0, tier = COMMON)  
**Status:** ✅ PASS if seed state exists

### Scenario 2: Tier Boundary Test
**Setup:** Account with calculated score  
**Expected:** Tier matches score range  
**Status:** ✅ PASS if tier boundaries correct

### Scenario 3: Prerequisites Gate Test
**Setup:** Account with < 5 insights  
**Expected:** Seed state persists  
**Status:** ✅ PASS if score remains 0

## Testing Tier Visuals

**Problem:** Can only see COMMON tier for new accounts.

**Solution:** Use pre-seeded test users with calculated scores.

**Quick Access:**
```sql
SELECT * FROM public.qa_tier_test_users ORDER BY score;
```

**Test Users:**
- COMMON: `qa_tier_common_0`, `qa_tier_common_20`, `qa_tier_common_40`
- UNCOMMON: `qa_tier_uncommon_41`, `qa_tier_uncommon_50`, `qa_tier_uncommon_60`
- RARE: `qa_tier_rare_61`, `qa_tier_rare_70`, `qa_tier_rare_80`
- EPIC: `qa_tier_epic_81`, `qa_tier_epic_90`, `qa_tier_epic_95`
- LEGENDARY: `qa_tier_legendary_96`, `qa_tier_legendary_98`, `qa_tier_legendary_100`

**Full Guide:** See `WEB003_QA_TIER_VISUAL_TESTING.md`

## Need Help?

- **Seed state vs calculated score?** → See `WEB003_QA_TEST_CASE_CORRECTION.md`
- **Verification queries?** → See `WEB003_QA_VERIFICATION_GUIDE.md`
- **Tier boundaries?** → See tier mapping in test case correction doc
- **Tier visuals testing?** → See `WEB003_QA_TIER_VISUAL_TESTING.md`
