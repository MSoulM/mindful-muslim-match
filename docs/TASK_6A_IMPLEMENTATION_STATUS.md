# Task 6A: Streak Rewards System - Implementation Status Report

## Phase 0 - Codebase Audit Results

### ✅ Already Implemented

**None** - The Task 6A streak rewards system (login-based daily streaks with milestone rewards) is completely missing from the codebase.

**Note:** There are other streak systems in the codebase, but they serve different purposes:
- `gamification_progress` table: Tracks streaks for DNA Insights review (48-hour rule, different milestones)
- `topicSuggestions.ts` completion streaks: localStorage-based topic completion streaks

### ❌ Missing Completely

1. **Database Tables**
   - `streak_rewards` table (with clerk_user_id, current_streak, longest_streak, last_activity_date, grace_period_used, milestones_achieved, discount_earned, bonus_credits)
   - `streak_history` table (audit log with event_type, streak_before, streak_after, milestone_reached)

2. **Services**
   - `StreakService.ts` - Core streak logic with `recordActivity(clerkUserId)`
   - `MilestoneRewards.ts` - Reward mapping for Gold vs Gold+ tiers

3. **UI Components**
   - `StreakCounter` - Display current streak prominently
   - `MilestonePopup` - Celebration popup with confetti on milestone achievement

4. **API Endpoints**
   - `POST /api/streaks/activity` - Record daily login activity
   - `GET /api/streaks/status` - Get current streak status, next milestone, grace status

5. **Feature Flags**
   - `MAP_11` / `streak_rewards` feature flag system (no feature flag infrastructure found)

6. **Notifications**
   - "Don't break your streak" push notification (24-hour warning)
   - Milestone celebration push notifications
   - Grace period used warning

7. **Subscription Integration**
   - Discount application logic (10% Gold, 20% Gold+) for subscription renewal
   - Founding members discount stacking logic
   - Discount expiry handling (12 months)

### ⚠️ Schema Mismatches

**N/A** - No existing Task 6A tables to migrate. However, we must ensure all new tables use `clerk_user_id TEXT` (not `user_id UUID`) to match the project's Clerk authentication pattern.

### 📋 Existing Patterns to Follow

1. **Clerk Authentication**: Extract `payload.sub` from JWT token in Edge Functions
2. **API Pattern**: Supabase Edge Functions with CORS headers, JWT auth validation
3. **Subscription Tiers**: `useSubscriptionTier.ts` provides `gold` and `gold_plus` tier detection
4. **RLS Policies**: Use `current_setting('request.jwt.claims', true)::json->>'sub'` pattern
5. **Notification System**: `NotificationService.ts` and `usePushNotifications.ts` exist but need streak-specific templates

### 🔍 Open Questions

1. **Daily Activity Definition**: The spec mentions "log in daily" - should we track:
   - Any app open/authentication event?
   - Specific action (e.g., viewing profile, sending message)?
   - **Resolution**: Default to login activity (any authenticated API call or app open) - can be refined later

2. **Feature Flag System**: No existing feature flag infrastructure found. Should we:
   - Create minimal config table in Supabase?
   - Use environment variable?
   - **Resolution**: Implement minimal feature flag check via environment variable or config table

3. **Discount Application**: Where is subscription pricing computed?
   - Need to find subscription renewal/payment flow
   - **Resolution**: Add discount calculation hook and document integration point

4. **Founding Members**: How are founding members identified?
   - Need to check if there's a `founding_member` flag in profiles
   - **Resolution**: Check profiles table schema, add TODO if missing

## Implementation Plan

### Phase 1 - Database (Supabase)
- [ ] Create `streak_rewards` table migration with clerk_user_id
- [ ] Create `streak_history` table migration with clerk_user_id
- [ ] Add RLS policies for both tables
- [ ] Add indexes for performance

### Phase 2 - Streak Service Logic
- [ ] Implement `StreakService.recordActivity()` with business rules
- [ ] Implement milestone detection (7/14/30/60 days)
- [ ] Implement tier-based rewards (Gold vs Gold+)
- [ ] Implement grace period logic (72 hours, once per streak)
- [ ] Implement streak reset logic (4+ days gap)
- [ ] Create `MilestoneRewards.ts` reward mapping

### Phase 3 - API Endpoints
- [ ] Create `streaks-activity` Edge Function
- [ ] Create `streaks-status` Edge Function
- [ ] Add feature flag check (MAP_11 / streak_rewards)

### Phase 4 - UI & Notifications
- [ ] Create `StreakCounter` component
- [ ] Create `MilestonePopup` component with confetti
- [ ] Add notification templates for streak warnings
- [ ] Integrate streak display in profile/home screens
- [ ] Add grace period warning UI

### Phase 5 - Verification & Tests
- [ ] Document test scenarios
- [ ] Create manual QA checklist
- [ ] Verify discount integration points
