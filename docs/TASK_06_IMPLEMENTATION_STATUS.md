# Task 6: DNA Insights Implementation Status Report

## Phase 0 - Codebase Audit Results

### 0.1 Search Findings

#### Keywords Found:
- ✅ `approved_insights_count` - Found in migration `20251224T000001_add_dna_content_cultural_scores.sql`
- ✅ `InsightApprovalInterface` - Component exists at `src/components/insights/InsightApprovalInterface.tsx`
- ✅ `SwipeableCard` - Component exists at `src/components/ui/SwipeableCard.tsx`
- ✅ `swipe`, `approve`, `reject` - Found in multiple UI components
- ✅ `badges`, `streak` - Found in journey/topic suggestions (but not for insights gamification)
- ❌ `user_insights` table - NOT FOUND
- ❌ `gamification_progress` table - NOT FOUND
- ❌ `update_gamification_on_review` trigger - NOT FOUND
- ❌ `dna_weight`, `contributes_to_dna` - NOT FOUND

#### Migration Files:
- ❌ No migration file named `008_dna_insights.sql` or similar
- ✅ Found `20251224T000001_add_dna_content_cultural_scores.sql` which adds `approved_insights_count` to `mysoul_dna_scores` table

#### API Routes:
- ❌ `/api/insights/pending` - NOT FOUND
- ❌ `/api/insights/[id]/approve` - NOT FOUND
- ❌ `/api/insights/[id]/reject` - NOT FOUND
- ❌ `/api/insights/approved` - NOT FOUND
- ❌ `/api/gamification/progress` - NOT FOUND
- ❌ `/api/gamification/badges` - NOT FOUND

**Note:** This is a Vite + React app (not Next.js), so API routes would be Supabase Edge Functions, not Next.js routes.

#### UI Components:
- ✅ `InsightApprovalInterface.tsx` - EXISTS at `src/components/insights/InsightApprovalInterface.tsx`
  - Has swipe functionality with framer-motion
  - Uses localStorage for points (not backend)
  - Has milestone celebrations (25/50/75/100%)
  - Points: +10 approve, +5 reject (doesn't match spec: reject should be 0)
- ✅ `InsightsScreen.tsx` - EXISTS at `src/pages/InsightsScreen.tsx`
  - Uses mock data
  - Has basic approve/reject buttons (not swipe interface)
- ✅ `ConfirmedInsightsScreen.tsx` - EXISTS at `src/pages/ConfirmedInsightsScreen.tsx`
  - Uses mock data
  - Shows confirmed insights list

### 0.2 Implementation Status Report

#### ✅ Already Implemented (Verified Files + Summary)

1. **UI Components (Frontend Only)**
   - `src/components/insights/InsightApprovalInterface.tsx`
     - Swipeable card interface with framer-motion
     - Progress tracking UI
     - Points display (localStorage-based)
     - Milestone celebrations
     - **Issue:** Uses localStorage, not backend
     - **Issue:** Reject gives +5 points (should be 0 per spec)
   
   - `src/components/ui/SwipeableCard.tsx`
     - Generic swipeable card component
     - Supports left/right swipe actions
   
   - `src/pages/InsightsScreen.tsx`
     - Basic insights listing page
     - Uses mock data
     - Has approve/reject buttons (not swipe)
   
   - `src/pages/ConfirmedInsightsScreen.tsx`
     - Confirmed insights display
     - Uses mock data

2. **Database (Partial)**
   - `supabase/migrations/20251224T000001_add_dna_content_cultural_scores.sql`
     - Adds `approved_insights_count` column to `mysoul_dna_scores` table
     - **Note:** This is a counter, not the full insights table

#### ⚠️ Partially Implemented (What Exists + What's Missing)

1. **UI Components**
   - ✅ Swipe interface exists
   - ❌ Not connected to backend APIs
   - ❌ Points stored in localStorage instead of database
   - ❌ No real-time progress updates
   - ❌ No badge display integration

2. **Database Schema**
   - ✅ `approved_insights_count` counter exists
   - ❌ `user_insights` table missing
   - ❌ `gamification_progress` table missing
   - ❌ Trigger `update_gamification_on_review` missing

#### ❌ Missing Completely

1. **Database**
   - `user_insights` table with required columns:
     - `id`, `user_id`, `insight_category`, `title`, `description`, `source_quote`
     - `confidence_score`, `status` (pending/approved/rejected)
     - `contributes_to_dna`, `dna_weight`, `reviewed_at`, `created_at`, `expires_at`
   - `gamification_progress` table with:
     - `user_id`, `total_points`, `insights_reviewed`, `insights_approved`, `insights_rejected`
     - `streak_days`, `last_review_date`, `longest_streak`
     - `badges` (JSONB), milestone booleans (25/50/75/100)
   - Trigger function `update_gamification_on_review`
   - RLS policies for both tables

2. **API Endpoints (Supabase Edge Functions)**
   - `GET /insights/pending` - Get pending insights for user
   - `POST /insights/:id/approve` - Approve insight
   - `POST /insights/:id/reject` - Reject insight
   - `GET /insights/approved` - Get approved insights
   - `GET /gamification/progress` - Get gamification progress
   - `GET /gamification/badges` - Get earned badges

3. **Business Logic**
   - Points calculation (+10 approve, 0 reject)
   - Bonus points (5 insights +50, 10 insights +100, 70% profile +500, 3-day streak +50, 7-day streak +150)
   - Badge thresholds (100, 500, 1000 points, 100% reviewed)
   - Streak calculation (48-hour break rule)
   - Insight expiry (30 days)
   - Minimum 5 approved insights for matching unlock
   - Double-review prevention

4. **UI Integration**
   - Connect `InsightApprovalInterface` to backend APIs
   - Replace localStorage with API calls
   - Real-time progress updates
   - Badge display component
   - Profile completion integration

#### ⚠️ Risky Discrepancies

1. **Points System**
   - Current UI: Reject gives +5 points
   - Spec: Reject should give 0 points
   - **Resolution:** Update to match spec (0 points for reject)

2. **Badge System**
   - Spec mentions both:
     - Technical checklist: Badges at 25/50/75/100% reviewed
     - Business spec: Badges at 100/500/1000 points + 100% reviewed
   - **Resolution:** Implement both systems, reconcile in UI

3. **Streak Calculation**
   - Spec: "Streak breaks after 48 hours without review"
   - Current topic suggestions: Day-based streak
   - **Resolution:** Implement 48-hour timestamp-based streak for insights

4. **Profile Completion Integration**
   - Spec: "If repo already has profile completion %, integrate approved insight count"
   - Need to check existing profile completion system
   - **Resolution:** Integrate if exists, otherwise implement minimal check

## Implementation Plan

### Phase 1 - Database (Supabase)
- [ ] Create `user_insights` table migration
- [ ] Create `gamification_progress` table migration
- [ ] Create trigger function `update_gamification_on_review`
- [ ] Add RLS policies
- [ ] Add indexes for performance

### Phase 2 - API Routes (Supabase Edge Functions)
- [ ] Create `insights-pending` function
- [ ] Create `insights-approve` function
- [ ] Create `insights-reject` function
- [ ] Create `insights-approved` function
- [ ] Create `gamification-progress` function
- [ ] Create `gamification-badges` function

### Phase 3 - Business Logic
- [ ] Implement points calculation in trigger
- [ ] Implement bonus points logic
- [ ] Implement badge award logic
- [ ] Implement streak calculation (48-hour rule)
- [ ] Implement insight expiry (30 days)
- [ ] Implement matching unlock gate (5 approved insights)

### Phase 4 - UI Integration
- [ ] Update `InsightApprovalInterface` to use APIs
- [ ] Remove localStorage dependency
- [ ] Add badge display
- [ ] Add real-time progress updates
- [ ] Update `InsightsScreen` to use swipe interface
- [ ] Connect to profile completion system

### Phase 5 - Testing
- [ ] API endpoint tests
- [ ] Gamification logic tests
- [ ] UI integration tests
- [ ] Manual verification checklist
