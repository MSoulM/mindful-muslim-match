# DNA Batch Processing System - Repository Audit

**Date:** 2026-01-16  
**Task:** TASK 8 - DNA Batch Processing Implementation  
**Auditor:** System Analysis

---

## Executive Summary

This audit identifies existing database schema, services, and infrastructure in the MatchMe v2.0 MVP that relates to TASK 8: DNA Batch Processing. The goal is to minimize new code and leverage existing systems wherever possible.

---

## 1. EXISTING INFRASTRUCTURE

### 1.1 Database Tables (Relevant to Batch Processing)

#### ✅ EXISTS: `user_insights` table
**Migration:** `20251225T000001_create_user_insights_table.sql`
- Stores AI-generated insights about users
- Fields: `id`, `clerk_user_id`, `insight_category`, `title`, `description`, `source_quote`, `confidence_score`, `status` (pending/approved/rejected), `contributes_to_dna`, `dna_weight`, `reviewed_at`, `created_at`, `expires_at`, `updated_at`
- Indexes: clerk_user_id, status, expires_at, contributes_to_dna
- RLS enabled with user-specific policies
- **STATUS:** Full approval/rejection flow exists via Edge Functions

#### ✅ EXISTS: `mysoul_dna_scores` table
**Migrations:** `20251223001406_*.sql`, `20251224T000001_add_dna_content_cultural_scores.sql`
- Stores MySoul DNA scores per user
- Fields: `id`, `user_id`, `score`, `rarity_tier`, `trait_uniqueness_score`, `profile_completeness_score`, `behavior_score`, `content_score`, `cultural_score`, `approved_insights_count`, `last_calculated_at`, `created_at`, `updated_at`
- **STATUS:** DNA scoring schema exists; calculation logic present in frontend (`useDNAScore.ts`)

#### ✅ EXISTS: `posts` table
**Migration:** `20251204T000000_create_posts_table.sql`
- User-generated content with DNA categories
- Fields: `id`, `clerk_user_id`, `caption`, `media_urls`, `categories`, `depth_level`, engagement metrics, moderation flags, timestamps
- Has full-text search capability
- **NOTE:** No `is_shared_content` column exists; only referenced in TypeScript hooks

#### ✅ EXISTS: `voice_introductions` table
**Migration:** `20251223112201_*.sql`
- Voice content with processing status
- Fields include: `processing_status` ('processing', 'completed', 'failed'), `transcription`, `personality_markers`
- **STATUS:** Processing status workflow exists

#### ✅ EXISTS: `match_preferences` table
**Migration:** `20251130T000003_create_match_preferences_table.sql`
- User matching preferences (age, distance, education, religiosity, etc.)
- **STATUS:** Preference schema exists but NO match generation logic found

#### ✅ EXISTS: `mmagent_conversation_memory` table
**Migration:** `20250101T000001_create_mmagent_tables.sql`
- pgvector enabled (vector(1536))
- Uses OpenAI text-embedding-ada-002
- Cosine similarity search via ivfflat index
- **STATUS:** Embeddings infrastructure exists for conversation memory

#### ✅ EXISTS: `gamification_progress` table
**Migration:** `20251225T000002_*.sql`
- Tracks user engagement and streaks
- Trigger exists to update on insight approval: `trigger_update_gamification_on_review`
- **STATUS:** Gamification tied to insight approval flow

### 1.2 Edge Functions

#### ✅ EXISTS: Insights Processing Functions
- `insights-pending/index.ts` - Get pending insights for user
- `insights-approve/index.ts` - Approve insight, set status='approved', contributes_to_dna=true
- `insights-reject/index.ts` - Reject insight
- `insights-approved/index.ts` - Get approved insights
- **AUTH:** Uses Clerk JWT (extracts userId from token.sub)
- **DB ACCESS:** Uses Supabase service role key

#### ✅ EXISTS: Token Governance Functions
- `governance-tokens/index.ts`, `governance-cost/index.ts`
- Token tracking infrastructure via `_shared/token-governance-service.ts`
- **STATUS:** Cost tracking patterns exist

#### ✅ EXISTS: Admin Functions
- `admin-governance-alerts/index.ts`
- `admin-governance-cost/index.ts`
- `admin-governance-rules/index.ts`
- `admin-mmagent-*/index.ts` (3 functions)
- **AUTH:** Uses demo admin mode (sessionStorage check in frontend)
- **NOTE:** No server-side admin role verification found

#### ✅ EXISTS: MMAgent Service with Embeddings
**File:** `supabase/functions/_shared/mmagent-service.ts`
- OpenAI embedding generation using `text-embedding-ada-002`
- Stores/retrieves conversation pairs with pgvector
- Rate limiting and retry logic patterns exist
- **STATUS:** Can reuse embedding generation patterns

### 1.3 Frontend Services

#### ✅ EXISTS: Insights API Service
**File:** `src/services/api/insights.ts`
- Full API client for insights CRUD
- Types defined: `UserInsight`, `GamificationProgress`, `Badge`
- **STATUS:** Frontend integration complete

#### ✅ EXISTS: DNA Score Calculation Logic
**File:** `src/hooks/useDNAScore.ts`
- References `mysoul_dna_scores` table
- Calculates DNA scores from posts, insights, profile completeness
- **STATUS:** Frontend-only calculation; needs backend equivalent

#### ✅ EXISTS: Match Context (Mock)
**File:** `src/context/MatchesContext.tsx`
- Mock match generation with hardcoded data
- Type: `Match` interface with compatibility score, chaiChat status
- **STATUS:** No real backend match generation

#### ✅ EXISTS: Admin Check Hook
**File:** `src/hooks/useAdminCheck.ts`
- Demo admin mode using sessionStorage
- **WARNING:** Client-side only; no server-side admin verification
- **STATUS:** Need proper admin role enforcement in Edge Functions

---

## 2. MISSING COMPONENTS (GAPS vs TASK 8 SPEC)

### ❌ MISSING: `batch_processing_queue` table
**Required for:** Job queueing, priority management, retry logic
- No existing queue table found
- **ACTION:** Create migration

### ❌ MISSING: `batch_run_history` table
**Required for:** Tracking weekly runs, token costs, error logs
- No batch run tracking found
- **ACTION:** Create migration

### ❌ MISSING: `weekly_matches` table
**Required for:** Storing top 5 weekly matches per user
- No match results storage found (only mock frontend data)
- **ACTION:** Create migration

### ❌ MISSING: `shared_content` table
**Required for:** Content analysis with deduplication (content_hash)
- Posts table exists but no `shared_content` table
- TypeScript references `is_shared_content` flag but not in schema
- **ACTION:** Clarify if posts table should be extended OR create shared_content table

### ❌ MISSING: Edge Function `weekly-batch`
**Required for:** Orchestrating batch jobs
- No existing batch processing function
- **ACTION:** Create new edge function

### ❌ MISSING: Content Analysis Implementation
**Required for:** Processing shared content, dedup, LLM analysis
- No content analysis function found
- **ACTION:** Implement processContentAnalysis job handler

### ❌ MISSING: DNA Recalculation Backend
**Required for:** Recalculating DNA scores from approved insights
- Frontend calculation exists but no backend equivalent
- **ACTION:** Implement processDNARecalculation job handler

### ❌ MISSING: Match Generation Backend
**Required for:** Vector similarity + compatibility scoring
- No backend match generation found
- **ACTION:** Implement generateWeeklyMatches with pgvector similarity

### ❌ MISSING: ChaiChat Preview Generation
**Required for:** Level 1-2 conversation starters
- No ChaiChat preview generation found
- **ACTION:** Implement preview generation with matches

### ❌ MISSING: Batch API Endpoints
**Required for:** Admin triggers, status checks, history
- No `/api/batch/*` endpoints found
- **ACTION:** Create 5 new edge functions for batch APIs

### ❌ MISSING: pg_cron Schedule
**Required for:** Sunday 2-7 AM UTC trigger
- No cron jobs found in migrations
- **ACTION:** Add pg_cron extension + schedule OR use external scheduler

### ❌ MISSING: Server-side Admin Auth
**Required for:** Protecting admin-only endpoints
- Only client-side demo admin check exists
- **ACTION:** Implement admin role verification in edge functions

---

## 3. EMBEDDINGS & VECTOR SEARCH STATUS

### ✅ READY: pgvector Infrastructure
- Extension enabled in `mmagent_conversation_memory` table
- ivfflat index configured for cosine similarity
- OpenAI text-embedding-ada-002 integration working
- **REUSABLE:** Can use same patterns for content/user embeddings

### ⚠️ PARTIAL: Embedding Generation for Matching
- Conversation memory embeddings work
- No embeddings for posts/content/user profiles for matching
- **ACTION:** Extend embedding generation to content + user vectors

---

## 4. AUTHENTICATION & AUTHORIZATION

### ✅ PATTERN: Clerk JWT Extraction
- All existing edge functions extract userId from JWT: `token.split('.')[1]`
- Parse `payload.sub` for clerk_user_id
- **REUSABLE:** Use same pattern in batch functions

### ⚠️ SECURITY GAP: No Admin Role Verification
- Frontend uses sessionStorage demo mode
- Backend has no admin role checks
- **BLOCKER:** Admin-only batch endpoints need proper auth
- **ACTION:** Implement has_admin_role() check in edge functions (hardcoded admin list OR user_roles table)

---

## 5. TOKEN GOVERNANCE & COST TRACKING

### ✅ EXISTS: Token Tracking Infrastructure
- Tables: Token governance tables exist (`20250102T000001_token_governance_tables.sql`)
- Service: `_shared/token-governance-service.ts`
- **REUSABLE:** Track tokens_used and api_cost_cents in batch_run_history using existing service

---

## 6. SCHEDULER OPTIONS

### Option A: Supabase pg_cron (Recommended)
**Status:** Not currently used but standard for Supabase
- Add migration to enable pg_cron extension
- Schedule: `0 2 * * 0` (Sunday 2 AM UTC)
- Trigger: Call edge function via HTTP request OR direct function
- **PRO:** Native to Supabase, reliable
- **CON:** Requires pg_cron setup

### Option B: External Cron (GitHub Actions, Vercel Cron)
**Status:** No existing external scheduler detected
- Use external service to POST to edge function
- **PRO:** Easier to test/debug
- **CON:** Additional dependency

**RECOMMENDATION:** Use pg_cron for production consistency

---

## 7. MINIMAL CHANGES STRATEGY

### Reuse Existing Patterns
1. **Edge Function Structure:** Copy `insights-approve/index.ts` structure for new batch functions
2. **JWT Auth:** Reuse Clerk token extraction pattern from all existing functions
3. **Supabase Client:** Use same service role key pattern
4. **Embedding Generation:** Reuse mmagent-service.ts OpenAI embedding logic
5. **Error Handling:** Follow existing try-catch patterns with CORS headers
6. **Token Tracking:** Integrate token-governance-service.ts

### Extend Existing Tables
1. **user_insights:** Already has all fields needed; no changes required
2. **mysoul_dna_scores:** Add `batch_run_id` foreign key (optional) for tracking which batch updated scores
3. **posts:** Consider adding `content_hash` field for deduplication OR create separate shared_content table

### New Tables (Minimal)
1. **batch_processing_queue** - Core job queue
2. **batch_run_history** - Run tracking
3. **weekly_matches** - Match results storage

### New Edge Functions (Required)
1. **weekly-batch** - Main orchestrator
2. **batch-trigger** - POST /api/batch/trigger (admin)
3. **batch-status** - GET /api/batch/status
4. **batch-history** - GET /api/batch/history (admin)
5. **batch-queue** - GET /api/batch/queue/:userId
6. **batch-retry** - POST /api/batch/retry/:jobId (admin)

---

## 8. RISK ASSESSMENT

### HIGH RISK
- **Admin Auth:** No server-side admin verification - MUST implement before admin endpoints
- **Embedding Scale:** No existing embeddings for posts/users - could be expensive first run
- **Match Algorithm:** No existing compatibility logic - needs design/implementation

### MEDIUM RISK
- **Content Dedup:** No content_hash implementation - could duplicate insights
- **Rate Limiting:** LLM API calls at scale - need proper delays (100ms spec)
- **Transaction Safety:** Multiple table updates per job - need proper error handling

### LOW RISK
- **Supabase Integration:** Strong existing patterns to follow
- **Queue Logic:** Standard FIFO with priority and retry
- **Token Tracking:** Infrastructure ready

---

## 9. IMPLEMENTATION ORDER (RECOMMENDED)

### Phase 1: Foundation (Migrations)
1. Create `batch_processing_queue` table
2. Create `batch_run_history` table
3. Create `weekly_matches` table
4. Add `content_hash` to posts OR create `shared_content` table
5. Enable pg_cron extension
6. Add admin role verification (hardcoded list or user_roles table)

### Phase 2: Core Batch Engine
7. Create `weekly-batch` edge function shell
8. Implement queue insertion logic
9. Implement retry/failure handling
10. Test queue state transitions

### Phase 3: Job Handlers
11. Implement `processContentAnalysis` (dedup + LLM)
12. Implement `processDNARecalculation` (backend version of useDNAScore logic)
13. Implement `generateWeeklyMatches` (pgvector similarity + compatibility)
14. Implement ChaiChat preview generation

### Phase 4: API Layer
15. Create batch-trigger endpoint
16. Create batch-status endpoint
17. Create batch-history endpoint
18. Create batch-queue endpoint
19. Create batch-retry endpoint

### Phase 5: Scheduler & Testing
20. Add pg_cron job to call weekly-batch
21. Add unit tests for queue logic
22. Add integration tests for end-to-end flow
23. Add admin auth tests

### Phase 6: Documentation
24. Create `docs/dna_batch_processing.md`

---

## 10. KEY DECISIONS NEEDED

### Decision 1: Shared Content Storage
**Options:**
- A) Extend `posts` table with `content_hash`, `processing_status`, `processed_at`
- B) Create separate `shared_content` table
**Recommendation:** Option A (extend posts) - simpler, posts already have categories/depth

### Decision 2: Admin Auth Implementation
**Options:**
- A) Hardcoded admin user IDs list in env var (quick, demo-safe)
- B) Create `user_roles` table with proper RLS (production-ready)
**Recommendation:** Option A for MVP, document upgrade path to B

### Decision 3: Match Algorithm Complexity
**Options:**
- A) Simple vector similarity only (fast, MVP)
- B) Multi-factor compatibility (vector + preferences + DNA scores)
**Recommendation:** Option B - spec requires "compatibility logic", use match_preferences table

### Decision 4: Embedding Storage
**Options:**
- A) Add embedding columns to existing tables (posts, profiles)
- B) Create separate embeddings table
**Recommendation:** Option A - simpler queries, fewer joins

---

## 11. COST ESTIMATION (First Run)

### Assumptions
- 1,000 users
- Average 10 posts per user = 10,000 posts
- Each post generates 2-3 insights = 25,000 insight generations

### Estimated Costs
- **Content Analysis:** 25,000 jobs × 300 tokens avg × $0.15/1M tokens = $1.13
- **Embeddings:** 10,000 posts × $0.13/1M tokens (ada-002) = $0.13
- **DNA Recalc:** 1,000 jobs (no LLM cost, compute only)
- **Match Generation:** 10% complex cases × 1,000 users × Claude pricing = ~$5
- **ChaiChat Previews:** 5,000 previews × 100 tokens × $0.15/1M = $0.08
- **TOTAL FIRST RUN:** ~$6.34

### Weekly Ongoing (Incremental)
- Assume 20% new content weekly = ~$1.30/week

---

## 12. SUCCESS METRICS BASELINE

### Current State (No Batch Processing)
- Insight generation: Manual/on-demand only
- DNA score updates: Frontend calculation only
- Match generation: Mock data only
- Content dedup: None

### Target State (After TASK 8)
- Weekly batch completion: <5 hours ✅
- Failed jobs: <0.5% ✅
- Token cost tracking: Per-run ✅
- Admin controls: Trigger, retry, monitor ✅

---

## APPENDIX A: DATABASE SCHEMA SUMMARY

### Tables Summary (20+ tables total)

**Core Auth & Profile:**
- profiles
- islamic_preferences
- cultural_profile
- personality_assessment

**DNA System:**
- dna_questionnaires
- dna_answers
- mysoul_dna_scores ✅
- user_insights ✅

**Content & Media:**
- posts ✅
- profile_photos
- voice_introductions

**Matching:**
- match_preferences ✅
- (weekly_matches - TO CREATE)

**Messaging:**
- messaging tables (not detailed in audit)

**Gamification:**
- gamification_progress
- streak_rewards
- streak_history

**MMAgent:**
- mmagent_sessions
- mmagent_messages
- mmagent_conversation_memory (pgvector) ✅
- mmagent_personality_admin

**Governance:**
- token_governance tables

**Batch Processing:**
- (batch_processing_queue - TO CREATE)
- (batch_run_history - TO CREATE)

---

## APPENDIX B: FILE STRUCTURE

### Supabase Functions (26 total)
- `_shared/` - 6 shared services
- `admin-*` - 5 admin functions
- `insights-*` - 4 insight functions ✅
- `mmagent-*` - 4 agent functions
- `gamification-*` - 2 functions
- `governance-*` - 2 functions
- `streaks-*` - 2 functions
- Other - 7 functions (clerk-webhook, photo-upload, voice-upload, realtime-chat)

### Migrations (22 total)
- Dating from 2025-11-23 to 2026-01-02
- Well-organized with timestamps

---

## CONCLUSION

**AUDIT STATUS:** COMPLETE ✅

The repository has a solid foundation for batch processing with existing insights, DNA scoring, and pgvector infrastructure. Main gaps are:
1. Queue/history tables
2. Batch orchestration edge function
3. Backend job handlers (content analysis, DNA recalc, match generation)
4. Admin-only API endpoints
5. Scheduler (pg_cron)

**Estimated Implementation:** 6 migrations + 6 edge functions + tests + docs

**Next Step:** Proceed with Phase 1 (Migrations)
