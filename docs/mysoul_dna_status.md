# MySoul DNA™ System - Status Audit Report

**Date**: 2026-01-17  
**Task**: TASK 3 - MySoul DNA™ System Verification & Completion  
**Status**: Gap Analysis Complete

---

## Executive Summary

This audit examines the existing MySoul DNA™ implementation against the official spec to identify what exists, what's missing, and what needs to be fixed. The goal is to **minimize changes** and only implement what's missing or incorrect.

**Overall Assessment**: 🟡 **PARTIAL IMPLEMENTATION** (60% complete)
- Core scoring exists but uses simplified calculations
- Database schema is 70% complete
- Batch processing integrated but calculator needs alignment
- UI components exist but missing some features
- No dedicated API endpoints (only hooks)
- Tests are minimal

---

## A) DATABASE / MIGRATIONS

### ✅ EXISTS: `mysoul_dna_scores` table
**Migrations**: 
- `20251223001406_*.sql` (initial table)
- `20251224T000001_add_dna_content_cultural_scores.sql` (5 strands)
- `20260116T000006_content_originality.sql` (originality columns)

**Current Schema**:
```sql
- id, user_id (UNIQUE), score (0-100), rarity_tier
- trait_uniqueness_score, profile_completeness_score, behavior_score
- content_score, cultural_score
- approved_insights_count, days_active
- previous_tier, tier_changed_at
- last_calculated_at, created_at, updated_at
- content_originality_score, content_originality_percentile, content_originality_calculated_at
```

**Indexes**:
- ✅ `idx_mysoul_dna_scores_city_rank` (score DESC, last_calculated_at DESC)
- ✅ `idx_dna_originality` (content_originality_score DESC)
- ✅ Unique constraint on user_id
- ✅ RLS enabled with user-specific policies

**GAPS**:
- ❌ Missing `percentile_rank` column (spec requires 0-100 percentile vs population)
- ❌ Missing `component_breakdown` JSONB column (for UI breakdown data)
- ❌ Missing `rare_traits` JSONB column (list of rare traits found)
- ❌ Missing `unique_behaviors` JSONB column (list of unique behavioral patterns)
- ❌ Missing `algorithm_version` TEXT column (for tracking calculation changes)
- ❌ Missing `change_delta` NUMERIC column (difference from last score)
- ❌ Missing `last_significant_change` TIMESTAMP column (when score changed >5 points)
- ⚠️ `rarity_tier` values inconsistent: DB uses 'Common', spec wants 'COMMON'
- ⚠️ Component scores store weighted values (0-35, 0-25, etc.) instead of raw 0-100 scores
- ❌ Missing index on `percentile_rank DESC`
- ❌ Missing index on `rarity_tier`

### ❌ MISSING: `behavioral_tracking` table
**Spec requires**: Period-based behavioral metrics with Z-score calculation
```sql
CREATE TABLE behavioral_tracking (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  metrics JSONB NOT NULL,  -- {login_frequency, post_frequency, depth_trend, etc.}
  z_scores JSONB,           -- computed Z-scores vs population
  uniqueness_score NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, period_start)
);
```
**Current workaround**: Frontend calculates behavioral score from post patterns (simplified)

### ⚠️ PARTIAL: `profiles` table (for profile depth calculation)
**Migration**: `20251123T000000_create_profiles_table.sql`

**Current fields**: Extensive profile fields exist for 5 dimensions
- Religious: religion (JSONB with sect, practiceLevel, halalPreference)
- Career: education_level, occupation, industry, annual_income_range
- Personality: bio, personality assessment (separate table)
- Lifestyle: smoking, exercise_frequency, dietary_preferences, hobbies, height, build
- Family: marital_status, has_children, wants_children, family_structure, family_values, cultural_traditions

**GAPS**:
- ❌ No explicit tracking of which fields are filled (for dimension completion scoring)
- ❌ No materialized view or summary table for profile_depth_breakdown

### ❌ MISSING: `mysoul_score_history` table
**Spec requires**: 12-month history retention
```sql
CREATE TABLE mysoul_score_history (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  rarity_tier TEXT NOT NULL,
  component_breakdown JSONB,
  calculated_at TIMESTAMPTZ NOT NULL,
  algorithm_version TEXT,
  FOREIGN KEY (user_id) REFERENCES profiles(clerk_user_id)
);
CREATE INDEX idx_score_history_user_time ON mysoul_score_history(user_id, calculated_at DESC);
```

### ❌ MISSING: `trait_distribution_stats` table
**Spec requires**: Global trait frequencies for IDF calculation
```sql
CREATE TABLE trait_distribution_stats (
  trait_key TEXT PRIMARY KEY,
  trait_category TEXT NOT NULL,  -- 'religious', 'career', 'personality', etc.
  user_count INTEGER NOT NULL DEFAULT 0,
  total_users INTEGER NOT NULL,
  frequency NUMERIC GENERATED ALWAYS AS (user_count::numeric / NULLIF(total_users, 1)) STORED,
  last_updated TIMESTAMPTZ DEFAULT now()
);
```
**Current workaround**: Frontend uses post depth/variety as proxy for trait rarity (not true IDF)

### ❌ MISSING: `mysoul_achievements` table
**Spec mentions achievements UI**
```sql
CREATE TABLE mysoul_achievements (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  achievement_type TEXT NOT NULL,  -- 'rare_trait_discovered', 'tier_upgrade', etc.
  achievement_data JSONB,
  earned_at TIMESTAMPTZ DEFAULT now(),
  viewed BOOLEAN DEFAULT false,
  FOREIGN KEY (user_id) REFERENCES profiles(clerk_user_id)
);
```

### ⚠️ PARTIAL: Leaderboard infrastructure
**Current**: No dedicated leaderboard table or materialized view
- Frontend hook `useCityLeaderboard` queries `mysoul_dna_scores` + `profiles` on-demand
- No 24-hour refresh mechanism (computes live every time)
- **Spec expects**: Materialized view or cached leaderboard refreshed every 24 hours

### ❌ MISSING: RPC/Stored Procedures
**Spec requires**:
- `calculate_trait_idf(user_id)` - Compute trait rarity using IDF
- `calculate_percentile_rank(score)` - Return percentile rank for a score
- `refresh_trait_distribution_stats()` - Update global trait frequencies
- `cleanup_score_history()` - Delete records older than 12 months

**Current**: All calculations done in application code (TypeScript)

---

## B) SERVICES / CALCULATOR

### ⚠️ PARTIAL: MySoul DNA Calculator
**File**: `src/hooks/useDNAScore.ts` (lines 155-340)

**Current Implementation**:
- ✅ Basic calculation with 5 weighted components
- ✅ Minimum 5 approved insights rule (line 218)
- ✅ Minimum 7 days activity for behavioral (line 256)
- ✅ Tier assignment (COMMON/UNCOMMON/RARE/EPIC/LEGENDARY)
- ✅ Tier change detection and notification
- ✅ Integration with approved insights count
- ✅ Integration with days active calculation

**GAPS**:
- ❌ **Trait Rarity (35%)**: Uses simplified post depth/variety, not true IDF against global trait distribution
- ❌ **Profile Depth (25%)**: Uses post count proxy instead of 5-dimension breakdown (religious, career, personality, lifestyle, family)
- ❌ **Behavioral (20%)**: Uses simple consistency/engagement instead of Z-score deviation vs population
- ⚠️ **Content Originality (15%)**: Partially integrated via Task 9, but not used in main calculator (lines 270-280 show placeholder logic)
- ❌ **Cultural Variance (5%)**: Hardcoded to 50 or simple calculation, not using city cluster comparison
- ❌ No percentile rank calculation
- ❌ No component_breakdown JSONB output for UI
- ❌ No rare_traits list generation
- ❌ No unique_behaviors list generation
- ❌ No score history tracking
- ❌ No change_delta calculation
- ❌ No caching (Redis or simple TTL cache)

### ⚠️ PARTIAL: Batch Service DNA Recalculation
**File**: `supabase/functions/_shared/batch-service.ts` (lines 223-296)

**Current Implementation**:
```typescript
export async function processDNARecalculation(job, supabase) {
  // Simplified scoring:
  traitUniquenessScore = min(100, insightCount * 5)
  profileCompletenessScore = min(100, postCount * 3 + insightCount * 2)
  behaviorScore = min(100, avgDepth * 25)
  culturalScore = 50 (hardcoded)
  contentScoreComponent = existingDNA?.content_originality_score || min(100, postCount * 2)
  
  totalScore = traitUniquenessScore * 0.35 + ...
  
  // Tier assignment with different thresholds than spec:
  if (totalScore >= 95) rarityTier = 'Legendary'
  else if (totalScore >= 85) rarityTier = 'Ultra Rare'  // ❌ Spec says 'EPIC'
  else if (totalScore >= 70) rarityTier = 'Rare'
  else if (totalScore >= 50) rarityTier = 'Uncommon'
}
```

**GAPS**:
- ❌ Does not match spec component calculations
- ❌ Different tier thresholds (spec: EPIC 81-95, LEGENDARY 96-100)
- ❌ Stores weighted component scores instead of raw 0-100 scores
- ❌ No percentile rank calculation
- ❌ No component breakdown, rare traits, or unique behaviors
- ❌ No score history tracking
- ❌ No change delta calculation

### ❌ MISSING: Component Calculators
**Spec requires separate, testable functions**:
- `calculateTraitRarity(userId, insights, traitStats)` - IDF-based
- `calculateProfileDepth(profile)` - 5 dimensions (religious, career, personality, lifestyle, family)
- `calculateBehavioralUniqueness(userId, behavioralTracking)` - Z-scores
- `calculateContentOriginality(userId)` - Reuse Task 9 score
- `calculateCulturalVariance(userId, cityCluster, profiles)` - City cluster comparison

**Current**: All calculations inline in hooks/batch-service

### ❌ MISSING: Caching Layer
**Spec expects**: Redis or equivalent with 24h TTL
**Current**: No caching; recalculates every request

### ✅ GOOD: Content Originality Integration (Task 9)
**Files**: 
- `supabase/functions/_shared/batch-service.ts` (lines 344-527) - `calculateUserOriginality()`
- `content_similarity_cache` table exists
- Embedding-based cosine similarity with 7-day cache

**Status**: Task 9 implemented correctly; Task 3 just needs to use it

### ✅ GOOD: City Cluster Integration (Task 9A)
**Files**:
- `src/services/city/CityClusterService.ts`
- `supabase/functions/_shared/city-cluster-service.ts`
- `city_clusters`, `user_city_assignments` tables exist

**Status**: Task 9A implemented correctly; Task 3 needs to use it for cultural variance

---

## C) API ENDPOINTS

### ❌ MISSING: All dedicated DNA API endpoints
**Spec requires**:
- `GET /api/mysoul-dna/score` - Get current score with breakdown
- `POST /api/mysoul-dna/calculate` - Manual recalculation
- `GET /api/mysoul-dna/history` - Score trend (12 months)
- `GET /api/mysoul-dna/leaderboard` - City/global rankings
- `GET /api/mysoul-dna/achievements` - User achievements
- `GET /api/mysoul-dna/rare-traits` - User's rare traits list
- `GET /api/mysoul-dna/breakdown` - Full component breakdown (Gold+ gated)

**Current**: No Edge Functions for these endpoints

**Workaround**: Frontend hooks query Supabase directly
- `useDNAScore()` - Fetches from `mysoul_dna_scores` table
- `useCityLeaderboard()` - Queries profiles + scores
- No history API (not implemented)
- No achievements API (not implemented)
- No rare traits API (not implemented)

**IMPACT**: 
- ✅ Basic score display works
- ❌ No manual recalculation button
- ❌ No score history/trends
- ❌ No achievements
- ❌ No Gold+ gated features

---

## D) FRONTEND / UI

### ✅ EXISTS: Dashboard DNA Widget
**File**: `src/components/profile/MySoulDNA.tsx`
- ✅ Score display with tier badge
- ✅ Rarity tier visual treatments (color, glow, gradient)
- ✅ 5 strand breakdown (Trait Rarity 35%, Profile Depth 25%, Behavioral 20%, Content 15%, Cultural 5%)
- ✅ Animated components with Framer Motion
- ✅ Compact and full variants
- ✅ DNA helix animation
- ⚠️ Shows component scores but no per-dimension explanations

**File**: `src/pages/ProfileScreen.tsx` (lines 156-176)
- ✅ Quick stats card showing DNA score + tier

### ✅ EXISTS: Rarity Tier Badge Component
**File**: `src/components/profile/RarityBadge.tsx`
- ✅ Tier-specific colors, icons, animations
- ✅ Different sizes (sm, md, lg)
- ✅ Glow effects

### ⚠️ PARTIAL: DNA Deep Dive Screen
**File**: `src/pages/HowMySoulDNAWorksScreen.tsx`
- ✅ Educational content about DNA system
- ❌ Not a true "deep dive" with user's actual breakdown
- ❌ No strand-by-strand explanation with user data

### ⚠️ PARTIAL: Leaderboard UI
**File**: `src/hooks/useCityLeaderboard.ts`
- ✅ City leaderboard logic with subscription gating (Gold vs Gold+)
- ❌ No UI component/screen rendering the leaderboard
- ❌ No global leaderboard (only city)

### ❌ MISSING: Achievements UI
- No achievements display component
- No achievement notification/modal

### ❌ MISSING: Score History / Trends UI
- No chart showing score evolution over time
- No 12-month trend visualization

### ⚠️ PARTIAL: Gold vs Gold+ Gating
**File**: `src/utils/dnaSubscriptionFeatures.ts`
```typescript
export function getDNAFeatureAccess(tier: string) {
  return {
    canViewBasicScore: true,
    canViewBreakdown: tier !== 'free',
    canViewFullLeaderboard: tier === 'gold_plus',
    canViewTrends: tier === 'gold_plus',
    canViewAchievements: tier !== 'free',
    canManualRecalc: tier === 'gold_plus'
  };
}
```
- ✅ Gating logic exists
- ⚠️ Not fully enforced in all UI components

### ✅ EXISTS: Analytics Screens
**Files**: 
- `src/pages/DNAAnalyticsScreen.tsx` - DNA-specific analytics with radar chart
- `src/pages/AnalyticsScreen.tsx` - General analytics dashboard
- ✅ DNA evolution tracking (though not pulling from real history table)

---

## E) BUSINESS RULES

### ✅ IMPLEMENTED: Core Rules
1. ✅ **Weekly recalculation**: Integrated in batch processing (`supabase/functions/weekly-batch/index.ts`)
2. ✅ **Minimum 5 approved insights**: Enforced in `useDNAScore.ts` (line 218)
3. ✅ **Behavioral requires 7+ days activity**: Enforced in `useDNAScore.ts` (line 256)
4. ❌ **Score history retained 12 months**: No history table exists
5. ❌ **Leaderboard refreshed every 24 hours**: No refresh mechanism (computed live)

### ⚠️ PARTIAL: Tier Thresholds
**Spec**:
- COMMON: 0-40
- UNCOMMON: 41-60
- RARE: 61-80
- EPIC: 81-95
- LEGENDARY: 96-100

**Current Frontend** (`useDNAScore.ts`):
```typescript
export function getRarityTier(score: number): RarityTier {
  if (score >= 95) return 'Legendary';
  if (score >= 85) return 'Epic';
  if (score >= 70) return 'Rare';
  if (score >= 50) return 'Uncommon';
  return 'Common';
}
```
**Current Backend** (`batch-service.ts`):
```typescript
if (totalScore >= 95) rarityTier = 'Legendary';
else if (totalScore >= 85) rarityTier = 'Ultra Rare';  // ❌ Should be 'Epic'
else if (totalScore >= 70) rarityTier = 'Rare';
else if (totalScore >= 50) rarityTier = 'Uncommon';
```

**GAPS**: 
- Frontend thresholds don't match spec (EPIC starts at 85 instead of 81)
- Backend uses 'Ultra Rare' instead of 'Epic'
- Inconsistent casing ('Common' vs 'COMMON')

### ⚠️ PARTIAL: Component Weights
**Spec**: Trait Rarity 35%, Profile Depth 25%, Behavioral 20%, Content 15%, Cultural 5%

**Current**: Both frontend and backend use correct weights ✅

**BUT**: Component calculations don't match spec algorithms ❌

---

## F) TESTS

### ⚠️ MINIMAL: Test Coverage
**Existing Tests**:
1. `src/services/city/__tests__/CityClusterService.test.ts` - City cluster tests ✅
2. `src/tests/originality.test.ts` - Content originality tests ✅
3. `supabase/functions/tests/batch-processing.test.ts` - Batch processing tests ✅

**MISSING Tests**:
- ❌ MySoul DNA calculator component tests
- ❌ Weights sum to 100% test
- ❌ Final score range 0-100 test
- ❌ Tier threshold tests
- ❌ Business rule tests (<5 insights => seed state)
- ❌ Behavioral 7+ days requirement test
- ❌ Content originality integration test
- ❌ Cultural variance city cluster test
- ❌ Percentile rank calculation test
- ❌ Score history retention test
- ❌ API endpoint tests (once created)

---

## G) DOCUMENTATION

### ✅ EXISTS: Related Documentation
- `docs/dna_batch_audit.md` - Task 8 audit mentioning DNA
- `docs/dna_batch_processing.md` - Batch processing spec
- `docs/TASK_8_IMPLEMENTATION_SUMMARY.md` - Task 8 summary
- `docs/content_originality_implementation.md` - Task 9 implementation
- `docs/city_cluster_management.md` - Task 9A implementation
- `docs/ANALYTICS_SYSTEM.md` - Analytics system docs

### ❌ MISSING: MySoul DNA Specific Docs
- ❌ `docs/mysoul_dna_implementation.md` - Architecture, data sources, recalc schedule
- ❌ Component calculator documentation
- ❌ API endpoint documentation
- ❌ Business rules reference

---

## SUMMARY OF GAPS

### 🔴 CRITICAL (Must Fix)
1. **Component Calculations**: Align all 5 components to spec algorithms
2. **Tier Thresholds**: Fix to match spec (EPIC 81-95, not 85-95)
3. **Database Schema**: Add missing columns (percentile_rank, component_breakdown, rare_traits, unique_behaviors, algorithm_version, change_delta, last_significant_change)
4. **Percentile Rank**: Implement calculation and storage
5. **Component Scores**: Store raw 0-100 scores, not weighted values

### 🟡 HIGH (Should Fix)
6. **Trait Distribution Stats**: Create table and IDF calculation
7. **Score History**: Create table and tracking
8. **Behavioral Tracking**: Create proper table with Z-scores
9. **Profile Depth**: Implement 5-dimension breakdown
10. **API Endpoints**: Create 7 missing Edge Functions
11. **Leaderboard Refresh**: Implement 24-hour refresh mechanism

### 🟢 MEDIUM (Nice to Have)
12. **Achievements**: Create table and UI
13. **Rare Traits Output**: Generate and display list
14. **Unique Behaviors Output**: Generate and display list
15. **Caching**: Implement Redis or simple cache
16. **Tests**: Add comprehensive test suite
17. **Deep Dive UI**: Create detailed breakdown screen

---

## IMPLEMENTATION PLAN

### Phase 1: Database Alignment (2-3 migrations)
1. Extend `mysoul_dna_scores` with missing columns
2. Create `trait_distribution_stats` table
3. Create `mysoul_score_history` table
4. Create `behavioral_tracking` table (optional - can defer)
5. Create `mysoul_achievements` table (optional)
6. Add missing indexes
7. Create RPC functions for IDF and percentile

### Phase 2: Calculator Fix (1 service file)
1. Create `src/services/dna/MySoulDNACalculator.ts` with:
   - `calculateTraitRarity()` - IDF from trait_distribution_stats
   - `calculateProfileDepth()` - 5-dimension breakdown
   - `calculateBehavioralUniqueness()` - Z-scores (or simplified if no behavioral_tracking)
   - `calculateContentOriginality()` - Reuse Task 9
   - `calculateCulturalVariance()` - City cluster comparison
   - `calculatePercentile()` - Population percentile
   - `generateRareTraits()` - List of rare traits
   - `generateUniqueBehaviors()` - List of unique behaviors
2. Update `batch-service.ts` to use new calculator
3. Update `useDNAScore.ts` to use new calculator
4. Fix tier thresholds everywhere

### Phase 3: API Endpoints (7 Edge Functions)
1. `dna-score` - GET current score
2. `dna-calculate` - POST manual recalc
3. `dna-history` - GET score history
4. `dna-leaderboard` - GET rankings
5. `dna-achievements` - GET user achievements
6. `dna-rare-traits` - GET rare traits
7. `dna-breakdown` - GET full breakdown (Gold+ gated)

### Phase 4: UI Patches (minimal)
1. Add DNA deep dive screen (if missing)
2. Add leaderboard screen component
3. Add achievements display
4. Add score history chart (Gold+)
5. Enforce Gold+ gating on all features

### Phase 5: Tests
1. Calculator unit tests
2. Business rule tests
3. API endpoint tests
4. Integration tests

### Phase 6: Documentation
1. `docs/mysoul_dna_implementation.md`
2. Update this status doc with final state

---

## FILES TO MODIFY

### Database
- New: `supabase/migrations/20260117T000002_mysoul_dna_schema_alignment.sql`
- New: `supabase/migrations/20260117T000003_mysoul_dna_supporting_tables.sql`

### Services
- New: `src/services/dna/MySoulDNACalculator.ts`
- New: `src/services/dna/types.ts`
- Modify: `supabase/functions/_shared/batch-service.ts` (lines 223-296)
- Modify: `src/hooks/useDNAScore.ts` (lines 155-340, tier thresholds)

### APIs
- New: `supabase/functions/dna-score/index.ts`
- New: `supabase/functions/dna-calculate/index.ts`
- New: `supabase/functions/dna-history/index.ts`
- New: `supabase/functions/dna-leaderboard/index.ts`
- New: `supabase/functions/dna-achievements/index.ts`
- New: `supabase/functions/dna-rare-traits/index.ts`
- New: `supabase/functions/dna-breakdown/index.ts`

### UI
- New: `src/pages/dna/DNADeepDiveScreen.tsx` (if needed)
- New: `src/pages/dna/DNALeaderboardScreen.tsx` (if needed)
- New: `src/components/dna/DNAAchievements.tsx` (if needed)
- New: `src/components/dna/DNAHistoryChart.tsx` (if needed)
- Modify: `src/components/profile/MySoulDNA.tsx` (add explanations)

### Tests
- New: `src/services/dna/__tests__/MySoulDNACalculator.test.ts`
- New: `src/services/dna/__tests__/BusinessRules.test.ts`
- New: `supabase/functions/tests/dna-endpoints.test.ts`

### Documentation
- This file: `docs/mysoul_dna_status.md` ✅
- New: `docs/mysoul_dna_implementation.md`

---

## ESTIMATED EFFORT

- **Phase 1** (DB): 2-3 hours
- **Phase 2** (Calculator): 4-5 hours
- **Phase 3** (APIs): 3-4 hours
- **Phase 4** (UI): 2-3 hours
- **Phase 5** (Tests): 3-4 hours
- **Phase 6** (Docs): 1 hour

**Total**: ~15-20 hours of development

---

## NEXT STEPS

1. ✅ Create this status document
2. Implement Phase 1 (Database migrations)
3. Implement Phase 2 (Calculator service)
4. Implement Phase 3 (API endpoints)
5. Implement Phase 4 (UI patches)
6. Implement Phase 5 (Tests)
7. Implement Phase 6 (Final documentation)

---

**Report Created**: 2026-01-17  
**Next Review**: After Phase 2 completion
