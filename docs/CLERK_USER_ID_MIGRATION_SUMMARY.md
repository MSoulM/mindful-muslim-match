# Migration Summary: user_id → clerk_user_id

## Overview
Updated all code references from `user_id` to `clerk_user_id` to match the database schema changes in `user_insights` and `gamification_progress` tables.

## Files Updated

### 1. Supabase Edge Functions
All Edge Functions updated to use `clerk_user_id`:

- ✅ `supabase/functions/insights-pending/index.ts`
  - Changed `.eq('user_id', userId)` → `.eq('clerk_user_id', userId)`

- ✅ `supabase/functions/insights-approve/index.ts`
  - Changed all `.eq('user_id', userId)` → `.eq('clerk_user_id', userId)`
  - Updated both `user_insights` and `gamification_progress` queries

- ✅ `supabase/functions/insights-reject/index.ts`
  - Changed all `.eq('user_id', userId)` → `.eq('clerk_user_id', userId)`
  - Updated both `user_insights` and `gamification_progress` queries

- ✅ `supabase/functions/insights-approved/index.ts`
  - Changed all `.eq('user_id', userId)` → `.eq('clerk_user_id', userId)`

- ✅ `supabase/functions/gamification-progress/index.ts`
  - Changed `.eq('user_id', userId)` → `.eq('clerk_user_id', userId)`
  - Updated default response to use `clerk_user_id`

- ✅ `supabase/functions/gamification-badges/index.ts`
  - Changed `.eq('user_id', userId)` → `.eq('clerk_user_id', userId)`

### 2. Database Trigger Function
- ✅ `supabase/migrations/20251225T000003_create_gamification_trigger.sql`
  - Changed `v_user_id := NEW.user_id` → `v_user_id := NEW.clerk_user_id`
  - Updated all WHERE clauses from `WHERE user_id = v_user_id` → `WHERE clerk_user_id = v_user_id`
  - Updated all SELECT queries to use `clerk_user_id`
  - Updated `mysoul_dna_scores` update to use `clerk_user_id`

### 3. TypeScript Interfaces
- ✅ `src/services/api/insights.ts`
  - Updated `UserInsight` interface: `user_id: string` → `clerk_user_id: string`
  - Updated `GamificationProgress` interface: `user_id: string` → `clerk_user_id: string`

### 4. Database Migrations (Already Updated)
- ✅ `supabase/migrations/20251225T000001_create_user_insights_table.sql`
  - Already uses `clerk_user_id` in table definition
  - RLS policies already use `clerk_user_id`
  - Indexes already use `clerk_user_id`

- ✅ `supabase/migrations/20251225T000002_create_gamification_progress_table.sql`
  - Already uses `clerk_user_id` in table definition
  - RLS policies already use `clerk_user_id`
  - Indexes already use `clerk_user_id`

## Verification

All references have been updated:
- ✅ All Edge Functions use `clerk_user_id`
- ✅ Trigger function uses `clerk_user_id`
- ✅ TypeScript interfaces use `clerk_user_id`
- ✅ No linter errors
- ✅ RLS policies already correct

## Next Steps

1. **Deploy Updated Trigger:**
   ```sql
   -- Run the updated trigger migration
   -- The trigger function will be recreated with clerk_user_id references
   ```

2. **Redeploy Edge Functions:**
   ```bash
   supabase functions deploy insights-pending
   supabase functions deploy insights-approve
   supabase functions deploy insights-reject
   supabase functions deploy insights-approved
   supabase functions deploy gamification-progress
   supabase functions deploy gamification-badges
   ```

3. **Test:**
   - Verify pending insights load correctly
   - Test approve/reject functionality
   - Verify gamification progress updates
   - Check badge awards

## Notes

- The variable name `v_user_id` in the trigger function remains the same (it's just a local variable)
- All database column references now use `clerk_user_id`
- The JWT token extraction (`payload.sub`) remains unchanged - it still extracts the Clerk user ID
