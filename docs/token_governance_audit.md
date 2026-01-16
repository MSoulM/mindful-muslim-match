# Token Governance Audit - Step 0

## Date: 2025-01-XX
## Purpose: Audit existing token tracking, rate limits, AI model routing, governance rules, abuse detection, cost monitoring, and alerts

---

## 1. Existing Token Tracking

### Database Tables
- ✅ **`mmagent_token_usage`** exists in `supabase/migrations/20250101T000001_create_mmagent_tables.sql`
  - Fields: `id`, `clerk_user_id`, `date`, `tokens_used`, `tokens_limit`, `last_reset_at`
  - Unique constraint: `(clerk_user_id, date)`
  - Index: `idx_mmagent_token_usage_user_date`
  - RLS policies: Users can view/insert/update their own records

### Service Functions
- ✅ **`getOrCreateTokenRecord()`** in `supabase/functions/_shared/mmagent-service.ts`
  - Uses RPC function `get_or_create_token_record`
  - Returns: `{ tokensUsed, tokensLimit, tokensRemaining }`
  - Tier-based limits: Gold (10k), Gold+ (25k)

- ✅ **`recordTokenUsage()`** in `supabase/functions/_shared/mmagent-service.ts`
  - Updates `mmagent_token_usage.tokens_used` by incrementing
  - Uses today's date (UTC-based)

### API Endpoints
- ✅ **`GET /functions/v1/mmagent-tokens`** in `supabase/functions/mmagent-tokens/index.ts`
  - Returns token balance for authenticated user

### Gaps vs Spec
- ❌ Missing model breakdown (`gpt4o_mini_tokens`, `claude_tokens`)
- ❌ Missing message counts (`messages_sent`, `conversations_active`)
- ❌ Missing cost tracking (`estimated_cost_pence`)
- ❌ Missing index on cost (`idx_token_cost`)
- ❌ Reset uses UTC date, not user's local timezone
- ❌ No timezone field in profiles table

---

## 2. Model Routing

### Existing Logic
- ✅ **`shouldUseClaude()`** in `supabase/functions/_shared/mmagent-service.ts`
  - Gold tier: Always returns `false` (GPT-4o-mini only)
  - Gold+ tier: Returns `true` when:
    - Emotional keywords present
    - Complexity keywords present
    - Message length > 200 chars

### Gaps vs Spec
- ❌ No off-peak routing (2-6 AM UTC → gpt-4o-mini for Gold+)
- ❌ No complexity scoring (should use `queryComplexity >= 0.7` for Claude)
- ❌ Routing logic is hardcoded, not data-driven from `governance_rules`

---

## 3. Abuse Prevention

### Existing
- ✅ **Topic validation** (`validateTopic()` in `mmagent-service.ts`)
  - Blocks off-topic categories (homework, business, coding, etc.)
  - Returns deflection messages
  - This is content-based, not abuse detection

### Gaps vs Spec
- ❌ No identical spam detection (>=10 identical messages)
- ❌ No bot behavior detection (<2 seconds between messages)
- ❌ No token hogging detection (>100 messages/day)
- ❌ No long message truncation (>500 words)
- ❌ No temporary blocking mechanism
- ❌ No flagging for review

---

## 4. Cost Monitoring & Alerts

### Existing
- ❌ No cost tracking
- ❌ No pricing map
- ❌ No alert system
- ❌ No email/Slack integration
- ❌ No cost dashboard

### Gaps vs Spec
- ❌ Missing `cost_alerts` table
- ❌ Missing alert thresholds (50%, 75%, 90%)
- ❌ Missing alert evaluation logic
- ❌ Missing notification infrastructure

---

## 5. Governance Rules

### Existing
- ❌ No `governance_rules` table
- ❌ No data-driven rule evaluation
- ❌ Rules are hardcoded in service functions

### Gaps vs Spec
- ❌ Missing table with fields: `rule_name`, `rule_type`, `conditions`, `action`, `priority`, `is_active`
- ❌ Missing default rules (daily_limit, spam_identical, long_conversation, large_message, offpeak_routing)

---

## 6. Admin Infrastructure

### Existing
- ✅ **Admin UI** exists: `src/pages/admin/AdminAnalyticsScreen.tsx`
- ✅ **Admin check hook**: `src/hooks/useAdminCheck.ts` (demo mode)
- ✅ **Admin setup docs**: `docs/ADMIN_SETUP.md`

### Gaps vs Spec
- ❌ No governance rules management UI
- ❌ No cost dashboard in admin
- ❌ No alert management UI
- ❌ No token usage analytics per user

---

## 7. Integration Points

### Existing MMAgent Flow
- ✅ `MMAgentMessageHandler.handleMessage()` in `supabase/functions/_shared/mmagent-handler.ts`
  - Flow: Topic validation → Token check → Model selection → AI call → Token recording

### Gaps vs Spec
- ❌ No abuse checks before AI call
- ❌ No token deduction BEFORE AI call (currently deducts after)
- ❌ No daily limit blocking (currently allows even if over limit)
- ❌ No warning at >=80% usage
- ❌ No upgrade CTA for Gold users

---

## 8. APIs

### Existing
- ✅ `GET /functions/v1/mmagent-tokens` - Token balance

### Gaps vs Spec
- ❌ Missing `GET /api/governance/tokens/balance` (enhanced version)
- ❌ Missing `GET /api/governance/cost/summary`
- ❌ Missing `GET/PUT /api/admin/governance/rules`
- ❌ Missing `GET /api/admin/governance/alerts`
- ❌ Missing `GET /api/admin/governance/cost/dashboard`

---

## Summary: What Exists vs What's Missing

### ✅ Exists
1. Basic token tracking table (`mmagent_token_usage`)
2. Token record creation/retrieval functions
3. Basic model routing (Gold vs Gold+)
4. Topic validation (content-based)
5. Admin UI infrastructure (basic)
6. Token balance API endpoint

### ❌ Missing (Must Implement)
1. **Database:**
   - Enhanced `token_usage` table (or migrate `mmagent_token_usage` to match spec)
   - `governance_rules` table with defaults
   - `cost_alerts` table with defaults
   - Cost tracking fields and indexes

2. **Services:**
   - `TokenGovernanceService` with `checkAndDeductTokens()` (pre-call)
   - `AbuseDetectionService` (spam, bot, token hogging, long messages)
   - Enhanced model routing with off-peak and complexity scoring
   - Cost calculation and pricing map
   - Alert evaluation and notification system

3. **Integration:**
   - Abuse checks in MMAgent flow (before AI call)
   - Token deduction BEFORE AI call
   - Daily limit blocking with user-friendly messages
   - Warning at >=80% usage
   - Upgrade CTAs

4. **APIs:**
   - Enhanced balance endpoint
   - Cost summary endpoint
   - Admin governance endpoints

5. **Admin UI:**
   - Governance rules management
   - Cost dashboard with trends
   - Alert management
   - Per-user cost analytics

6. **Testing:**
   - Unit tests for governance services
   - Integration tests for abuse detection
   - E2E tests for limit enforcement

---

## Implementation Strategy

### Phase 1: Database Migrations
1. Create `token_usage` table (or enhance `mmagent_token_usage`)
2. Create `governance_rules` table with default rules
3. Create `cost_alerts` table with default alerts
4. Add RLS policies
5. Create helper functions for timezone handling (default to UTC, TODO for user timezone)

### Phase 2: Service Layer
1. Create `TokenGovernanceService` in `supabase/functions/_shared/`
2. Create `AbuseDetectionService` in `supabase/functions/_shared/`
3. Create pricing map and cost calculation utilities
4. Implement alert evaluation logic

### Phase 3: Integration
1. Update `MMAgentMessageHandler` to use governance services
2. Add abuse checks before AI call
3. Add token deduction before AI call
4. Add blocking/warning logic

### Phase 4: APIs
1. Create governance endpoints (balance, cost)
2. Create admin endpoints (rules, alerts, dashboard)

### Phase 5: Admin UI
1. Add governance rules management
2. Add cost dashboard
3. Add alert management

### Phase 6: Testing
1. Unit tests
2. Integration tests
3. E2E tests

---

## Migration Strategy for `mmagent_token_usage`

**Option A (Preferred):** Enhance existing table
- Add missing columns to `mmagent_token_usage`
- Migrate data if needed
- Update all references

**Option B:** Create new `token_usage` table
- Keep `mmagent_token_usage` for backward compatibility
- Create mapping layer
- Migrate gradually

**Decision:** Use Option A - enhance `mmagent_token_usage` to match spec, as it's already in use and simpler.

---

## Notes

- Timezone handling: No timezone field exists in profiles. Will use UTC as default and add TODO for future enhancement.
- Admin role: Currently uses demo mode. Will use service role for admin endpoints (server-only access).
- Email/Slack: Will implement stub that logs clearly and writes to `cost_alerts.last_triggered_at` for easy wiring later.
