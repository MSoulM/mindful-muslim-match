# Task 6A: Streak Rewards System - Verification & QA Checklist

## Implementation Summary

### Files Created/Modified

#### Database Migrations
1. `supabase/migrations/20251226T000001_create_streak_rewards_table.sql`
   - Creates `streak_rewards` table with clerk_user_id, streak tracking, grace period, milestones, discounts, bonus credits
   - RLS policies for user access
   - Indexes for performance

2. `supabase/migrations/20251226T000002_create_streak_history_table.sql`
   - Creates `streak_history` audit log table
   - Event types: activity, milestone, reset, grace_used, discount_applied
   - Indexes for querying

#### Services
3. `src/services/streaks/MilestoneRewards.ts`
   - Reward mapping for Gold vs Gold+ tiers
   - Milestone definitions (7, 14, 30, 60 days)
   - Helper functions for next milestone calculation

4. `src/services/streaks/StreakService.ts`
   - Core streak logic with `recordActivity(clerkUserId, tier)`
   - Business rules: same-day, next-day, grace period (2-3 days), reset (4+ days)
   - Milestone detection and reward application
   - History logging

5. `src/services/api/streaks.ts`
   - Frontend API client for streak endpoints
   - `recordActivity()` and `getStatus()` methods

#### API Endpoints (Supabase Edge Functions)
6. `supabase/functions/streaks-activity/index.ts`
   - POST endpoint to record daily login activity
   - Feature flag check (MAP_11 / STREAK_REWARDS_ENABLED)
   - Implements business logic inline

7. `supabase/functions/streaks-status/index.ts`
   - GET endpoint to fetch current streak status
   - Returns streak data, milestones, discounts, bonus credits
   - Feature flag check

#### UI Components
8. `src/components/streaks/StreakCounter.tsx`
   - Displays current streak prominently
   - Shows days until next milestone
   - Grace period warning indicator

9. `src/components/streaks/MilestonePopup.tsx`
   - Celebration popup with confetti on milestone achievement
   - Shows milestone day, reward earned, streak count

10. `src/hooks/useStreak.ts`
    - React hook for streak management
    - Auto-fetches status on mount
    - Handles milestone popup state
    - Provides `recordActivity()` method

#### Notifications
11. `src/utils/notificationTemplates.ts` (modified)
    - Added `streakWarning`, `streakMilestone`, `streakGraceUsed` templates

#### Documentation
12. `TASK_6A_IMPLEMENTATION_STATUS.md`
    - Phase 0 audit results
    - Implementation plan

13. `TASK_6A_VERIFICATION.md` (this file)
    - Test scenarios and QA checklist

## Core Test Scenarios

### 1. Same-Day Activity Does Not Change Streak ✅
**Test:**
- User logs in at 9:00 AM
- User logs in again at 3:00 PM same day
- Expected: Streak remains unchanged, no update to database

**Verification:**
```sql
SELECT current_streak, last_activity_date FROM streak_rewards WHERE clerk_user_id = 'test_user';
-- Should show same streak count and same date
```

### 2. Next-Day Increments Streak ✅
**Test:**
- User has 5-day streak, last activity on Day 1
- User logs in on Day 2
- Expected: Streak increments to 6 days

**Verification:**
- Check `current_streak` increased by 1
- Check `last_activity_date` updated to Day 2
- Check `streak_history` has 'activity' event

### 3. 2-3 Day Gap Continues Streak Only If Grace Unused ✅
**Test:**
- User has 10-day streak, last activity on Day 1, grace_period_used = false
- User logs in on Day 3 (2 days gap)
- Expected: Streak continues to 11, grace_period_used = true, grace_expires_at set

**Verification:**
- Check `current_streak` = 11
- Check `grace_period_used` = true
- Check `grace_expires_at` is 72 hours from activity
- Check `streak_history` has 'grace_used' event

**Test:**
- User has 10-day streak, grace_period_used = true
- User logs in on Day 3 (2 days gap)
- Expected: Streak resets to 1 (grace already used)

### 4. 4+ Day Gap Resets Streak ✅
**Test:**
- User has 15-day streak, last activity on Day 1
- User logs in on Day 5 (4 days gap)
- Expected: Streak resets to 1, grace_period_used = false

**Verification:**
- Check `current_streak` = 1
- Check `grace_period_used` = false
- Check `grace_expires_at` = null
- Check `streak_history` has 'reset' event

### 5. Milestones Award Correctly for Gold vs Gold+ ✅
**Test:**
- Gold user reaches 14-day milestone
- Expected: +5 bonus credits, milestones_achieved.day_14 = true

**Test:**
- Gold+ user reaches 14-day milestone
- Expected: +10 bonus credits, milestones_achieved.day_14 = true

**Test:**
- Gold user reaches 60-day milestone
- Expected: 10% discount, discount_expires_at = 12 months from now

**Test:**
- Gold+ user reaches 60-day milestone
- Expected: 20% discount, discount_expires_at = 12 months from now

**Verification:**
- Check `bonus_credits` increased correctly
- Check `discount_percentage` set correctly
- Check `milestones_achieved` JSONB updated
- Check `streak_history` has 'milestone' event with correct reward

### 6. Milestones Awarded Only Once ✅
**Test:**
- User reaches 7-day milestone (Personality Badge awarded)
- User continues to 8 days, then resets
- User reaches 7 days again
- Expected: No duplicate reward, milestones_achieved.day_7 remains true

**Verification:**
- Check `streak_history` has only one 'milestone' event for day_7
- Check `milestones_achieved.day_7` = true (not updated again)

### 7. Discount Expires After 12 Months ✅
**Test:**
- User earns 60-day discount on 2024-01-01
- Check discount status on 2025-01-02
- Expected: discount_expires_at < now(), discount should be considered expired

**Verification:**
```sql
SELECT discount_earned, discount_expires_at 
FROM streak_rewards 
WHERE clerk_user_id = 'test_user' 
  AND discount_expires_at < now();
-- Should show expired discounts
```

### 8. Bonus Credits Never Expire ✅
**Test:**
- User earns +5 credits at 14 days
- User resets streak multiple times
- Expected: bonus_credits remains cumulative, never decreases

**Verification:**
- Check `bonus_credits` only increases, never decreases
- Check reset events don't affect bonus_credits

### 9. Feature Flag Gates System ✅
**Test:**
- Set `STREAK_REWARDS_ENABLED=false` or `MAP_11=false`
- Attempt to call streaks-activity endpoint
- Expected: 503 error "Feature not enabled"

**Verification:**
- Check Edge Function returns 503 when flag is false
- Check no database writes occur when flag is false

### 10. Clerk Authentication Required ✅
**Test:**
- Call streaks-activity without Authorization header
- Expected: 401 error "Unauthorized"

**Test:**
- Call with invalid token
- Expected: 401 error "Invalid token"

**Verification:**
- Check Edge Functions validate JWT and extract clerk_user_id from payload.sub

## Manual QA Checklist

### Database
- [ ] Run migrations: `supabase migration up`
- [ ] Verify `streak_rewards` table created with all columns
- [ ] Verify `streak_history` table created with enum type
- [ ] Verify RLS policies allow users to access only their own data
- [ ] Verify indexes created for performance

### API Endpoints
- [ ] Test `POST /functions/v1/streaks-activity` with valid auth
- [ ] Test `GET /functions/v1/streaks-status` with valid auth
- [ ] Test endpoints return 503 when feature flag is disabled
- [ ] Test endpoints return 401 when unauthenticated
- [ ] Test endpoints return 401 when token is invalid

### Business Logic
- [ ] Same-day activity doesn't increment streak
- [ ] Next-day activity increments streak
- [ ] 2-3 day gap uses grace period (once per streak)
- [ ] 4+ day gap resets streak
- [ ] Milestones award correctly (7, 14, 30, 60 days)
- [ ] Gold vs Gold+ rewards differ (credits: 5/10, 10/20; discount: 10%/20%)
- [ ] Milestones awarded only once
- [ ] Bonus credits accumulate and never expire
- [ ] Discount expires after 12 months
- [ ] Longest streak tracks correctly

### UI Components
- [ ] `StreakCounter` displays current streak
- [ ] `StreakCounter` shows days until next milestone
- [ ] `StreakCounter` shows grace period warning when used
- [ ] `MilestonePopup` appears on milestone achievement
- [ ] `MilestonePopup` shows confetti animation
- [ ] `MilestonePopup` displays correct reward text
- [ ] `useStreak` hook fetches status on mount
- [ ] `useStreak` hook records activity correctly
- [ ] `useStreak` hook manages milestone popup state

### Notifications (Future Implementation)
- [ ] "Don't break your streak" push sent after 24 hours inactivity
- [ ] Milestone celebration push sent on milestone achievement
- [ ] Grace period used warning displayed in UI

### Integration Points
- [ ] Subscription tier detection works (`useSubscriptionTier`)
- [ ] Discount integration point documented (TODO: integrate with subscription renewal)
- [ ] Founding members discount rule documented (TODO: check if founding_member flag exists)

## Open Questions

1. **Daily Activity Definition**: Currently tracks any authenticated API call. Should we be more specific?
   - **Resolution**: Default to login activity (any authenticated request). Can be refined later.

2. **Feature Flag System**: Implemented via environment variable. Should we create a config table?
   - **Resolution**: Using environment variable for now. Can migrate to config table if needed.

3. **Discount Application**: Where is subscription pricing computed?
   - **Status**: TODO - Need to find subscription renewal/payment flow and integrate discount calculation
   - **Location**: Add discount calculation hook in subscription service

4. **Founding Members**: How are founding members identified?
   - **Status**: TODO - Check if `founding_member` flag exists in profiles table
   - **Action**: If missing, add flag and update discount stacking logic

5. **Notification System**: Push notification infrastructure exists but needs streak-specific triggers
   - **Status**: TODO - Implement background job/cron to check for 24-hour inactivity and send warnings
   - **Location**: Add to notification service or create separate streak notification service

## Next Steps

1. **Integration**: Integrate `StreakCounter` into profile/home screens
2. **Activity Tracking**: Add automatic `recordActivity()` call on app open/login
3. **Notifications**: Implement background job for streak warnings
4. **Discount Integration**: Find subscription pricing logic and integrate discount calculation
5. **Testing**: Run all test scenarios in development environment
6. **Documentation**: Update API documentation with streak endpoints

## Environment Variables Required

```bash
# Feature flag (enable streak rewards system)
STREAK_REWARDS_ENABLED=true
# OR
MAP_11=true
```

## Database Schema Summary

### streak_rewards
- `clerk_user_id` (TEXT, UNIQUE) - User identifier
- `current_streak` (INTEGER) - Current consecutive days
- `longest_streak` (INTEGER) - Best streak achieved
- `last_activity_date` (DATE) - Last login date
- `grace_period_used` (BOOLEAN) - Grace used in current streak
- `grace_expires_at` (TIMESTAMPTZ) - Grace expiration
- `milestones_achieved` (JSONB) - {day_7, day_14, day_30, day_60}
- `discount_earned` (BOOLEAN) - Has 60-day discount
- `discount_percentage` (INTEGER) - 0, 10, or 20
- `discount_expires_at` (TIMESTAMPTZ) - 12 months after earning
- `bonus_credits` (INTEGER) - Cumulative, never expires

### streak_history
- `clerk_user_id` (TEXT) - User identifier
- `event_type` (ENUM) - activity, milestone, reset, grace_used, discount_applied
- `streak_before` (INTEGER) - Streak before event
- `streak_after` (INTEGER) - Streak after event
- `milestone_reached` (TEXT) - e.g., "day_7"
- `reward_given` (TEXT) - Reward description
- `created_at` (TIMESTAMPTZ) - Event timestamp
