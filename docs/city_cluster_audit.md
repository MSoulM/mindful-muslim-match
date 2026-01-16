# City Cluster Management - Repository Audit

## Date: 2026-01-16

## Executive Summary

This audit examines the existing codebase to identify what infrastructure exists vs. what needs to be implemented for TASK 9A: City Cluster Management (City Cluster Cultural Intelligence™). The feature must allow MMAgent to adapt to local culture for target city clusters and admins to manage this without code redeploys.

---

## 1. EXISTING IMPLEMENTATION

### 1.1 User Location Storage
**Status: ✅ EXISTS**

- **Database Table**: `profiles` (migration: `20251123T000000_create_profiles_table.sql`)
  - `location` TEXT - string location name
  - `lat` NUMERIC(10,6) - latitude
  - `lng` NUMERIC(10,6) - longitude
  - **Gap**: No city cluster assignment field, no timezone, no structured city data

- **TypeScript Types**: `src/types/profile.ts`
  ```typescript
  location?: string;
  lat?: number;
  lng?: number;
  ```

- **Usage**: DNA score calculation reads lat/lng, MMAgent handler reads location as string

**Findings:**
- ✅ Basic lat/lng storage exists
- ❌ No city cluster assignment or mapping
- ❌ No timezone storage
- ❌ No structured city metadata (region, cultural settings)

---

### 1.2 MMAgent Prompt Building Pipeline
**Status: ✅ EXISTS (Task 7B implementation)**

- **Service**: `supabase/functions/_shared/mmagent-prompt-service.ts`
- **Architecture**:
  1. Load active personality prompt from `mmagent_prompts` table
  2. Apply tone parameters to generate tone guidelines
  3. Load cultural variant overlay from `cultural_variants` table (based on `cultural_profiles.primary_background`)
  4. Apply cultural overlay: `${systemPrompt}\n\n${variant.prompt_overlay}`
  5. Substitute template variables (userName, age, culturalBackground, city, etc.)
  6. Compose final prompt with base + personality + cultural + scope + token mode

- **Cultural Variants System** (Task 7B):
  - Table: `cultural_variants` (personality_key, cultural_region, prompt_overlay)
  - Regions: 'south_asian', 'middle_eastern', 'southeast_asian', 'western_convert', 'african'
  - Already supports prompt overlays and A/B testing
  - Caching: 5-minute TTL on composed prompts

**Integration Point for City Clusters:**
- Current flow: personality → tone → cultural_region overlay → template vars
- **New flow needed**: personality → tone → cultural_region overlay → **CITY overlay** → **city tone adjustments** → template vars
- Location: Insert city logic in `getSystemPromptFromDB()` after cultural variant (line 239) and before template substitution (line 241)

**Findings:**
- ✅ Modular prompt composition pipeline exists
- ✅ Cultural overlay system (Task 7B) provides pattern to follow
- ✅ Caching infrastructure exists
- ❌ No city cluster overlay logic
- ❌ No city-specific tone adjustments
- ❌ No local references injection

---

### 1.3 Admin Panel Framework
**Status: ✅ EXISTS (robust)**

- **Auth System**: `supabase/functions/_shared/admin-auth.ts`
  - Uses env var: `ADMIN_USER_IDS` (comma-separated Clerk user IDs)
  - Functions: `extractUserId()`, `isAdmin()`, `requireAdmin()`
  - Returns 401/403 for unauthorized access

- **Existing Admin Screens**:
  - `src/pages/admin/AdminPersonalityScreen.tsx` - MMAgent personality admin (Task 7B)
  - `src/pages/admin/AdminGovernanceScreen.tsx` - Token governance
  - `src/pages/admin/AdminAnalyticsScreen.tsx` - Platform analytics
  - `src/components/dev/AdminModeToggle.tsx` - Dev helper

- **Existing Admin Edge Functions**:
  - `supabase/functions/admin-mmagent-prompts/index.ts` - CRUD for prompts + tone testing

- **Client-Side Admin Check**: `src/hooks/useAdminCheck.ts`
  - Currently uses sessionStorage demo mode
  - Notes indicate production should use Supabase `has_role()` RPC

- **Documentation**: `docs/ADMIN_SETUP.md` - Comprehensive admin setup guide

**Integration Point for City Admin UI:**
- Add new screen: `src/pages/admin/AdminCityClusterScreen.tsx`
- Add new edge functions for city cluster CRUD
- Extend existing admin navigation in `src/App.tsx`

**Findings:**
- ✅ Admin auth infrastructure exists
- ✅ Admin UI patterns established
- ✅ Edge function patterns for admin CRUD exist
- ❌ No city cluster admin screens
- ❌ No city cluster admin API endpoints

---

### 1.4 Database Migration System
**Status: ✅ OPERATIONAL**

- **Location**: `supabase/migrations/`
- **Latest Migration**: `20260116T000006_content_originality.sql`
- **Naming Convention**: `YYYYMMDDTHHMMSS_description.sql`
- **Next Available Number**: `20260117T000001` (or `20260116T000007` for same-day)

**Findings:**
- ✅ Migration system ready for new tables
- ✅ Consistent naming pattern established

---

### 1.5 Existing Personality + Cultural System (Task 7B)
**Status: ✅ COMPLETE (reference implementation)**

Tables from migration `20250102T000002_create_mmagent_personality_admin_tables.sql`:

1. **mmagent_prompts**
   - personality_key (enum: 'wise_aunty', 'modern_scholar', 'spiritual_guide', 'cultural_bridge')
   - system_prompt, tone_parameters (warmth, formality, energy, empathy, religiosity)
   - version, is_active, is_draft
   - RLS: service_role only
   - Unique active prompt per personality

2. **cultural_variants**
   - personality_key, cultural_region (enum: 5 regions)
   - prompt_overlay, expression_library, local_references (JSONB)
   - ab_test_variant, ab_test_weight, is_active
   - RLS: service_role only
   - Unique per (personality, region, ab_variant)

3. **prompt_test_history**
   - Test results, admin ratings, token usage tracking

**Pattern to Follow for City Clusters:**
- Similar structure: city-specific prompts/overlays
- Similar RLS: service_role/admin-only writes
- Similar caching + invalidation strategy
- Key difference: City clusters operate at a different dimension than cultural_region (geography vs. ethnicity/background)

---

## 2. GAPS TO FILL (What's Missing)

### 2.1 Database Tables (Complete Gap)
❌ **city_clusters** - No table for target city metadata (london, nyc, houston_chicago, dubai, mumbai_dhaka)
❌ **city_prompts** - No city-specific prompt overlays
❌ **local_references** - No curated local references (mosques, restaurants, events)
❌ **user_city_assignments** - No user-to-city mapping with assignment method tracking

### 2.2 City Detection Logic (Complete Gap)
❌ No bounding box detection for city clusters (lat/lng → city_key)
❌ No fallback city assignment logic
❌ No auto-detection vs. user-selection tracking

### 2.3 Service Layer (Complete Gap)
❌ No `CityClusterService.ts` for city operations
❌ No city prompt overlay retrieval
❌ No local reference selection + usage tracking
❌ No city tone adjustment application

### 2.4 MMAgent Integration (Complete Gap)
❌ No city cluster determination in prompt building pipeline
❌ No city overlay appending to system prompt
❌ No city tone modifier application
❌ No local reference context injection

### 2.5 API Endpoints (Complete Gap)
❌ No user endpoints: `/api/city/current`, `/api/city/select`, `/api/city/auto-detect`
❌ No admin endpoints: `/api/admin/cities`, `/api/admin/city-prompts`, `/api/admin/local-references`, `/api/admin/city-analytics`

### 2.6 UI (Complete Gap)
❌ No city cluster admin screen
❌ No city selector in user settings
❌ No city indicator in user profile

### 2.7 Tests (Complete Gap)
❌ No tests for city detection algorithm
❌ No tests for city prompt overlay selection
❌ No tests for local reference selection
❌ No tests for access control on city config tables

---

## 3. INTEGRATION POINTS (Where to Inject City Logic)

### 3.1 MMAgent Prompt Building
**File**: `supabase/functions/_shared/mmagent-prompt-service.ts`
**Function**: `getSystemPromptFromDB()` (lines 188-272)

**Current Flow**:
```
1. Load activePrompt (personality) → line 206
2. Apply tone parameters → line 221
3. Load cultural variant overlay → lines 224-238
4. Substitute template variables → line 241
5. Compose final prompt → line 267
```

**New Flow (with city clusters)**:
```
1. Load activePrompt (personality) → line 206
2. Apply tone parameters → line 221
3. Load cultural variant overlay → lines 224-238
4. **[NEW] Load city cluster assignment for user** → after line 238
5. **[NEW] Load city prompt overlay (personality-specific or city-wide)** → after city assignment
6. **[NEW] Append city overlay to systemPrompt** → similar to line 235
7. **[NEW] Apply city tone adjustments to toneParams** → modify existing toneParams
8. **[NEW] Re-apply tone parameters with city modifiers** → call applyToneParameters again
9. Substitute template variables (including {{city}}) → line 241
10. **[NEW] Optionally inject local reference context** → before final composition
11. Compose final prompt → line 267
```

**Implementation Plan**:
- Import new `CityClusterService` in this file
- Add helper function: `loadCityOverlay(supabase, cityKey, personalityKey)`
- Add helper function: `applyCityToneAdjustments(baseParams, cityAdjustments)`
- Modify `getSystemPromptFromDB()` to include city logic after line 238

### 3.2 User Data Retrieval
**File**: `supabase/functions/_shared/mmagent-handler.ts`
**Method**: `getUserData()` (lines 307-342)

**Current**: Fetches profile location as string: `city: profile.location || ''`
**New**: Also fetch current city cluster assignment from `user_city_assignments`

**Implementation Plan**:
- Add join or separate query to fetch `user_city_assignments` where `is_current = true`
- Return `cityKey` and `assignmentMethod` in userData object

### 3.3 Admin Navigation
**File**: `src/App.tsx`
**Section**: Admin routes (search for AdminPersonalityScreen, AdminGovernanceScreen)

**Implementation Plan**:
- Add new route: `/admin/city-clusters` → `AdminCityClusterScreen`
- Add navigation link in settings or admin menu

### 3.4 User Settings
**File**: TBD (likely `src/pages/SettingsScreen.tsx` or create `src/components/settings/CityClusterSelector.tsx`)

**Implementation Plan**:
- Add city cluster selector component
- Show current assignment (auto-detected vs. selected)
- Allow user to override with manual selection

---

## 4. RECOMMENDED IMPLEMENTATION ORDER

Based on dependencies and testability:

### Phase 1: Database Foundation (Day 1)
1. Create migration `20260117T000001_city_clusters.sql` with all 4 tables + seed data
2. Test migration locally: `supabase migration up`
3. Verify RLS policies block unauthorized access

### Phase 2: Service Layer (Day 1-2)
4. Implement `src/services/city/CityClusterService.ts` with:
   - `detectCityCluster(lat, lng)` with bounding boxes
   - `assignCityFromLocation(userId, location)`
   - `userSelectCity(userId, cityKey)`
   - `getCityPromptOverlay(cityKey, personalityKey?)`
   - `getLocalReference(cityKey, referenceType)`
   - `getUserCurrentCity(userId)`
5. Write unit tests for bounding box detection

### Phase 3: MMAgent Integration (Day 2)
6. Modify `mmagent-prompt-service.ts` to integrate city overlays
7. Modify `mmagent-handler.ts` to fetch user city assignment
8. Test with sample user messages in various cities

### Phase 4: Admin API (Day 2-3)
9. Create edge functions:
   - `supabase/functions/admin-cities/index.ts` (CRUD for city_clusters)
   - `supabase/functions/admin-city-prompts/index.ts` (CRUD for city_prompts)
   - `supabase/functions/admin-local-references/index.ts` (CRUD for local_references)
   - `supabase/functions/admin-city-analytics/index.ts` (read-only analytics)
10. Use `requireAdmin()` from `admin-auth.ts` for all endpoints

### Phase 5: User API (Day 3)
11. Create edge functions or API routes:
    - `supabase/functions/city-current/index.ts` (GET current city)
    - `supabase/functions/city-select/index.ts` (POST user selection)
    - `supabase/functions/city-auto-detect/index.ts` (POST lat/lng)

### Phase 6: Admin UI (Day 3-4)
12. Create `src/pages/admin/AdminCityClusterScreen.tsx`:
    - City list with enable/disable toggles
    - City prompt overlay editor (tabs for city-wide + personality-specific)
    - Local references manager with filters
    - Analytics dashboard
13. Add admin navigation link

### Phase 7: User UI (Day 4)
14. Create `src/components/settings/CityClusterSelector.tsx`
15. Integrate into user settings screen
16. Show current city + assignment method indicator

### Phase 8: Testing & Documentation (Day 4-5)
17. Write integration tests for MMAgent city logic
18. Write admin access control tests
19. Create `docs/city_cluster_management.md` with:
    - Architecture overview
    - Admin user guide
    - API documentation
    - Troubleshooting guide

---

## 5. TECHNICAL DECISIONS

### 5.1 City Cluster Keys (EXACT as per spec)
```typescript
type CityKey = 'london' | 'nyc' | 'houston_chicago' | 'dubai' | 'mumbai_dhaka';
```
- Matches spec requirement for 5 target city clusters
- Houston + Chicago are combined (business decision from spec)
- Lowercase with underscores for consistency

### 5.2 Bounding Boxes for Detection
Use approximate metropolitan area bounds:
- **London**: 51.28–51.70°N, -0.51–0.33°E
- **NYC**: 40.49–40.92°N, -74.26–-73.70°W
- **Houston/Chicago**: 29.52–30.11°N (Houston), 41.64–42.02°N (Chicago), combined logic
- **Dubai**: 24.74–25.34°N, 54.89–55.58°E
- **Mumbai/Dhaka**: 18.89–19.27°N (Mumbai), 23.69–23.88°N (Dhaka), combined logic

### 5.3 Fallback Strategy
If lat/lng doesn't match any bounding box:
1. Check IP-based country detection (future enhancement)
2. Use nearest major city by distance calculation
3. Ultimate fallback: **'london'** (largest Muslim diaspora in target cities)

### 5.4 Assignment Method Priority
```
1. user_selected (highest priority - user explicitly chose)
2. auto_detected (from coordinates)
3. fallback (unknown location)
```
- Store history of assignments for audit trail
- Only latest `is_current = true` assignment is active

### 5.5 Prompt Overlay Priority
When building MMAgent prompt:
1. Try personality-specific city overlay: `city_prompts WHERE city_key = X AND personality_key = Y`
2. Fallback to city-wide overlay: `city_prompts WHERE city_key = X AND personality_key IS NULL`
3. If no city overlay, skip (personality + cultural overlay is sufficient)

### 5.6 Tone Adjustments Application
City tone adjustments are **modifiers** on top of personality tone:
```typescript
finalWarmth = personalityTone.warmth + cityTone.warmth_modifier;
finalFormality = personalityTone.formality + cityTone.formality_modifier;
```
- Keep in range 1-10 (clamp if needed)
- Deterministic application (not probabilistic)

### 5.7 Local References Usage
- Select randomly from active, verified references for the city
- Increment `usage_count` on each selection
- Only inject if contextually relevant (avoid forced mentions)
- Never hallucinate references - only use DB entries

---

## 6. RISK ASSESSMENT

### Low Risk ✅
- Database schema (follows established patterns from Task 7B)
- Service layer (standard CRUD + business logic)
- Admin UI (reuses existing admin screen patterns)

### Medium Risk ⚠️
- MMAgent prompt integration (must not break existing personality/cultural logic)
  - **Mitigation**: Thorough testing with existing prompts, add unit tests
- Bounding box accuracy (cities may have users outside metro area)
  - **Mitigation**: Allow user manual override, implement fallback logic
- Caching invalidation (city changes must propagate to prompt cache)
  - **Mitigation**: Implement cache invalidation on admin updates, short TTL

### High Risk 🔴
- None identified (feature is additive, not destructive)

---

## 7. DEPENDENCIES & PREREQUISITES

### Required Before Starting
✅ Task 7B (MMAgent Personality Admin) - **COMPLETE** (migration 20250102T000002)
✅ Admin auth system - **EXISTS** (admin-auth.ts)
✅ User profiles with lat/lng - **EXISTS** (profiles table)

### Optional Enhancements (Future)
- IP-based geolocation for fallback detection
- City cluster analytics dashboard (engagement by city)
- Multi-city support per user (travelers, relocators)
- City-specific event calendar integration

---

## 8. ESTIMATED EFFORT

- **Database + Migrations**: 2-3 hours
- **Service Layer**: 4-6 hours
- **MMAgent Integration**: 3-4 hours
- **Admin API**: 3-4 hours
- **User API**: 2-3 hours
- **Admin UI**: 6-8 hours
- **User UI**: 3-4 hours
- **Testing**: 4-6 hours
- **Documentation**: 2-3 hours

**Total Estimate**: 29-41 hours (4-5 days for one developer)

---

## 9. SUCCESS CRITERIA

### Must Have (MVP)
✅ All 5 city clusters seeded with metadata
✅ Automatic city detection from lat/lng works for representative coordinates
✅ Users can manually select city cluster
✅ MMAgent prompt includes city overlay for assigned city
✅ Admin can enable/disable cities
✅ Admin can edit city prompts and local references
✅ RLS policies enforce admin-only access to config tables

### Nice to Have (Post-MVP)
- City-specific analytics (user engagement, token usage)
- A/B testing for city overlays (similar to cultural variants)
- Automated city detection on profile update
- City cluster leaderboard (gamification)

---

## 10. CONCLUSION

**Overall Assessment**: 🟢 **READY TO IMPLEMENT**

The repository has excellent infrastructure from previous tasks (especially Task 7B cultural variants) that provides a clear pattern to follow. The admin framework is robust, and the MMAgent prompt building pipeline is modular enough to accommodate city cluster logic without major refactoring.

**Key Success Factors**:
1. Follow Task 7B patterns (cultural_variants → city_prompts)
2. Preserve existing prompt composition order
3. Implement robust fallback logic for undetected cities
4. Reuse admin auth and UI patterns
5. Write tests for bounding box detection and prompt overlay selection

**Recommended Approach**: Proceed in phases (database → service → integration → API → UI) with testing at each phase before moving forward.

---

**Audit Completed By**: AI Assistant
**Date**: 2026-01-16
**Next Step**: Phase 1 - Database Migrations
