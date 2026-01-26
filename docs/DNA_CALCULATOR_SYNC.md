# DNA Calculator Synchronization

## Problem Identified

The `MySoulDNACalculator` class in `src/services/dna/MySoulDNACalculator.ts` was only used in tests, while the Supabase edge function (`supabase/functions/_shared/batch-service.ts`) had a **completely different and incorrect** implementation.

### Issues Found

1. **MySoulDNACalculator class** (`src/services/dna/MySoulDNACalculator.ts`)
   - ✅ Correct implementation with proper trait rarity calculation
   - ❌ Only used in tests, not in production

2. **Supabase Edge Function** (`supabase/functions/_shared/batch-service.ts`)
   - ❌ **WRONG**: Calculated trait rarity based on post depth/count:
     ```typescript
     const traitRarityScore = Math.min(100, Math.round((avgDepth / 5) * 70 + (postCount / 20) * 30));
     ```
   - ❌ Did not use insights or `trait_distribution_stats`
   - ❌ Returned empty `rareTraits: []`

3. **useDNAScore hook** (`src/hooks/useDNAScore.ts`)
   - Has its own `calculateScore()` function
   - Different implementation from both above
   - Used for client-side calculations

## Solution Implemented

### 1. Created Shared Module

Created `supabase/functions/_shared/dna-calculator.ts` with:
- ✅ Proper trait rarity calculation using insights and `trait_distribution_stats`
- ✅ Frequency-based rarity scoring algorithm (as per spec)
- ✅ Rare traits extraction (top 5)
- ✅ Shared constants (`COMPONENT_WEIGHTS`, `RARITY_TIER_THRESHOLDS`, etc.)
- ✅ Helper functions (`calculateDaysActive`, `getRarityTier`, etc.)

### 2. Updated Batch Service

Updated `supabase/functions/_shared/batch-service.ts`:
- ✅ Now imports and uses `calculateTraitRarity` from shared module
- ✅ Uses proper trait rarity calculation based on insights
- ✅ Returns correct `rareTraits` array
- ✅ Uses shared constants and helper functions

### 3. Current State

**Edge Functions (Production)**:
- ✅ Uses shared `dna-calculator.ts` module
- ✅ Correct trait rarity calculation
- ✅ Used by batch processing and manual recalculation

**Frontend Class**:
- ✅ `MySoulDNACalculator` class has correct implementation
- ⚠️ Only used in tests (not in production)
- ✅ Can be used for client-side calculations if needed

**Frontend Hook**:
- ⚠️ `useDNAScore` hook has its own calculation logic
- Used for client-side calculations
- Should be updated to use `MySoulDNACalculator` class if client-side calculation is needed

## Algorithm Consistency

Both implementations now use the **same trait rarity algorithm**:

1. Fetch approved insights from `user_insights` where `status='approved'`
2. Fetch all `trait_distribution_stats` and build a map
3. For each insight:
   - Extract `trait_key` from insight
   - Look up `frequency` in `trait_distribution_stats` (default 0 if missing)
   - Calculate `rarityScore` based on frequency thresholds:
     - `< 0.01` → 100
     - `< 0.05` → 90
     - `< 0.10` → 70
     - `< 0.25` → 50
     - `< 0.50` → 30
     - `>= 0.50` → 10
   - Add to `totalRarity` weighted by `confidence_score`
   - If `rarityScore >= 70`, add to `rare_traits`
4. `trait_rarity_score = min(100, totalRarity / insights.length)`
5. Sort `rare_traits` by `rarityScore` desc, then `confidence` desc, take top 5

## Files Changed

1. ✅ `supabase/functions/_shared/dna-calculator.ts` (NEW)
   - Shared DNA calculation logic

2. ✅ `supabase/functions/_shared/batch-service.ts` (UPDATED)
   - Now uses shared calculator module
   - Removed duplicate/incorrect implementations

3. ✅ `src/services/dna/MySoulDNACalculator.ts` (NO CHANGES)
   - Already had correct implementation
   - Can be used for client-side calculations if needed

## Recommendations

1. **Keep Shared Module Updated**: When updating DNA calculation logic, update `supabase/functions/_shared/dna-calculator.ts` first, then sync to `MySoulDNACalculator` class if needed.

2. **Consider Using MySoulDNACalculator in Production**: If client-side calculation is needed, use the `MySoulDNACalculator` class instead of duplicating logic in hooks.

3. **Test Both Implementations**: Ensure both edge function and frontend class produce identical results for the same inputs.

4. **Documentation**: Keep this document updated when making changes to DNA calculation logic.

## Verification

To verify both implementations are in sync:

1. Run tests: `npm test -- MySoulDNACalculator.test.ts`
2. Test edge function: Trigger DNA recalculation via batch processing
3. Compare results: Both should produce identical scores for the same user data
