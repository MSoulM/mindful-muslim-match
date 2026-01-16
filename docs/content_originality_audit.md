# Content Originality System - Repository Audit

**Date:** 2026-01-16  
**Task:** TASK 9 - Content Originality System Implementation  
**Auditor:** System Analysis

---

## Executive Summary

This audit examines the existing MatchMe v2.0 MVP codebase to identify what infrastructure exists for TASK 9 (Content Originality System) and what needs to be added. The goal is to minimize new code and leverage existing Task 8 batch processing infrastructure.

---

## 1. EXISTING INFRASTRUCTURE

### 1.1 Database Tables

#### ✅ EXISTS: `posts` table (serves as "shared_content")
**Migrations:** 
- `20251204T000000_create_posts_table.sql`
- `20260116T000004_extend_posts_for_batch_processing.sql`

**Current Schema:**
- `id uuid`
- `clerk_user_id text` 
- `caption text`
- `media_urls text[]`
- `categories text[]`
- `depth_level integer`
- `embedding vector(1536)` ✅ **PERFECT FOR TASK 9**
- `content_hash text`
- `processing_status varchar(20)`
- `processed_at timestamptz`
- `analysis_result jsonb`
- `is_visible boolean`
- `deleted_at timestamptz`

**Indexes:**
- ✅ `idx_posts_embedding` - ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
- ✅ `idx_posts_clerk_user_id`
- ✅ `idx_posts_deleted_at` WHERE deleted_at IS NULL

**Status:** **READY TO USE**. The spec mentions `shared_content` table, but the repo uses `posts` table which serves the same purpose. We will use `posts` table throughout.

#### ✅ EXISTS: `mysoul_dna_scores` table
**Migration:** `20251224T000001_add_dna_content_cultural_scores.sql`

**Current Schema:**
- `user_id text` (unique)
- `score integer` (0-100)
- `rarity_tier text`
- `trait_uniqueness_score integer`
- `profile_completeness_score integer`
- `behavior_score integer`
- `content_score integer` (0-15) ⚠️ **SIMPLE FORMULA, NOT ORIGINALITY**
- `cultural_score integer` (0-5)
- `approved_insights_count integer`
- `last_calculated_at timestamptz`

**MISSING COLUMNS (TASK 9 Requirements):**
- ❌ `content_originality_score integer` (0-100)
- ❌ `content_originality_percentile decimal(5,2)`
- ❌ `content_originality_calculated_at timestamptz`

**Note:** Current `content_score` is calculated as `postCount * 2` (max 15). TASK 9 requires a separate `content_originality_score` (0-100) based on embedding similarity.

#### ✅ EXISTS: `batch_processing_queue` table
**Migration:** `20260116T000001_create_batch_processing_queue.sql`

Supports job types:
- `content_analysis` ✅
- `embedding_update` ✅
- `dna_recalculation` ✅
- `match_generation` ✅

**Can Reuse:** Queue system is perfect for originality batch processing.

#### ✅ EXISTS: `batch_run_history` table
**Migration:** `20260116T000002_create_batch_run_history.sql`

Tracks batch execution metrics, errors, tokens, cost.

---

### 1.2 Embedding Generation Service

#### ✅ EXISTS: `generateEmbedding()` in `batch-service.ts`
**Location:** `supabase/functions/_shared/batch-service.ts:286-305`

```typescript
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'text-embedding-ada-002',
      input: text
    })
  });
  const data = await response.json();
  return data.data[0].embedding;
}
```

**Status:** ✅ **READY TO USE**  
**Note:** TASK 9 spec requires `text-embedding-3-small` but repo uses `text-embedding-ada-002` (1536 dimensions). We will **upgrade to text-embedding-3-small** which is cheaper and better (still 1536 dimensions).

---

### 1.3 Weekly Batch Processing Orchestration

#### ✅ EXISTS: `weekly-batch` Edge Function
**Location:** `supabase/functions/weekly-batch/index.ts`

**Current Phases:**
1. Phase 1: Content Analysis (~2 hours)
2. Phase 2: Embedding Updates (~1 hour)
3. Phase 3: DNA Recalculation (~30 minutes)
4. Phase 4: Weekly Match Generation (~1 hour)
5. Phase 5: ChaiChat Previews (~30 minutes)

**Scheduled:** Sunday 2 AM UTC via pg_cron

**Status:** ✅ **CAN INTEGRATE**. We will add Phase 2.5 (Originality Calculation) after embeddings but before DNA recalculation.

---

### 1.4 DNA Calculation Logic

#### ✅ EXISTS: `processDNARecalculation()` in `batch-service.ts`
**Location:** `supabase/functions/_shared/batch-service.ts:223-284`

**Current Formula:**
```typescript
const contentScore = Math.min(100, postCount * 2);
const totalScore = Math.round(
  traitUniquenessScore * 0.35 +
  profileCompletenessScore * 0.25 +
  behaviorScore * 0.20 +
  contentScore * 0.15 +  // ⚠️ Simple, not originality-based
  culturalScore * 0.05
);
```

**TASK 9 Requirement:**  
The spec says "Originality contributes 15% to overall DNA rarity". Currently `contentScore` (0-15) contributes 15% but is NOT originality-based.

**DECISION:** We will introduce `content_originality_score` (0-100) as a separate metric and keep the existing `content_score` formula. During DNA aggregation, we will replace `contentScore * 0.15` with `contentOriginalityScore * 0.15` when originality data exists.

---

## 2. MISSING INFRASTRUCTURE (MUST ADD)

### 2.1 Database Objects

#### ❌ MISSING: `content_similarity_cache` table
Required fields:
- `user_id uuid` (unique, refs profiles)
- `avg_similarity_to_population decimal(5,4)`
- `min_similarity decimal(5,4)`
- `max_similarity decimal(5,4)`
- `content_count integer`
- `originality_score integer`
- `calculated_at timestamptz`
- `valid_until timestamptz`

**Purpose:** Cache similarity calculations to avoid recomputing when no new content.

#### ❌ MISSING: `calculate_originality_percentiles()` RPC function
**Purpose:** Compute percentile rank for all users using window function after batch originality calculation.

#### ❌ MISSING: Originality columns in `mysoul_dna_scores`
- `content_originality_score integer` (0-100)
- `content_originality_percentile decimal(5,2)`
- `content_originality_calculated_at timestamptz`
- Index: `idx_dna_originality ON mysoul_dna_scores(content_originality_score DESC)`

---

### 2.2 Services & Logic

#### ❌ MISSING: Originality Calculator Service
**Required:** `src/services/originality/calculator.ts`
- `calculateOriginality(userId)` - compute score from embeddings
- Logic: Load user embeddings, sample population, compute avg cosine similarity, convert to 0-100 score
- Cache results in `content_similarity_cache`

#### ❌ MISSING: Embedding Integration Service
**Required:** `src/services/originality/embeddings.ts`
- `generateContentEmbedding(content)` - wrapper for OpenAI embeddings
- `storeContentEmbedding(contentId, embedding)` - update posts.embedding
- Integration with Task 5 "Share Something" flow

#### ❌ MISSING: Batch Integration Step
**Required:** Add Phase 2.5 in `weekly-batch/index.ts`
- `processOriginalityBatch()` function
- Loop through users with content embeddings
- Calculate originality scores
- Update `mysoul_dna_scores` and cache
- Call percentile RPC

---

### 2.3 API & UI

#### ❌ MISSING: Originality API Endpoint
**Required:** `GET /api/dna/originality`
Returns: `{ score, percentile, label, last_calculated_at }`

#### ❌ MISSING: UI Display
**Required:** Update MySoul DNA card (if exists) to show originality metric with label and tooltip.

---

### 2.4 Testing

#### ❌ MISSING: Originality Tests
- Users with <3 content pieces => default score 50
- Cache reuse behavior
- Percentile calculation
- Batch processing error handling

---

## 3. MIGRATION STRATEGY (MINIMAL DISRUPTION)

### Phase 1: Database Extensions (Single Migration)
Create `supabase/migrations/20260116T000006_content_originality.sql`:
1. Add columns to `mysoul_dna_scores`:
   - `content_originality_score INTEGER DEFAULT 50`
   - `content_originality_percentile DECIMAL(5,2)`
   - `content_originality_calculated_at TIMESTAMPTZ`
2. Create `content_similarity_cache` table
3. Create `calculate_originality_percentiles()` RPC function
4. Add index on `content_originality_score`

**Note:** `posts.embedding` column already exists, no changes needed.

### Phase 2: Service Layer
Create two new service files:
1. `src/services/originality/embeddings.ts` - embedding generation
2. `src/services/originality/calculator.ts` - originality scoring

### Phase 3: Batch Integration
Modify existing files:
1. `supabase/functions/_shared/batch-service.ts` - add `processOriginalityBatch()`
2. `supabase/functions/weekly-batch/index.ts` - add Phase 2.5
3. Update `processDNARecalculation()` to use `content_originality_score` if available

### Phase 4: API & UI
1. Create API endpoint (likely Edge Function or modify existing DNA endpoint)
2. Update UI to display originality metric

### Phase 5: Testing & Documentation
1. Add tests
2. Create `docs/content_originality_implementation.md`

---

## 4. KEY DECISIONS & CLARIFICATIONS

### 4.1 Table Naming: `posts` vs `shared_content`
**Decision:** Use existing `posts` table throughout.  
**Rationale:** Spec mentions `shared_content` but repo uses `posts` with identical structure and already has embeddings infrastructure.

### 4.2 Embedding Model: ada-002 vs 3-small
**Decision:** Upgrade to `text-embedding-3-small` in TASK 9 implementation.  
**Rationale:** Cheaper, faster, better quality. Same 1536 dimensions so compatible with existing pgvector indexes.

### 4.3 Content Score vs Originality Score
**Current:** `content_score` (0-15) = simple `postCount * 2`  
**TASK 9:** `content_originality_score` (0-100) = embedding-based uniqueness  
**Decision:** Keep both. Use `content_originality_score * 0.15` in DNA aggregation when available, fallback to old formula otherwise.

### 4.4 Minimum Data Threshold
**Spec:** Minimum 3 content pieces required; otherwise score = 50.  
**Implementation:** Check `content_count >= 3` in calculator, return 50 if insufficient.

### 4.5 Deleted Content Handling
**Strategy:** When `posts.deleted_at` is set, invalidate cache by setting `content_similarity_cache.valid_until = now()` for that user. Next batch recalculates.

### 4.6 Performance Limits
**Population Sample:** Cap at 1000 random posts (excludes user's own)  
**User Embeddings:** Use latest 10 posts per user (if more exist)  
**Rationale:** Avoid O(n*m) explosion with large datasets.

---

## 5. IMPLEMENTATION CHECKLIST

- [ ] **Phase 1:** Migration `20260116T000006_content_originality.sql`
  - [ ] Add originality columns to `mysoul_dna_scores`
  - [ ] Create `content_similarity_cache` table
  - [ ] Create `calculate_originality_percentiles()` RPC
  - [ ] Add indexes
  - [ ] Set RLS policies

- [ ] **Phase 2:** Service Layer
  - [ ] `src/services/originality/embeddings.ts`
  - [ ] `src/services/originality/calculator.ts`
  - [ ] Upgrade embedding model to `text-embedding-3-small`

- [ ] **Phase 3:** Batch Integration
  - [ ] Add `processOriginalityBatch()` to `batch-service.ts`
  - [ ] Add Phase 2.5 to `weekly-batch/index.ts`
  - [ ] Update `processDNARecalculation()` to use originality score

- [ ] **Phase 4:** API & UI
  - [ ] Create originality API endpoint
  - [ ] Update DNA UI card with originality display

- [ ] **Phase 5:** Testing & Docs
  - [ ] Add unit tests for calculator
  - [ ] Add integration tests for batch processing
  - [ ] Create `docs/content_originality_implementation.md`

---

## 6. RISK ASSESSMENT

### Low Risk ✅
- Database schema extensions (additive, no breaking changes)
- Embedding infrastructure already exists
- Batch processing framework is solid

### Medium Risk ⚠️
- Performance of similarity calculations (mitigated by sampling limits)
- Cache invalidation logic (must handle edge cases)

### High Risk ❌
- None identified

---

## 7. ESTIMATED EFFORT

| Phase | Description | Complexity | Files |
|-------|-------------|------------|-------|
| Phase 1 | Database Migration | Low | 1 migration file |
| Phase 2 | Service Layer | Medium | 2 service files |
| Phase 3 | Batch Integration | Medium | 2 existing files modified |
| Phase 4 | API & UI | Low | 1-2 files |
| Phase 5 | Testing & Docs | Medium | Multiple test files + docs |

**Total:** ~8-10 new/modified files

---

## 8. NEXT STEPS

1. ✅ **COMPLETED:** Audit documentation
2. **PROCEED TO:** Phase 1 - Create database migration
3. **THEN:** Phase 2 - Implement service layer
4. **THEN:** Phase 3 - Integrate into batch processing
5. **THEN:** Phase 4 - Build API & UI
6. **FINALLY:** Phase 5 - Testing & documentation

---

**Audit Completed:** 2026-01-16  
**Ready to Proceed:** ✅ YES
