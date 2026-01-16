# Token Governance Implementation

## Overview

This document describes the implementation of TASK 7A: Chat Token Governance, which provides API cost control and abuse prevention for the MMAgent chat system.

## Architecture

### Database Schema

#### Enhanced `mmagent_token_usage` Table
- Added columns: `gpt4o_mini_tokens`, `claude_tokens`, `messages_sent`, `conversations_active`, `estimated_cost_pence`
- Index on `estimated_cost_pence` for cost queries
- Maintains backward compatibility with existing token tracking

#### `governance_rules` Table
- Data-driven rule configuration
- Rule types: `daily_limit`, `spam`, `message_size`, `rate_limit`, `routing`
- Actions: `warn`, `throttle`, `block`, `route_cheap`, `summarize`, `truncate`
- Priority-based evaluation
- Default rules seeded on migration

#### `cost_alerts` Table
- Threshold-based alerting (50%, 75%, 90%)
- Email and Slack notification support
- Prevents duplicate alerts via `last_triggered_at`

#### `abuse_flags` Table
- Audit log for abuse detection events
- Tracks spam, bot behavior, and other violations

### Service Layer

#### TokenGovernanceService (`token-governance-service.ts`)

**Functions:**
- `getTodayUsage()`: Gets or creates daily token usage record
- `checkAndDeductTokens()`: Pre-call token check and deduction
  - Returns: `allowed`, `tokens_remaining`, `percent_used`, `warning`, `blocked`, `reason`, `suggestion`
  - Blocks if daily limit exceeded
  - Warns at >=80% usage
- `routeModel()`: Smart model routing
  - Gold: Always GPT-4o-mini
  - Gold+: Off-peak (2-6 AM UTC) → GPT-4o-mini, complexity >= 0.7 → Claude, else GPT-4o-mini
- `estimateQueryComplexity()`: Scores query complexity (0.0-1.0)
- `recordActualUsage()`: Records actual token usage after AI call

**Pricing Map:**
- GPT-4o-mini: $0.15/1k input, $0.60/1k output
- Claude 3.5 Sonnet: $3.00/1k input, $15.00/1k output
- Costs stored in pence (GBP)

#### AbuseDetectionService (`abuse-detection-service.ts`)

**Functions:**
- `checkIdenticalSpam()`: Detects >=10 identical messages in 1 hour → block + flag
- `checkBotBehavior()`: Detects <2 seconds between messages → temporary block
- `checkTokenHogging()`: Detects >100 messages/day → warn then throttle
- `checkLongMessage()`: Detects >500 words → truncate with notice
- `performAbuseChecks()`: Runs all checks in sequence

#### AlertService (`alert-service.ts`)

**Functions:**
- `evaluateCostAlerts()`: Compares daily spend to thresholds
- Triggers email/Slack notifications (stub implementation)
- Updates `last_triggered_at` to prevent spam

### Integration Points

#### MMAgentMessageHandler Updates

**New Flow:**
1. Topic validation (existing)
2. **Abuse checks** (NEW - before AI call)
3. **Token deduction** (NEW - before AI call, not after)
4. Model routing (enhanced with complexity scoring)
5. AI call
6. Message persistence
7. Memory storage (Gold+)

**Blocking Behavior:**
- If abuse detected → return blocked response immediately
- If daily limit exceeded → return user-friendly message with upgrade CTA
- If warning threshold (>=80%) → include warning in response

### API Endpoints

#### User-Facing
- `GET /functions/v1/governance-tokens`: Token balance, percent used, tier, reset time
- `GET /functions/v1/governance-cost`: Daily cost summary, per-model breakdown

#### Admin-Only (Service Role)
- `GET /functions/v1/admin-governance-rules`: List all governance rules
- `PUT /functions/v1/admin-governance-rules`: Update rule (enable/disable, modify conditions)
- `GET /functions/v1/admin-governance-alerts`: List all cost alerts
- `GET /functions/v1/admin-governance-cost`: Cost dashboard (daily/weekly/monthly trends, top users)

### Rule Evaluation

Rules are evaluated by priority (lower = higher priority):

1. **daily_limit_block** (priority 5): Blocks when 100% limit reached
2. **daily_limit_warning** (priority 10): Warns at 80% usage
3. **spam_identical** (priority 20): Blocks after 10 identical messages
4. **long_conversation** (priority 30): Summarizes after 100 messages/day
5. **large_message** (priority 40): Truncates messages >500 words
6. **offpeak_routing** (priority 50): Routes to cheap model during off-peak hours

Rules can be enabled/disabled via admin API without code changes.

### Model Routing Logic

**Gold Tier:**
- Always: `gpt-4o-mini`

**Gold+ Tier:**
1. Check off-peak hours (2-6 AM UTC) → `gpt-4o-mini`
2. Check complexity score (>= 0.7) → `claude-3-5-sonnet-20241022`
3. Check emotional/complex keywords → `claude-3-5-sonnet-20241022`
4. Default: `gpt-4o-mini`

**Complexity Scoring:**
- Base: 0.3
- +0.3 for emotional keywords
- +0.2 for complex keywords
- +0.2 for matching-related keywords
- +0.1 for message length >200 chars
- +0.1 for message length >500 chars
- Capped at 1.0

### Cost Calculation

**Formula:**
```
cost_pence = (input_tokens / 1000) * input_price_per_1k * 100 +
             (output_tokens / 1000) * output_price_per_1k * 100
```

**Tracking:**
- Estimated cost deducted before AI call
- Actual cost can be updated after AI call (if API returns token counts)
- Costs aggregated per model for reporting

### Alert Thresholds

Default alerts configured at:
- **50%**: Early warning
- **75%**: Moderate warning
- **90%**: Critical warning

Alerts trigger once per day per threshold (via `last_triggered_at` check).

### Timezone Handling

**Current Implementation:**
- Uses UTC date for daily reset (midnight UTC)
- TODO: Add timezone field to profiles table for user-local reset

**Future Enhancement:**
- Store user timezone in profiles
- Calculate user-local midnight for reset
- Update `getTodayUsage()` to use user timezone

### Admin Dashboard

**Features:**
- Today's total cost
- Cost breakdown by model
- Top N users by cost
- Daily trend chart (last 7-14 days)
- Governance rules list with enable/disable
- Alert thresholds and last triggered time

**Access:**
- Service role only (server-side)
- Not exposed directly to client
- Admin UI can call these endpoints with proper authentication

## Configuration

### Adjusting Thresholds

**Token Limits:**
- Edit `token-governance-service.ts`: `getTodayUsage()` function
- Gold: 10,000/day
- Gold+: 25,000/day

**Abuse Detection:**
- Edit `abuse-detection-service.ts`:
  - Spam threshold: `identicalCount >= 10`
  - Bot threshold: `timeSince < 2000` (2 seconds)
  - Message limit: `messagesToday >= 100`
  - Long message: `wordCount > 500`

**Alert Thresholds:**
- Edit `cost_alerts` table via admin API or SQL
- Default: 50%, 75%, 90%

**Pricing:**
- Edit `PRICING_MAP` in `token-governance-service.ts`
- Update when API pricing changes

### Enabling/Disabling Rules

Via Admin API:
```typescript
PUT /functions/v1/admin-governance-rules
{
  "id": "rule-id",
  "is_active": false
}
```

Or via SQL:
```sql
UPDATE governance_rules SET is_active = false WHERE rule_name = 'spam_identical';
```

## Testing

### Unit Tests

**TokenGovernanceService:**
- Gold vs Gold+ limits (10k/25k)
- Daily limit blocking
- Warning at >=80%
- Model routing (gold always cheap, gold+ complexity/offpeak)
- Cost calculation

**AbuseDetectionService:**
- Identical spam detection (>=10)
- Bot behavior (<2 seconds)
- Token hogging (>100 messages)
- Long message truncation (>500 words)

### Integration Tests

- End-to-end flow: message → abuse check → token deduction → AI call → recording
- Blocking behavior when limit exceeded
- Warning messages at threshold
- Model routing based on tier and complexity

### Manual Testing

1. **Daily Limit:**
   - Send messages until limit reached
   - Verify blocking message
   - Verify upgrade CTA for Gold users

2. **Abuse Detection:**
   - Send 10 identical messages → should block
   - Send messages <2 seconds apart → should block
   - Send >100 messages/day → should warn then throttle
   - Send >500 word message → should truncate

3. **Model Routing:**
   - Gold user → always GPT-4o-mini
   - Gold+ user during off-peak → GPT-4o-mini
   - Gold+ user with complex query → Claude
   - Gold+ user with simple query → GPT-4o-mini

4. **Cost Tracking:**
   - Verify costs accumulate correctly
   - Verify per-model breakdown
   - Verify alert triggers at thresholds

## Monitoring

### Key Metrics

- Daily token usage per tier
- Cost per model
- Abuse detection events
- Alert trigger frequency
- Top users by cost

### Logging

- Abuse flags logged to `abuse_flags` table
- Alert triggers logged to console (email/Slack stubs)
- Cost calculations logged for debugging

## Future Enhancements

1. **User Timezone Support:**
   - Add timezone to profiles table
   - Implement user-local midnight reset

2. **Advanced Abuse Detection:**
   - ML-based bot detection
   - Pattern recognition for spam
   - Rate limiting per IP

3. **Cost Optimization:**
   - Automatic model downgrade when approaching limit
   - Conversation summarization for long threads
   - Caching for repeated queries

4. **Alert Enhancements:**
   - Real email/Slack integration
   - Alert escalation
   - Custom alert thresholds per user tier

5. **Admin UI:**
   - Visual rule editor
   - Cost trend charts
   - User-level cost analytics
   - Alert management interface

## Troubleshooting

### "Daily limit exceeded" but user has tokens remaining
- Check timezone: reset happens at midnight UTC
- Check tier: verify subscription tier is correct
- Check token calculation: verify estimated vs actual tokens

### Abuse detection too aggressive
- Adjust thresholds in `abuse-detection-service.ts`
- Disable specific rules via admin API
- Check `abuse_flags` table for false positives

### Alerts not triggering
- Verify `cost_alerts.is_active = true`
- Check `last_triggered_at` (alerts trigger once per day)
- Verify daily budget calculation
- Check alert service logs

### Model routing incorrect
- Verify tier detection
- Check complexity scoring
- Verify off-peak hours (2-6 AM UTC)
- Check rule conditions in `governance_rules` table
