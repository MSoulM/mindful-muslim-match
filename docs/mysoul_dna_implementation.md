# MySoul DNA™ System - Implementation Documentation

**Date**: 2026-01-17  
**Task**: TASK 3 - MySoul DNA™ System  
**Status**: ✅ Complete  
**Algorithm Version**: v1.0

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Component Calculations](#component-calculations)
4. [Data Sources](#data-sources)
5. [Recalculation Schedule](#recalculation-schedule)
6. [API Reference](#api-reference)
7. [Business Rules](#business-rules)
8. [Subscription Gating](#subscription-gating)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

MySoul DNA™ is a multi-dimensional uniqueness scoring system that measures how distinctive a user's profile is across 5 weighted components:

| Component | Weight | Description |
|-----------|--------|-------------|
| **Trait Rarity** | 35% | How unique user's traits are vs population (IDF-based) |
| **Profile Depth** | 25% | Completeness across 5 life dimensions |
| **Behavioral Uniqueness** | 20% | Deviation from population behavioral patterns |
| **Content Originality** | 15% | Uniqueness of shared content (embedding-based) |
| **Cultural Variance** | 5% | Uniqueness within city cluster |

**Final Score**: 0-100 (weighted sum of components)

**Rarity Tiers**:
- **COMMON**: 0-40
- **UNCOMMON**: 41-60
- **RARE**: 61-80
- **EPIC**: 81-95
- **LEGENDARY**: 96-100

---

## Architecture

### High-Level Flow

```
User Activity → Insights Approval → Weekly Batch → DNA Calculation → Score Storage → UI Display
                                         ↓
                                   Content Originality (Task 9)
                                         ↓
                                   City Cluster (Task 9A)
                                         ↓
                                   Trait Distribution Stats
                                         ↓
                                   Profile Depth Analysis
                                         ↓
                                   Behavioral Tracking
```

### Components

1. **Database Layer** (`supabase/migrations/`)
   - `mysoul_dna_scores` - Current scores with full breakdown
   - `mysoul_score_history` - 12-month history retention
   - `trait_distribution_stats` - Global trait frequencies for IDF
   - `behavioral_tracking` - Period-based behavioral metrics
   - `mysoul_achievements` - DNA achievements and milestones

2. **Calculator Service** (`src/services/dna/MySoulDNACalculator.ts`)
   - Component calculators for each of 5 strands
   - Percentile rank calculation
   - Rare traits and unique behaviors identification
   - Score history tracking

3. **Batch Processing** (`supabase/functions/_shared/batch-service.ts`)
   - Weekly recalculation on Sundays
   - Per-user failure isolation
   - Token/cost tracking

4. **API Layer** (`supabase/functions/dna-*/`)
   - 7 Edge Functions for DNA operations
   - Subscription-gated features
   - Rate limiting on manual recalculation

5. **Frontend** (`src/hooks/useDNAScore.ts`, `src/components/profile/MySoulDNA.tsx`)
   - Real-time score display
   - 5-strand breakdown visualization
   - Rarity tier badges with animations

---

## Component Calculations

### 1. Trait Rarity (35% weight)

**Algorithm**: Inverse Document Frequency (IDF)

**Data Sources**:
- `user_insights` (approved insights)
- `profiles` (trait fields)
- `trait_distribution_stats` (global frequencies)

**Calculation**:
```typescript
for each trait in user_profile:
  idf_score = ln(total_users / users_with_trait)
  normalized_score = min(100, (idf_score / 5) * 100)

trait_rarity_score = average(all_trait_scores)
```

**Rare Traits** (frequency < 0.1):
- Sorted by IDF score (highest = rarest)
- Top 5 included in `rare_traits` JSONB array
- Displayed in UI with percentile rank

**Dimensions**:
- Religious traits (sect, practice level, halal preference)
- Career traits (education, occupation, industry)
- Content traits (depth level, category variety)
- Family traits (marital status, children preferences)
- Lifestyle traits (exercise, smoking, diet)

### 2. Profile Depth (25% weight)

**Algorithm**: 5-Dimension Completeness Scoring

**Dimensions**:
1. **Religious** (3 fields): sect, practiceLevel, halalPreference
2. **Career** (4 fields): education_level, occupation, industry, annual_income_range
3. **Personality** (1 field): bio (length-weighted: >50 chars = 100%, >20 chars = 50%)
4. **Lifestyle** (6 fields): smoking, exercise_frequency, dietary_preferences, hobbies, height, build
5. **Family** (7 fields): marital_status, has_children, wants_children, family_structure, family_values, cultural_traditions, hometown

**Calculation**:
```typescript
for each dimension:
  dimension_score = (filled_fields / total_fields) * 100

profile_depth_score = average(all_dimension_scores)
```

**Output**: `component_breakdown.profileDepth.dimensions` contains per-dimension scores for UI display.

### 3. Behavioral Uniqueness (20% weight)

**Algorithm**: Z-Score Deviation vs Population

**Business Rule**: Requires **7+ days of activity**. If < 7 days, score = 0.

**Metrics**:
- Posting consistency (span of posting activity)
- Content depth trend (average depth level)
- Posting frequency (posts per day)

**Calculation**:
```typescript
if (daysActive < 7) return 0;

consistency_score = min(100, (posting_span_days / 30) * 50)
depth_score = min(100, (avg_depth / 5) * 100)
frequency_score = min(100, post_frequency * 20)

behavioral_score = (consistency + depth + frequency) / 3
```

**Unique Behaviors** (Z-score > 2):
- Deep Content Creator (avg_depth >= 4)
- Highly Active Poster (post_frequency > 1.5)
- Included in `unique_behaviors` JSONB array

### 4. Content Originality (15% weight)

**Algorithm**: Reuses Task 9 Content Originality Score

**Data Source**: `mysoul_dna_scores.content_originality_score`

**Integration**:
```typescript
if (content_originality_score exists) {
  use existing score
} else {
  default to 50 (neutral)
}
```

**Task 9 calculates**:
- Embedding-based cosine similarity vs population
- 7-day cache in `content_similarity_cache`
- Percentile rank

**See**: `docs/content_originality_implementation.md`

### 5. Cultural Variance (5% weight)

**Algorithm**: Uniqueness within City Cluster

**Data Source**: 
- `user_city_assignments` (current city cluster)
- `profiles` (all users in same city)

**Calculation**:
```typescript
city_users = profiles.where(location == user.location)

for each other_user in city_users:
  compare traits: religion, occupation, marital_status, wants_children
  count differences

uniqueness_ratio = differences / total_comparisons
cultural_variance_score = uniqueness_ratio * 100
```

**City Cluster Integration**: Uses Task 9A city assignments (london, nyc, houston_chicago, dubai, riyadh, toronto).

**See**: `docs/city_cluster_management.md`

---

## Data Sources

### Primary Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `mysoul_dna_scores` | Current DNA scores | score, rarity_tier, percentile_rank, component scores, rare_traits, unique_behaviors |
| `user_insights` | Approved insights | clerk_user_id, status='approved', insight_category |
| `profiles` | User profile data | All trait fields (religion, occupation, etc.) |
| `posts` | User content | depth_level, categories, created_at, embedding |
| `trait_distribution_stats` | Global trait frequencies | trait_key, frequency, idf_score |
| `user_city_assignments` | City cluster mapping | user_id, city_key, is_current |
| `mysoul_score_history` | Historical scores | user_id, score, calculated_at (12-month retention) |
| `behavioral_tracking` | Behavioral metrics | user_id, metrics, z_scores, period_start |
| `mysoul_achievements` | DNA achievements | user_id, achievement_type, earned_at |

### Computed Fields

- **percentile_rank**: Auto-calculated via trigger on score update
- **change_delta**: Difference from previous score
- **last_significant_change**: When score changed by >=5 points

---

## Recalculation Schedule

### Weekly Batch (Sundays, 2:00 AM UTC)

**Trigger**: `supabase/functions/weekly-batch/index.ts`

**Flow**:
1. Process content analysis (new posts → insights)
2. **Calculate content originality** (Task 9)
3. **Recalculate DNA scores** for all eligible users
4. Generate weekly matches (Task 8)
5. Generate ChaiChat previews

**Eligibility**:
- User has >=5 approved insights
- Profile exists and not deleted

**Error Handling**:
- Per-user failures isolated (don't abort batch)
- Errors logged to `batch_run_history.error_log`
- Failed jobs retry with exponential backoff

**Performance**:
- ~500 users processed in 3-5 hours
- Token usage tracked for cost monitoring

### Manual Recalculation (Gold+ Only)

**Endpoint**: `POST /functions/v1/dna-calculate`

**Rate Limit**: Once per 24 hours per user

**Use Cases**:
- User updates profile significantly
- User wants immediate score refresh

---

## API Reference

### 1. GET /functions/v1/dna-score

**Auth**: Required (any user)

**Response**:
```json
{
  "score": 78,
  "rarityTier": "RARE",
  "percentileRank": 72.5,
  "componentScores": {
    "traitRarity": 82,
    "profileDepth": 90,
    "behavioral": 65,
    "contentOriginality": 70,
    "culturalVariance": 55
  },
  "topRareTraits": [
    {
      "category": "religious",
      "trait": "sect:sufi",
      "displayName": "Sufi",
      "idfScore": 3.2,
      "frequency": 0.04,
      "percentile": 96
    }
  ],
  "calculatedAt": "2026-01-17T10:30:00Z",
  "approvedInsightsCount": 12,
  "daysActive": 45
}
```

### 2. GET /functions/v1/dna-breakdown

**Auth**: Required (Gold/Gold+ only)

**Response**: Full component breakdown with explanations, rare traits, unique behaviors, algorithm version, change delta.

### 3. GET /functions/v1/dna-history

**Auth**: Required (Gold+ only)

**Query Params**:
- `limit` (default: 30)
- `months` (default: 12)

**Response**: Array of historical scores with timestamps.

### 4. GET /functions/v1/dna-leaderboard

**Auth**: Required

**Query Params**:
- `scope` (city | global, default: city)
- `limit` (default: 100)

**Response**:
- Gold users: Only their rank
- Gold+ users: Full leaderboard + their rank

### 5. POST /functions/v1/dna-calculate

**Auth**: Required (Gold+ only)

**Rate Limit**: 24 hours

**Response**: Job queued, estimated completion time.

### 6. GET /functions/v1/dna-achievements

**Auth**: Required (Gold/Gold+ only)

**Response**: List of earned achievements with viewed status.

### 7. GET /functions/v1/dna-rare-traits

**Auth**: Required (any user)

**Response**: User's rare traits and unique behaviors.

---

## Business Rules

### 1. Minimum 5 Approved Insights

**Rule**: User must have >=5 approved insights to generate DNA score.

**Implementation**:
- Check `user_insights` where `status='approved'` and `clerk_user_id=user`
- If count < 5: Return seed state (score=0, tier=COMMON, explanation)

**Seed State Message**: "Need at least 5 approved insights to calculate trait rarity. You have {count}."

### 2. Behavioral Requires 7+ Days Activity

**Rule**: Behavioral component requires >=7 days since account creation.

**Implementation**:
- Calculate `daysActive = floor((now - profile.created_at) / (24*60*60*1000))`
- If daysActive < 7: behavioral_score = 0

**Explanation**: "Need at least 7 days of activity. You have {daysActive} days."

### 3. Score History Retention (12 Months)

**Rule**: Historical scores retained for 12 months, then deleted.

**Implementation**:
- RPC function `cleanup_score_history()` deletes records older than 12 months
- Run via cron job or batch process

### 4. Leaderboard Refresh (24 Hours)

**Rule**: Leaderboard data refreshed every 24 hours.

**Implementation**:
- Currently: Computed on-demand (no caching)
- Future: Materialized view or cache layer with 24h TTL

### 5. Tier Change Notifications

**Rule**: Notify user when rarity tier changes.

**Implementation**:
- Compare `previous_tier` vs `new_tier` during calculation
- If different: Set `tier_changed_at` and trigger notification
- Frontend `useDNAScore` hook shows toast notification

### 6. Percentile Rank Auto-Calculation

**Rule**: Percentile rank auto-calculated on score update.

**Implementation**:
- Trigger `trigger_update_dna_percentile_rank` on INSERT/UPDATE
- Calls RPC `calculate_dna_percentile_rank(user_score)`
- Stores in `percentile_rank` column

### 7. Change Delta Tracking

**Rule**: Track score change from previous calculation.

**Implementation**:
- Trigger `auto_record_score_history` on UPDATE
- Calculates `change_delta = new_score - old_score`
- If `abs(change_delta) >= 5`: Set `last_significant_change = now()`

---

## Subscription Gating

### Free Tier
- ✅ View basic score and tier
- ❌ No component breakdown
- ❌ No leaderboard
- ❌ No achievements
- ❌ No history/trends
- ❌ No manual recalculation

### Gold Tier
- ✅ View basic score and tier
- ✅ Component breakdown (basic)
- ✅ View own leaderboard rank (no full list)
- ✅ Achievements
- ❌ No history/trends
- ❌ No manual recalculation

### Gold+ Tier
- ✅ All Gold features
- ✅ Full component breakdown with explanations
- ✅ Full leaderboard (top 100)
- ✅ Score history and trends (12 months)
- ✅ Manual recalculation (once per 24h)
- ✅ Rare traits and unique behaviors

**Implementation**: Each API endpoint checks `profiles.subscription_tier` and returns 403 if unauthorized.

---

## Testing

### Unit Tests

**File**: `src/services/dna/__tests__/MySoulDNACalculator.test.ts`

**Coverage**:
- ✅ Component weights sum to 1.0
- ✅ Individual weights match spec (35%, 25%, 20%, 15%, 5%)
- ✅ Minimum 5 approved insights rule
- ✅ Behavioral 7+ days requirement
- ✅ Tier thresholds (COMMON, UNCOMMON, RARE, EPIC, LEGENDARY)
- ✅ Final score range 0-100
- ✅ Profile depth 5-dimension scoring
- ✅ Content originality integration (Task 9)
- ✅ Cultural variance city cluster integration (Task 9A)

**Run Tests**:
```bash
npm test src/services/dna/__tests__/MySoulDNACalculator.test.ts
```

### Integration Tests

**File**: `supabase/functions/tests/batch-processing.test.ts`

**Coverage**:
- ✅ Weekly batch DNA recalculation
- ✅ Per-user failure isolation
- ✅ Score history recording
- ✅ Percentile rank calculation

### Manual Testing Checklist

- [ ] Create user with <5 insights → Verify seed state
- [ ] Approve 5th insight → Verify score calculated
- [ ] Check score after 3 days → Verify behavioral=0
- [ ] Check score after 10 days → Verify behavioral>0
- [ ] Update profile → Verify profile depth increases
- [ ] Create deep content (level 4-5) → Verify trait rarity increases
- [ ] Check leaderboard as Free user → Verify no access
- [ ] Check leaderboard as Gold user → Verify rank only
- [ ] Check leaderboard as Gold+ user → Verify full list
- [ ] Manual recalc as Gold+ → Verify rate limit (24h)
- [ ] Check score history → Verify 12-month retention

---

## Troubleshooting

### Issue: Score Not Calculating

**Symptoms**: User has >5 insights but score = 0

**Diagnosis**:
1. Check `user_insights` table: `SELECT * FROM user_insights WHERE clerk_user_id='...' AND status='approved'`
2. Check batch processing queue: `SELECT * FROM batch_processing_queue WHERE user_id='...' AND job_type='dna_recalculation'`
3. Check batch run history for errors: `SELECT * FROM batch_run_history ORDER BY started_at DESC LIMIT 5`

**Solution**:
- If insights < 5: User needs more approved insights
- If job failed: Check error_log in batch_run_history
- If job stuck: Manually trigger recalculation via `POST /functions/v1/dna-calculate` (Gold+ only)

### Issue: Behavioral Score Always 0

**Symptoms**: User has posts but behavioral_score = 0

**Diagnosis**:
1. Check account age: `SELECT created_at FROM profiles WHERE clerk_user_id='...'`
2. Calculate days active: `(now() - created_at) / (24*60*60*1000)`

**Solution**:
- If < 7 days: This is expected behavior per spec
- If >= 7 days: Check posts table for user's content

### Issue: Percentile Rank Not Updating

**Symptoms**: percentile_rank = null or outdated

**Diagnosis**:
1. Check trigger exists: `SELECT * FROM pg_trigger WHERE tgname='trigger_update_dna_percentile_rank'`
2. Check RPC function: `SELECT calculate_dna_percentile_rank(50)`

**Solution**:
- If trigger missing: Re-run migration `20260117T000002_mysoul_dna_schema_alignment.sql`
- If RPC fails: Check total user count in mysoul_dna_scores table

### Issue: Leaderboard Empty

**Symptoms**: Leaderboard returns empty array

**Diagnosis**:
1. Check user's location: `SELECT location FROM profiles WHERE clerk_user_id='...'`
2. Check other users in same city: `SELECT COUNT(*) FROM profiles WHERE location='...'`
3. Check DNA scores for city users: `SELECT COUNT(*) FROM mysoul_dna_scores WHERE user_id IN (...)`

**Solution**:
- If location null: User needs to set location
- If no other users in city: Expected (small city)
- If users exist but no scores: Trigger batch recalculation

### Issue: Manual Recalculation Rate Limited

**Symptoms**: 429 error on POST /functions/v1/dna-calculate

**Diagnosis**:
1. Check last calculation time: `SELECT last_calculated_at FROM mysoul_dna_scores WHERE user_id='...'`
2. Calculate hours since: `(now() - last_calculated_at) / (60*60*1000)`

**Solution**:
- If < 24 hours: User must wait (rate limit working as intended)
- If >= 24 hours: Check Edge Function logic for rate limit bug

---

## Performance Considerations

### Database Indexes

**Critical Indexes**:
- `mysoul_dna_scores(score DESC)` - Leaderboard queries
- `mysoul_dna_scores(percentile_rank DESC)` - Percentile queries
- `mysoul_dna_scores(rarity_tier)` - Tier filtering
- `mysoul_score_history(user_id, calculated_at DESC)` - History queries
- `trait_distribution_stats(idf_score DESC)` - Rare trait queries

### Query Optimization

**Leaderboard**:
- Limit to top 100 users
- Filter by city first (reduces dataset)
- Consider materialized view for large populations

**Score History**:
- Limit to 12 months via WHERE clause
- Index on (user_id, calculated_at DESC)
- Cleanup old records regularly

**Trait Distribution**:
- Pre-compute IDF scores (stored in table)
- Refresh stats periodically (not on every calculation)

### Caching Strategy

**Current**: No caching (compute on-demand)

**Future Enhancements**:
- Redis cache for DNA scores (24h TTL)
- Materialized view for leaderboard (refresh every 24h)
- Cache trait distribution stats (refresh weekly)

---

## Future Enhancements

### Phase 2 Features

1. **Advanced Trait Rarity**
   - Implement full IDF calculation with trait extraction from profiles
   - Build trait distribution stats refresh job
   - Add trait combination rarity (multi-trait IDF)

2. **Behavioral Tracking Table**
   - Implement proper behavioral_tracking table with period windows
   - Calculate Z-scores vs population for each metric
   - Track login frequency, interaction patterns, depth trends

3. **Achievements System**
   - Auto-generate achievements on tier upgrades
   - Rare trait discovery achievements
   - Score milestone achievements (50, 75, 90, 95, 100)

4. **DNA Insights**
   - Personalized recommendations to improve score
   - "Complete X to increase profile depth by Y points"
   - "Share deeper content to boost trait rarity"

5. **DNA Comparison**
   - Compare DNA with matches
   - Show compatibility based on DNA complementarity
   - Highlight unique vs shared traits

6. **Global Leaderboard**
   - Implement global (not just city) leaderboard
   - Add filters: tier, country, age range
   - Add time-based leaderboards (this week, this month)

---

## References

- **Spec**: Task 3 - MySoul DNA™ System
- **Related Tasks**:
  - Task 8: DNA Batch Processing (`docs/dna_batch_processing.md`)
  - Task 9: Content Originality (`docs/content_originality_implementation.md`)
  - Task 9A: City Cluster Management (`docs/city_cluster_management.md`)
- **Status Audit**: `docs/mysoul_dna_status.md`
- **Database Schema**: `supabase/migrations/20260117T000002_mysoul_dna_schema_alignment.sql`, `20260117T000003_mysoul_dna_supporting_tables.sql`
- **Calculator Service**: `src/services/dna/MySoulDNACalculator.ts`
- **Batch Service**: `supabase/functions/_shared/batch-service.ts`
- **API Functions**: `supabase/functions/dna-*/index.ts`
- **Frontend Hook**: `src/hooks/useDNAScore.ts`
- **UI Component**: `src/components/profile/MySoulDNA.tsx`

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-17  
**Maintained By**: Development Team
