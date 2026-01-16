# MMAgent Personality Admin - Repository Audit

## Date: 2025-01-02

## Executive Summary

This audit examines the existing codebase to identify what exists vs. what needs to be implemented for TASK 7B: MMAgent Personality Admin. The feature must allow admins to control MMAgent behavior (prompts, tone, cultural variants) without code deploys.

---

## 1. EXISTING IMPLEMENTATION

### 1.1 Personality System
**Status: ✅ EXISTS**

- **Database Table**: `personality_assessments` (migration: `20251203T000004_create_personality_assessment_tables.sql`)
  - Stores personality_type as: `'wise_aunty'`, `'modern_scholar'`, `'spiritual_guide'`, `'cultural_bridge'`
  - Maps to internal types: `amina`, `zara`, `amir`, `noor` (in `mmagent-service.ts`)

- **Mapping Function**: `getPersonalityType()` in `supabase/functions/_shared/mmagent-service.ts`
  ```typescript
  const mapping: Record<string, PersonalityType> = {
    'wise_aunty': 'amina',
    'cultural_bridge': 'zara',
    'modern_scholar': 'amir',
    'spiritual_guide': 'noor'
  };
  ```

- **Personality Prompts**: Hardcoded in `getPersonalityPrompt()` function
  - Located: `supabase/functions/_shared/mmagent-service.ts:193-202`
  - Currently static strings, not database-driven

### 1.2 System Prompt Construction
**Status: ✅ EXISTS (but hardcoded)**

- **Function**: `getSystemPrompt()` in `supabase/functions/_shared/mmagent-service.ts:204-232`
- **Components**:
  - Base prompt (static)
  - Personality prompt (from `getPersonalityPrompt()`)
  - Scope enforcement (static)
  - Token mode prompt (static)
- **Usage**: Called in `mmagent-handler.ts:131` during message handling
- **Issue**: All prompts are hardcoded; no database integration

### 1.3 Cultural Profiles
**Status: ✅ EXISTS (partial)**

- **Database Table**: `cultural_profiles` (migration: `20251203T000005_create_cultural_profile_tables.sql`)
  - Stores `primary_background`: `'south_asian'`, `'arab'`, `'western_convert'`, `'african'`, `'southeast_asian'`, `'other'`
- **Gap**: No cultural variant overlays for prompts; no A/B testing support

### 1.4 Admin Infrastructure
**Status: ⚠️ PARTIAL**

- **Admin Check Hook**: `src/hooks/useAdminCheck.ts`
  - Currently demo-only (sessionStorage-based)
  - Needs production implementation with Supabase RLS/roles

- **Admin Routes**: 
  - `/admin/analytics` → `AdminAnalyticsScreen.tsx`
  - `/admin/governance` → `AdminGovernanceScreen.tsx`
  - Pattern: Admin Edge Functions in `supabase/functions/admin-*`

- **Admin Functions Pattern**:
  - Use service role key for Supabase client
  - CORS headers included
  - Example: `supabase/functions/admin-governance-alerts/index.ts`

### 1.5 Caching
**Status: ✅ EXISTS (client-side only)**

- **Client Cache**: `src/services/CacheManager.ts`
  - In-memory + localStorage
  - TTL-based expiration
  - Pattern invalidation
- **Gap**: No server-side caching for Edge Functions (prompts need server-side cache)

---

## 2. MISSING COMPONENTS

### 2.1 Database Tables
**Status: ❌ MISSING**

1. **mmagent_prompts**
   - Version-controlled prompt storage
   - Draft vs. live separation
   - Tone parameters (JSONB)
   - Token counting
   - Unique constraint: one active per personality

2. **cultural_variants**
   - Regional prompt overlays
   - Expression libraries
   - A/B test variants with weights
   - Active/inactive toggle

3. **prompt_test_history**
   - Test runs before activation
   - Admin ratings (1-5)
   - Response time tracking
   - Token usage per test

### 2.2 Runtime Integration
**Status: ❌ MISSING**

- `getSystemPrompt()` must load from `mmagent_prompts` table
- Apply tone parameters from JSONB
- Load cultural variants based on user's `cultural_profiles.primary_background`
- A/B variant selection (deterministic per user_id)
- Template variable substitution (`{{userName}}`, `{{age}}`, etc.)
- Server-side caching with invalidation on activate/rollback

### 2.3 Admin Services
**Status: ❌ MISSING**

- `src/services/admin/PersonalityAdminService.ts`
  - `getActivePrompt(personalityKey)`
  - `saveDraft(...)` with token counting (max 2000)
  - `activatePrompt(promptId, adminId)` with cache invalidation
  - `rollback(personalityKey, targetVersion)`
  - `testPrompt(promptId, testInput)` → stores in `prompt_test_history`

### 2.4 Admin API Routes
**Status: ❌ MISSING**

Need Supabase Edge Functions:
- `GET /functions/v1/admin-mmagent-prompts?personality_key=...`
- `POST /functions/v1/admin-mmagent-prompts/draft`
- `POST /functions/v1/admin-mmagent-prompts/:id/activate`
- `POST /functions/v1/admin-mmagent-prompts/:personality_key/rollback`
- `GET /functions/v1/admin-mmagent-prompts/:personality_key/versions`
- `POST /functions/v1/admin-mmagent-prompts/:id/test`
- CRUD for `/functions/v1/admin-mmagent-cultural-variants`

### 2.5 Admin UI
**Status: ❌ MISSING**

- New page: `/admin/mmagent-personality` or similar
- Components needed:
  - Personality selector (Amina/Amir/Noor/Zara)
  - Prompt editor (system_prompt textarea)
  - Tone sliders (warmth, formality, energy, empathy, religiosity)
  - Version history table with activate/rollback
  - Test simulator (input box, run test, show results)
  - Cultural variants editor (region selector, overlay editor, A/B config)

### 2.6 Token Counting
**Status: ⚠️ PARTIAL**

- Current: `estimateTokens()` in `mmagent-handler.ts:286` uses `text.length / 4`
- Need: Proper tokenizer or conservative approximation for 2000-token limit
- TODO: Integrate with OpenAI tiktoken if available, or document approximation

---

## 3. GAPS ANALYSIS

### Critical Gaps
1. **No database tables** for prompts, variants, test history
2. **Hardcoded prompts** in runtime (must load from DB)
3. **No admin UI** for prompt editing
4. **No version control** or rollback mechanism
5. **No test simulator** before activation

### Medium Priority Gaps
1. **No cultural variant overlays** (table exists but not used in prompts)
2. **No A/B testing** infrastructure
3. **No server-side caching** for prompts (Edge Functions)
4. **Admin auth** is demo-only (needs production RLS)

### Low Priority Gaps
1. **Token counting** is approximate (acceptable for now, document TODO)
2. **Monitoring hooks** structure exists but needs aggregation endpoints

---

## 4. IMPLEMENTATION PLAN

### Phase 1: Database Foundation
1. Create migration for `mmagent_prompts` table
2. Create migration for `cultural_variants` table
3. Create migration for `prompt_test_history` table
4. Add RLS policies (admin-only access)
5. Seed initial prompts for all 4 personalities

### Phase 2: Runtime Integration
1. Modify `getSystemPrompt()` to load from DB
2. Add tone parameter application
3. Add cultural variant overlay logic
4. Add A/B variant selection (deterministic)
5. Add template variable substitution
6. Implement server-side caching (simple Map with TTL)

### Phase 3: Admin Services
1. Create `PersonalityAdminService.ts`
2. Implement token counting (approximation OK)
3. Implement draft save with validation
4. Implement activate/rollback with cache invalidation
5. Implement test simulator

### Phase 4: Admin API Routes
1. Create Edge Functions for all admin endpoints
2. Add admin authorization checks
3. Wire up service methods

### Phase 5: Admin UI
1. Create admin page component
2. Build prompt editor
3. Build tone sliders
4. Build version history viewer
5. Build test simulator
6. Build cultural variants editor

### Phase 6: Testing & Documentation
1. Add tests for uniqueness constraints
2. Add tests for version incrementing
3. Add tests for A/B selection determinism
4. Add tests for template substitution
5. Create implementation documentation

---

## 5. COMPATIBILITY NOTES

### Personality Key Mapping
- **Database stores**: `wise_aunty`, `modern_scholar`, `spiritual_guide`, `cultural_bridge`
- **Internal types**: `amina`, `zara`, `amir`, `noor`
- **Solution**: Use database keys (`wise_aunty`, etc.) in new tables; keep mapping in `getPersonalityType()` for backward compatibility

### Cultural Region Mapping
- **Existing**: `cultural_profiles.primary_background` uses: `'south_asian'`, `'arab'`, `'western_convert'`, `'african'`, `'southeast_asian'`, `'other'`
- **Spec requires**: `'south_asian'`, `'middle_eastern'`, `'southeast_asian'`, `'western_convert'`, `'african'`
- **Solution**: Map `'arab'` → `'middle_eastern'` in cultural variant lookup

### Admin Authorization
- **Current**: Demo-only sessionStorage check
- **Needed**: Production RLS policies + service role in Edge Functions
- **Solution**: Use service role key in Edge Functions (already pattern), add RLS policies for table access

---

## 6. RISK ASSESSMENT

### Low Risk
- Adding new tables (no breaking changes)
- Creating admin UI (isolated feature)

### Medium Risk
- Modifying `getSystemPrompt()` (affects all MMAgent conversations)
  - **Mitigation**: Fallback to hardcoded prompts if DB load fails
- Cache invalidation timing (could serve stale prompts briefly)
  - **Mitigation**: Short TTL (5 minutes) + explicit invalidation on activate

### High Risk
- None identified (feature is additive, with fallbacks)

---

## 7. NEXT STEPS

1. ✅ **Audit Complete** (this document)
2. ⏭️ Create database migrations
3. ⏭️ Implement runtime integration with fallbacks
4. ⏭️ Build admin services
5. ⏭️ Create admin API routes
6. ⏭️ Build admin UI
7. ⏭️ Add tests
8. ⏭️ Write implementation docs

---

## 8. DECISIONS MADE

1. **Use database keys** (`wise_aunty`, etc.) in new tables; keep internal mapping for backward compatibility
2. **Server-side caching**: Simple in-memory Map with TTL (5 min default) in Edge Function context
3. **Token counting**: Use approximation (`text.length / 4`) with TODO for proper tokenizer
4. **Admin auth**: Use service role in Edge Functions; add RLS policies for table security
5. **Fallback strategy**: If DB load fails, use existing hardcoded prompts (graceful degradation)
