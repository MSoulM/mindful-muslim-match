# WEB-003: DNA Score Verification Guide

## Issue Summary

QA cannot verify the weighted DNA score because column names don't match test case expectations, and there's ambiguity about which values to use for verification.

## Resolution

A database view has been created that provides QA with a single, unambiguous source for verification.

## Authoritative Verification Source

**Use ONLY the `mysoul_dna_score_verification_view` for manual verification.**

### View Location
```sql
SELECT * FROM public.mysoul_dna_score_verification_view WHERE user_id = 'your_user_id';
```

### Key Columns for Verification

The view provides QA-friendly column names that match test case expectations:

- `trait_rarity_score` - Raw trait rarity score (0-100)
- `profile_depth_score` - Raw profile depth score (0-100)
- `behavioral_uniqueness_score` - Raw behavioral uniqueness score (0-100)
- `content_originality_score` - Raw content originality score (0-100)
- `cultural_variance_score` - Raw cultural variance score (0-100)

**IMPORTANT:** These columns map directly to the database columns:
- `trait_rarity_raw_score` → `trait_rarity_score`
- `profile_depth_raw_score` → `profile_depth_score`
- `behavioral_raw_score` → `behavioral_uniqueness_score`
- `content_raw_score` → `content_originality_score`
- `cultural_raw_score` → `cultural_variance_score`

## Verification Formula

The DNA score is calculated using the following weighted formula:

```
final_score = ROUND(
  (trait_rarity_score × 0.35) +
  (profile_depth_score × 0.25) +
  (behavioral_uniqueness_score × 0.20) +
  (content_originality_score × 0.15) +
  (cultural_variance_score × 0.05)
)
```

**Note:** `final_score` is stored as an INTEGER, so the result is rounded to the nearest integer.

## Verification Steps

1. **Query the verification view:**
   ```sql
   SELECT 
     trait_rarity_score,
     profile_depth_score,
     behavioral_uniqueness_score,
     content_originality_score,
     cultural_variance_score,
     final_score,
     recomputed_total_rounded,
     verification_delta
   FROM public.mysoul_dna_score_verification_view
   WHERE user_id = 'your_user_id';
   ```

2. **Manual calculation (optional):**
   - Multiply each component score by its weight:
     - `trait_rarity_score × 0.35`
     - `profile_depth_score × 0.25`
     - `behavioral_uniqueness_score × 0.20`
     - `content_originality_score × 0.15`
     - `cultural_variance_score × 0.05`
   - Sum all weighted contributions
   - Round to nearest integer

3. **Compare results:**
   - `recomputed_total_rounded` should equal `final_score`
   - `verification_delta` should be `0`

## What NOT to Use

**Do NOT use `component_breakdown` JSONB for verification.**

The `component_breakdown` column contains:
- UI-friendly labels and explanations
- Derived values that may have been rounded differently
- Debug information

It is **NOT** the authoritative source for verification calculations.

## Example Verification Query

```sql
-- Verify a specific user's DNA score
SELECT 
  user_id,
  final_score,
  trait_rarity_score,
  profile_depth_score,
  behavioral_uniqueness_score,
  content_originality_score,
  cultural_variance_score,
  trait_rarity_contribution,
  profile_depth_contribution,
  behavioral_uniqueness_contribution,
  content_originality_contribution,
  cultural_variance_contribution,
  recomputed_total_precise,
  recomputed_total_rounded,
  verification_delta,
  CASE 
    WHEN verification_delta = 0 THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS verification_status
FROM public.mysoul_dna_score_verification_view
WHERE user_id = 'your_user_id';
```

## Troubleshooting

### If verification_delta is not 0:

1. **Check for NULL values:** Ensure all component scores are populated (not NULL)
2. **Check data types:** Component scores should be integers (0-100)
3. **Verify weights:** Weights are constants (0.35, 0.25, 0.20, 0.15, 0.05)
4. **Check rounding:** Final score is rounded to nearest integer, not 2 decimals

### Common Mistakes to Avoid:

1. ❌ Using `component_breakdown` JSONB values
2. ❌ Rounding intermediate values before summation
3. ❌ Using old column names (`trait_uniqueness_score`, `profile_completeness_score`, etc.)
4. ❌ Expecting 2 decimal precision in final_score (it's an integer)

## Database Schema Reference

### Authoritative Columns (use these):
- `mysoul_dna_scores.trait_rarity_raw_score`
- `mysoul_dna_scores.profile_depth_raw_score`
- `mysoul_dna_scores.behavioral_raw_score`
- `mysoul_dna_scores.content_raw_score`
- `mysoul_dna_scores.cultural_raw_score`
- `mysoul_dna_scores.score` (final_score)

### Deprecated/UI-Only (do NOT use for verification):
- `mysoul_dna_scores.component_breakdown` (JSONB - for UI/debug only)

## Support

If verification fails, check:
1. The view is up to date: `SELECT * FROM mysoul_dna_score_verification_view LIMIT 1;`
2. Component scores are within valid range (0-100)
3. Final score matches the rounded calculation

For questions or issues, refer to the migration file:
`supabase/migrations/20260120000001_create_dna_score_verification_view.sql`
