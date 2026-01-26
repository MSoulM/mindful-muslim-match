# WEB-003: QA Tier Visual Testing Guide

## Issue

QA cannot test tier-specific visuals because new accounts only show COMMON tier (seed state with score = 0). This is expected behavior per business rules, but prevents visual testing.

## Solution

Test users have been seeded with pre-calculated DNA scores across all tiers. Use these test accounts to verify tier-specific visuals.

## Test User Accounts

### Quick Reference

| User ID | Score | Tier | Visual Expectations |
|---------|-------|------|---------------------|
| `qa_tier_common_0` | 0 | COMMON | Gray badge, no glow |
| `qa_tier_common_20` | 20 | COMMON | Gray badge, no glow |
| `qa_tier_common_40` | 40 | COMMON | Gray badge, no glow |
| `qa_tier_uncommon_41` | 41 | UNCOMMON | Green badge, green glow |
| `qa_tier_uncommon_50` | 50 | UNCOMMON | Green badge, green glow |
| `qa_tier_uncommon_60` | 60 | UNCOMMON | Green badge, green glow |
| `qa_tier_rare_61` | 61 | RARE | Blue badge, blue glow |
| `qa_tier_rare_70` | 70 | RARE | Blue badge, blue glow |
| `qa_tier_rare_80` | 80 | RARE | Blue badge, blue glow |
| `qa_tier_epic_81` | 81 | EPIC | Purple badge, purple glow |
| `qa_tier_epic_90` | 90 | EPIC | Purple badge, purple glow |
| `qa_tier_epic_95` | 95 | EPIC | Purple badge, purple glow |
| `qa_tier_legendary_96` | 96 | LEGENDARY | Amber/orange badge, amber glow |
| `qa_tier_legendary_98` | 98 | LEGENDARY | Amber/orange badge, amber glow |
| `qa_tier_legendary_100` | 100 | LEGENDARY | Amber/orange badge, amber glow |

## Visual Specifications Per Tier

### COMMON (0-40)
- **Color**: `#9CA3AF` (gray)
- **Gradient**: `from-gray-400 to-gray-500`
- **Glow**: `rgba(156, 163, 175, 0.3)`
- **Icon**: Star
- **Description**: "Just getting started"
- **Badge Style**: Gray gradient, subtle glow

### UNCOMMON (41-60)
- **Color**: `#22C55E` (green)
- **Gradient**: `from-green-400 to-green-500`
- **Glow**: `rgba(34, 197, 94, 0.3)`
- **Icon**: Zap
- **Description**: "Building your identity"
- **Badge Style**: Green gradient, green glow

### RARE (61-80)
- **Color**: `#3B82F6` (blue)
- **Gradient**: `from-blue-400 to-blue-600`
- **Glow**: `rgba(59, 130, 246, 0.4)`
- **Icon**: Gem
- **Description**: "Standing out from the crowd"
- **Badge Style**: Blue gradient, blue glow

### EPIC (81-95)
- **Color**: `#A855F7` (purple)
- **Gradient**: `from-purple-400 to-purple-600`
- **Glow**: `rgba(168, 85, 247, 0.4)`
- **Icon**: Sparkles
- **Description**: "Exceptionally unique"
- **Badge Style**: Purple gradient, purple glow

### LEGENDARY (96-100)
- **Color**: `#F59E0B` (amber/orange)
- **Gradient**: `from-amber-400 to-orange-500`
- **Glow**: `rgba(245, 158, 11, 0.5)`
- **Icon**: Crown
- **Description**: "One in a million"
- **Badge Style**: Amber/orange gradient, amber glow

## Testing Steps

### 1. Access Test Users

Query available test users:
```sql
SELECT * FROM public.qa_tier_test_users ORDER BY score;
```

### 2. Log In as Test User

Use Clerk authentication with test user IDs:
- `qa_tier_common_0`
- `qa_tier_uncommon_41`
- `qa_tier_rare_61`
- `qa_tier_epic_81`
- `qa_tier_legendary_96`

### 3. Navigate to DNA Screen

Go to `/dna` or wherever DNA score is displayed.

### 4. Verify Visual Elements

For each tier, verify:

#### Badge
- [ ] Correct color matches tier specification
- [ ] Gradient matches tier specification
- [ ] Icon matches tier (Star/Zap/Gem/Sparkles/Crown)
- [ ] Text displays tier name correctly

#### Glow Effect
- [ ] Box shadow uses correct glow color
- [ ] Glow intensity matches tier specification
- [ ] Animation (if any) works correctly

#### Background Gradient
- [ ] Card/container uses correct gradient
- [ ] Gradient direction matches specification
- [ ] Colors match tier specification

#### Animation
- [ ] DNA helix animation uses correct color
- [ ] Animation speed/behavior is appropriate
- [ ] No visual glitches or artifacts

### 5. Test Boundary Cases

Verify tier boundaries are correct:
- Score 40 → COMMON (not UNCOMMON)
- Score 41 → UNCOMMON (not COMMON)
- Score 60 → UNCOMMON (not RARE)
- Score 61 → RARE (not UNCOMMON)
- Score 80 → RARE (not EPIC)
- Score 81 → EPIC (not RARE)
- Score 95 → EPIC (not LEGENDARY)
- Score 96 → LEGENDARY (not EPIC)

## Test Case Template

### Test: Tier Visual Verification

**Test ID:** `DNA-VISUAL-001`

**Description:** Verify tier-specific visuals (badge, glow, gradient, animation) match specifications.

**Preconditions:**
- Test users seeded with scores across all tiers
- Access to test user accounts

**Test Steps:**
1. Log in as test user for each tier
2. Navigate to DNA screen
3. Verify visual elements match tier specification

**Expected Results:**
- ✅ Badge color matches tier
- ✅ Gradient matches tier
- ✅ Glow effect matches tier
- ✅ Icon matches tier
- ✅ Animation uses correct color
- ✅ Boundary cases show correct tier

**Test Data:**
- COMMON: `qa_tier_common_40` (score 40)
- UNCOMMON: `qa_tier_uncommon_41` (score 41), `qa_tier_uncommon_60` (score 60)
- RARE: `qa_tier_rare_61` (score 61), `qa_tier_rare_80` (score 80)
- EPIC: `qa_tier_epic_81` (score 81), `qa_tier_epic_95` (score 95)
- LEGENDARY: `qa_tier_legendary_96` (score 96), `qa_tier_legendary_100` (score 100)

**Actual Results:** [QA fills in]

**Status:** [PASS/FAIL]

## Troubleshooting

### Issue: Test users not visible

**Solution:**
```sql
-- Check if test users exist
SELECT * FROM public.qa_tier_test_users;

-- If empty, run the seed migration
-- File: supabase/migrations/20260120000002_seed_qa_tier_test_users.sql
```

### Issue: Visuals don't match specification

**Check:**
1. Verify tier is correctly assigned: `SELECT score, rarity_tier FROM mysoul_dna_scores WHERE user_id = 'qa_tier_...'`
2. Check component configuration in code: `src/hooks/useDNAScore.ts` → `RARITY_CONFIG`
3. Verify UI component uses correct config: `src/components/profile/MySoulDNA.tsx`

### Issue: Can't log in as test user

**Solution:**
- Test users are seeded in database but may need Clerk accounts created
- Contact engineering to create Clerk test accounts for these user IDs
- Or use existing test accounts and update their DNA scores manually

## Manual Score Update (Alternative)

If test users aren't available, manually update an existing test account:

```sql
-- Update a test account to specific tier
UPDATE public.mysoul_dna_scores
SET 
  score = 75,  -- RARE tier
  rarity_tier = 'RARE',
  trait_rarity_raw_score = 75,
  profile_depth_raw_score = 75,
  behavioral_raw_score = 75,
  content_raw_score = 75,
  cultural_raw_score = 75,
  last_calculated_at = NOW()
WHERE user_id = 'your_test_user_id';
```

## Summary

**Problem:** QA can only see COMMON tier because new accounts have seed state (score = 0).

**Solution:** Use pre-seeded test users with calculated scores across all tiers.

**Test Users:** 15 test users covering all tiers and boundary cases.

**Visual Specs:** Defined in `RARITY_CONFIG` in `src/hooks/useDNAScore.ts`.

**Next Steps:**
1. Run seed migration to create test users
2. Create Clerk accounts for test users (or use existing accounts)
3. Log in as each test user and verify visuals
4. Document any visual discrepancies
