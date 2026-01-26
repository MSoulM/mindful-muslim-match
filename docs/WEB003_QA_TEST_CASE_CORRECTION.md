# WEB-003: QA Test Case Correction - DNA Score for New Accounts

## Issue Summary

QA test case expects: **"Every time I create an account, the DNA scoring is automatically completed."**

**This expectation contradicts the approved MySoul DNA business rules.**

## Correct Behavior Per Business Rules

### Prerequisites for DNA Score Calculation

Per `TASK_03_BUSINESS_LOGIC_FOR_ADEE` and `TASK_03_MYSOUL_DNA_SYSTEM_FOR_M`:

1. **Minimum 5 approved insights required** to generate a DNA score
2. **7+ days of activity** required for behavioral tracking component
3. **Weekly batch processing** on Sundays for score recalculation

### What Actually Happens for New Accounts

When a new account is created, the system:

1. **Creates a seed state** (not a calculated score):
   - `final_score = 0`
   - `rarity_tier = 'COMMON'`
   - All component scores = 0
   - Explanations indicate prerequisites not met

2. **Does NOT calculate a real DNA score** until:
   - User has ≥ 5 approved insights
   - User has ≥ 7 days of activity
   - Weekly batch process runs (or manual calculation is triggered)

### Seed State vs Calculated Score

**Seed State (New Users):**
```json
{
  "finalScore": 0,
  "rarityTier": "COMMON",
  "componentScores": {
    "traitRarity": 0,
    "profileDepth": 0,
    "behavioral": 0,
    "contentOriginality": 0,
    "culturalVariance": 0
  },
  "componentBreakdown": {
    "traitRarity": {
      "explanation": "Need at least 5 approved insights to calculate trait rarity. You have 0."
    },
    "behavioral": {
      "explanation": "Need at least 7 days of activity. You have 0 days."
    }
  }
}
```

**Calculated Score (After Prerequisites Met):**
```json
{
  "finalScore": 45,  // Example: actual calculated value
  "rarityTier": "UNCOMMON",
  "componentScores": {
    "traitRarity": 60,
    "profileDepth": 50,
    "behavioral": 40,
    "contentOriginality": 30,
    "culturalVariance": 20
  }
}
```

## Corrected Test Cases

### Test Case 1: New Account Seed State (Correct Behavior)

**Preconditions:**
- Fresh account created
- No approved insights
- < 7 days of activity

**Expected Result:**
- DNA score record exists with:
  - `final_score = 0`
  - `rarity_tier = 'COMMON'`
  - All component raw scores = 0
  - Explanations indicate prerequisites not met

**Verification:**
```sql
SELECT 
  score AS final_score,
  rarity_tier,
  trait_rarity_raw_score,
  profile_depth_raw_score,
  behavioral_raw_score,
  content_raw_score,
  cultural_raw_score,
  approved_insights_count,
  days_active
FROM mysoul_dna_scores
WHERE user_id = 'new_user_id';
```

**Expected Output:**
```
final_score: 0
rarity_tier: COMMON
trait_rarity_raw_score: 0
profile_depth_raw_score: 0
behavioral_raw_score: 0
content_raw_score: 0
cultural_raw_score: 0
approved_insights_count: 0
days_active: 0
```

### Test Case 2: Tier Boundary Validation (After Prerequisites Met)

**Preconditions:**
- User has ≥ 5 approved insights
- User has ≥ 7 days of activity
- DNA score has been calculated (via batch or manual trigger)

**Test Steps:**
1. Verify tier boundaries using calculated scores:
   - Score 0-40 → `rarity_tier = 'COMMON'`
   - Score 41-60 → `rarity_tier = 'UNCOMMON'`
   - Score 61-80 → `rarity_tier = 'RARE'`
   - Score 81-95 → `rarity_tier = 'EPIC'`
   - Score 96-100 → `rarity_tier = 'LEGENDARY'`

**Verification Query:**
```sql
SELECT 
  score AS final_score,
  rarity_tier,
  CASE 
    WHEN score BETWEEN 0 AND 40 THEN 'COMMON'
    WHEN score BETWEEN 41 AND 60 THEN 'UNCOMMON'
    WHEN score BETWEEN 61 AND 80 THEN 'RARE'
    WHEN score BETWEEN 81 AND 95 THEN 'EPIC'
    WHEN score BETWEEN 96 AND 100 THEN 'LEGENDARY'
  END AS expected_tier,
  CASE 
    WHEN rarity_tier = CASE 
      WHEN score BETWEEN 0 AND 40 THEN 'COMMON'
      WHEN score BETWEEN 41 AND 60 THEN 'UNCOMMON'
      WHEN score BETWEEN 61 AND 80 THEN 'RARE'
      WHEN score BETWEEN 81 AND 95 THEN 'EPIC'
      WHEN score BETWEEN 96 AND 100 THEN 'LEGENDARY'
    END THEN '✓ PASS'
    ELSE '✗ FAIL'
  END AS tier_validation
FROM mysoul_dna_scores
WHERE score > 0  -- Only test calculated scores, not seed states
ORDER BY score;
```

### Test Case 3: Prerequisites Gate Validation

**Test: Minimum Insights Requirement**

**Preconditions:**
- User has < 5 approved insights
- User has ≥ 7 days of activity

**Expected Result:**
- DNA score remains in seed state (score = 0, tier = COMMON)
- Component breakdown explanations indicate missing insights

**Verification:**
```sql
SELECT 
  score,
  rarity_tier,
  approved_insights_count,
  component_breakdown->'traitRarity'->>'explanation' AS trait_explanation
FROM mysoul_dna_scores
WHERE user_id = 'test_user_id'
  AND approved_insights_count < 5;
```

**Expected Output:**
```
score: 0
rarity_tier: COMMON
approved_insights_count: 3
trait_explanation: "Need at least 5 approved insights to calculate trait rarity. You have 3."
```

**Test: Minimum Days Requirement**

**Preconditions:**
- User has ≥ 5 approved insights
- User has < 7 days of activity

**Expected Result:**
- DNA score calculated BUT behavioral component = 0
- Behavioral explanation indicates insufficient days

**Verification:**
```sql
SELECT 
  score,
  behavioral_raw_score,
  days_active,
  component_breakdown->'behavioral'->>'explanation' AS behavioral_explanation
FROM mysoul_dna_scores
WHERE user_id = 'test_user_id'
  AND days_active < 7
  AND approved_insights_count >= 5;
```

**Expected Output:**
```
score: [calculated value > 0]
behavioral_raw_score: 0
days_active: 3
behavioral_explanation: "Need at least 7 days of activity. You have 3 days."
```

## How to Set Up Test Data

### Option A: Wait for Natural Prerequisites (Realistic)

1. Create test account
2. Approve 5+ insights manually
3. Wait 7+ days OR manually adjust `created_at` timestamp in database
4. Trigger calculation via:
   - Weekly batch (Sunday 2 AM UTC)
   - Manual API call: `POST /functions/v1/dna-calculate`
   - Or use `useDNAScore().recalculateScore()` in UI

### Option B: Seed Test Data (Fast Testing)

```sql
-- 1. Create test user with prerequisites met
INSERT INTO profiles (clerk_user_id, created_at)
VALUES ('test_user_123', NOW() - INTERVAL '10 days');

-- 2. Create 5 approved insights
INSERT INTO user_insights (clerk_user_id, insight_category, title, description, status)
SELECT 
  'test_user_123',
  'values',
  'Test Insight ' || generate_series,
  'Test description',
  'approved'
FROM generate_series(1, 5);

-- 3. Trigger calculation (or wait for batch)
-- Calculation will now proceed because prerequisites are met
```

### Option C: Direct Database Insert (Tier Boundary Testing Only)

If testing ONLY tier boundaries (not full calculation flow):

```sql
-- Insert test scores directly to verify tier mapping
INSERT INTO mysoul_dna_scores (user_id, score, rarity_tier, ...)
VALUES 
  ('test_40', 40, 'COMMON', ...),
  ('test_41', 41, 'UNCOMMON', ...),
  ('test_60', 60, 'UNCOMMON', ...),
  ('test_61', 61, 'RARE', ...),
  ('test_80', 80, 'RARE', ...),
  ('test_81', 81, 'EPIC', ...),
  ('test_95', 95, 'EPIC', ...),
  ('test_96', 96, 'LEGENDARY', ...),
  ('test_100', 100, 'LEGENDARY', ...);
```

## Updated Test Case Template

### Test: DNA Score Creation for New Account

**Test ID:** `DNA-001`

**Description:** Verify that new accounts receive a seed state, not a calculated score.

**Preconditions:**
- Fresh account (no insights, < 7 days old)

**Test Steps:**
1. Create new account
2. Query DNA score record
3. Verify seed state values

**Expected Results:**
- ✅ DNA score record exists
- ✅ `final_score = 0`
- ✅ `rarity_tier = 'COMMON'`
- ✅ All component scores = 0
- ✅ `approved_insights_count < 5`
- ✅ `days_active < 7`
- ✅ Component breakdown contains prerequisite messages

**Actual Results:** [QA fills in]

**Status:** [PASS/FAIL]

---

### Test: DNA Score Calculation After Prerequisites Met

**Test ID:** `DNA-002`

**Description:** Verify that DNA score is calculated once prerequisites are met.

**Preconditions:**
- Account with ≥ 5 approved insights
- Account with ≥ 7 days of activity
- Calculation triggered (batch or manual)

**Test Steps:**
1. Ensure prerequisites are met
2. Trigger calculation
3. Query DNA score record
4. Verify calculated values

**Expected Results:**
- ✅ `final_score > 0` (actual calculated value)
- ✅ `rarity_tier` matches score range
- ✅ Component scores are calculated (not all 0)
- ✅ Tier boundaries are correct:
  - 0-40 → COMMON
  - 41-60 → UNCOMMON
  - 61-80 → RARE
  - 81-95 → EPIC
  - 96-100 → LEGENDARY

**Actual Results:** [QA fills in]

**Status:** [PASS/FAIL]

---

### Test: Tier Boundary Validation

**Test ID:** `DNA-003`

**Description:** Verify tier boundaries are correctly applied to calculated scores.

**Preconditions:**
- Multiple users with calculated DNA scores across different ranges

**Test Steps:**
1. Query users with scores at boundary values (40, 41, 60, 61, 80, 81, 95, 96)
2. Verify `rarity_tier` matches expected tier for each score

**Expected Results:**
- ✅ Score 40 → COMMON
- ✅ Score 41 → UNCOMMON
- ✅ Score 60 → UNCOMMON
- ✅ Score 61 → RARE
- ✅ Score 80 → RARE
- ✅ Score 81 → EPIC
- ✅ Score 95 → EPIC
- ✅ Score 96 → LEGENDARY
- ✅ Score 100 → LEGENDARY

**Actual Results:** [QA fills in]

**Status:** [PASS/FAIL]

## Implementation Details

### When Seed State is Created

The seed state is automatically created when:

1. **Profile is created** → `useProfile.createProfile()` calls `recalculateScore()`
2. **DNA score hook loads** → `useDNAScore()` fetches, and if no record exists, calls `calculateAndSaveScore()`
3. **Calculation runs** → If `approvedInsightsCount < 5`, returns seed state and saves it

### Database Record for New Users

When a new account is created, a DNA score record IS created in the database with:

```sql
INSERT INTO mysoul_dna_scores (
  user_id,
  score,                    -- 0
  rarity_tier,              -- 'COMMON'
  trait_rarity_raw_score,   -- 0
  profile_depth_raw_score,  -- 0
  behavioral_raw_score,     -- 0
  content_raw_score,        -- 0
  cultural_raw_score,       -- 0
  approved_insights_count,  -- 0
  days_active,              -- 0
  component_breakdown      -- JSON with prerequisite messages
)
```

**This is correct behavior** - the record exists, but it's a seed state, not a calculated score.

### UI Behavior

When a new user views their DNA score:
- They see `score: 0` and `rarityTier: 'COMMON'`
- Component breakdown shows messages like:
  - "Need at least 5 approved insights to calculate trait rarity. You have 0."
  - "Need at least 7 days of activity. You have 0 days."

This is the expected UI state for new accounts.

## Summary

**The test case expectation is incorrect.** New accounts should NOT automatically have **calculated** DNA scores. They receive a **seed state** (score = 0, tier = COMMON) until prerequisites are met.

**Corrected expectation:**
- ✅ New accounts get seed state immediately (record exists, score = 0)
- ✅ Calculated scores appear after prerequisites met (score > 0, actual calculation)
- ✅ Tier boundaries are validated on calculated scores, not seed states
- ✅ UI shows appropriate messages explaining prerequisites

**Key Distinction:**
- **Seed State** = Record exists, but score is 0 (prerequisites not met)
- **Calculated Score** = Record exists, score > 0 (prerequisites met, actual calculation)

**Next Steps:**
1. Update QA test cases to match business rules
2. Use seed state validation for new accounts (verify score = 0, tier = COMMON)
3. Use tier boundary validation for calculated scores (verify tier matches score range)
4. Document prerequisite gates in test cases
5. Clarify that "DNA scoring is automatically completed" means "seed state is created", not "score is calculated"
