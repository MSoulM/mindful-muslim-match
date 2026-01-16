# Edge Functions Authentication Update

## Overview

Updated all edge functions to properly use user authentication tokens instead of always using SERVICE_ROLE_KEY. This ensures proper Row Level Security (RLS) enforcement and follows the principle of least privilege.

**Date**: 2026-01-17  
**Scope**: All city cluster functions + common user-facing endpoints

---

## Changes Made

### 1. New Shared Helper (`_shared/supabase-client.ts`)

Created centralized helper functions for creating Supabase clients:

```typescript
// For authenticated user requests (uses user's token)
export function createAuthenticatedClient(token: string): SupabaseClient

// For admin requests (uses SERVICE_ROLE_KEY)
export function createServiceClient(): SupabaseClient

// For public requests (uses ANON_KEY)
export function createAnonClient(): SupabaseClient
```

**Benefits**:
- Consistent client creation across all functions
- Proper token authentication
- RLS policy enforcement
- Type-safe and reusable

---

## Updated Edge Functions

### User-Facing Endpoints (Now use user's token)

✅ **City Cluster Functions** (New - Task 9A)
1. `supabase/functions/city-current/index.ts`
   - **Before**: SERVICE_ROLE_KEY
   - **After**: User's Bearer token via `createAuthenticatedClient(token)`
   - **Impact**: Respects user RLS policies on `user_city_assignments`

2. `supabase/functions/city-select/index.ts`
   - **Before**: SERVICE_ROLE_KEY
   - **After**: User's Bearer token via `createAuthenticatedClient(token)`
   - **Impact**: User can only update their own city assignments

3. `supabase/functions/city-auto-detect/index.ts`
   - **Before**: SERVICE_ROLE_KEY
   - **After**: User's Bearer token via `createAuthenticatedClient(token)`
   - **Impact**: User can only create assignments for themselves

4. `supabase/functions/city-list/index.ts`
   - **Before**: ANON_KEY (direct call)
   - **After**: ANON_KEY via `createAnonClient()`
   - **Impact**: Cleaner code, consistent pattern

✅ **Other User Endpoints**
5. `supabase/functions/governance-tokens/index.ts`
   - **Before**: SERVICE_ROLE_KEY
   - **After**: User's Bearer token via `createAuthenticatedClient(token)`
   - **Impact**: Token usage queries respect user RLS

6. `supabase/functions/mmagent-messages/index.ts`
   - **Before**: SERVICE_ROLE_KEY
   - **After**: User's Bearer token via `createAuthenticatedClient(token)`
   - **Impact**: Message queries respect user RLS

### Admin Endpoints (Now use helper - still SERVICE_ROLE_KEY)

✅ **City Cluster Admin** (New - Task 9A)
7. `supabase/functions/admin-cities/index.ts`
   - **Before**: SERVICE_ROLE_KEY (direct call)
   - **After**: SERVICE_ROLE_KEY via `createServiceClient()`
   - **Impact**: Cleaner code, consistent pattern

8. `supabase/functions/admin-city-prompts/index.ts`
   - **Before**: SERVICE_ROLE_KEY (direct call)
   - **After**: SERVICE_ROLE_KEY via `createServiceClient()`
   - **Impact**: Cleaner code, cache invalidation works correctly

9. `supabase/functions/admin-local-references/index.ts`
   - **Before**: SERVICE_ROLE_KEY (direct call)
   - **After**: SERVICE_ROLE_KEY via `createServiceClient()`
   - **Impact**: Cleaner code, consistent pattern

10. `supabase/functions/admin-city-analytics/index.ts`
    - **Before**: SERVICE_ROLE_KEY (direct call)
    - **After**: SERVICE_ROLE_KEY via `createServiceClient()`
    - **Impact**: Cleaner code, consistent pattern

---

## Pattern Summary

### Before (Inconsistent)

```typescript
// Every function had to do this:
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);
```

**Problems**:
- Always used SERVICE_ROLE_KEY (bypassed RLS)
- Manual permission checks required
- Inconsistent across functions
- Security risk if RLS not properly configured

### After (Consistent & Secure)

```typescript
// User endpoints
const token = authHeader.replace('Bearer ', '');
const supabase = createAuthenticatedClient(token);
// ✅ Respects RLS, user can only access their own data

// Admin endpoints
const supabase = createServiceClient();
// ✅ Bypasses RLS (intentional for admin operations)

// Public endpoints
const supabase = createAnonClient();
// ✅ Public read-only access
```

---

## Security Benefits

### 1. Row Level Security Enforcement

**Before**: All user requests bypassed RLS using SERVICE_ROLE_KEY
```sql
-- RLS policy was ignored!
CREATE POLICY "Users can view their own assignments"
ON user_city_assignments FOR SELECT
USING (clerk_user_id = auth.jwt()->>'sub');
```

**After**: User tokens respect RLS policies
```typescript
// User can only see their own data
const supabase = createAuthenticatedClient(userToken);
await supabase.from('user_city_assignments').select('*');
// ✅ RLS automatically filters to user's data
```

### 2. Principle of Least Privilege

- **User functions**: Limited to user's own data
- **Admin functions**: Full access (as intended)
- **Public functions**: Read-only access to public data

### 3. Audit Trail

Token-based authentication provides better audit trails:
- Who made the request (from JWT)
- What they accessed (from Supabase logs)
- When it happened (timestamp)

---

## Migration Guide for Other Functions

If you need to update additional edge functions, follow this pattern:

### Step 1: Import Helper

```typescript
import { createAuthenticatedClient } from "../_shared/supabase-client.ts";
// or createServiceClient() for admin
// or createAnonClient() for public
```

### Step 2: Replace Client Creation

**User endpoints**:
```typescript
// OLD
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// NEW
const token = authHeader.replace('Bearer ', '');
const supabase = createAuthenticatedClient(token);
```

**Admin endpoints**:
```typescript
// OLD
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// NEW
const supabase = createServiceClient();
```

**Public endpoints**:
```typescript
// OLD
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

// NEW
const supabase = createAnonClient();
```

---

## Testing Checklist

After updating functions, verify:

### User Functions
- [ ] User can access their own data
- [ ] User CANNOT access other users' data
- [ ] Authentication errors return 401
- [ ] Invalid tokens return 401

### Admin Functions
- [ ] Admin can access all data
- [ ] Non-admin gets 403 Forbidden
- [ ] No authentication returns 401

### Public Functions
- [ ] Anyone can read public data
- [ ] Write operations are blocked (RLS)

---

## Functions Still Using SERVICE_ROLE_KEY (Intentional)

These functions still use SERVICE_ROLE_KEY because they need elevated privileges:

1. **Batch Processing**: `weekly-batch`, `batch-queue`, etc.
   - Need to process data for all users

2. **System Operations**: `clerk-webhook`, `photo-upload`, etc.
   - System-level operations that bypass RLS

3. **Analytics**: Some analytics functions aggregate across users
   - Need cross-user data access

These are **correct** and should not be changed unless business logic changes.

---

## Environment Variables Required

Ensure these are set in Supabase dashboard:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...  # Public anon key
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # Admin service role key
```

---

## Rollback Plan

If issues arise, revert by:

1. Remove import of `supabase-client.ts` helpers
2. Restore direct `createClient()` calls with SERVICE_ROLE_KEY
3. Redeploy affected functions

```bash
# Rollback single function
supabase functions deploy city-current --no-verify-jwt

# Or rollback all at once
git revert <commit-hash>
supabase functions deploy --no-verify-jwt
```

---

## Related Documentation

- [Task 9A: City Cluster Management](./city_cluster_management.md)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Admin Setup Guide](./ADMIN_SETUP.md)

---

**Updated By**: AI Assistant  
**Date**: 2026-01-17  
**Status**: ✅ Complete
