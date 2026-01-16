# Token Governance Testing Guide

## Test Coverage

### 1. Token Limits & Reset

**Test: Gold Tier Limit (10,000 tokens/day)**
1. Create Gold tier user
2. Send messages until tokens approach 10,000
3. Verify warning appears at >=80% (8,000 tokens)
4. Verify blocking message at 100% (10,000 tokens)
5. Verify upgrade CTA for Gold users

**Test: Gold+ Tier Limit (25,000 tokens/day)**
1. Create Gold+ tier user
2. Send messages until tokens approach 25,000
3. Verify warning at >=80% (20,000 tokens)
4. Verify blocking at 100% (25,000 tokens)

**Test: Daily Reset**
1. Exhaust daily limit
2. Wait until next day (midnight UTC)
3. Verify tokens reset to full limit
4. Verify can send messages again

### 2. Model Routing

**Test: Gold Tier Routing**
1. Send various message types (simple, complex, emotional)
2. Verify all messages use GPT-4o-mini
3. Check `mmagent_token_usage.gpt4o_mini_tokens` increments
4. Verify `claude_tokens` remains 0

**Test: Gold+ Tier - Off-Peak Routing**
1. Set system time to 2-6 AM UTC
2. Send message as Gold+ user
3. Verify GPT-4o-mini is used (not Claude)
4. Check routing logic respects off-peak hours

**Test: Gold+ Tier - Complexity Routing**
1. Send message with complexity score >= 0.7
   - Use emotional keywords: "sad", "anxious", "worried"
   - Use complex keywords: "complex", "complicated", "difficult"
   - Include matching keywords: "match", "compatibility", "decision"
   - Long message (>200 chars)
2. Verify Claude 3.5 Sonnet is used
3. Check `claude_tokens` increments

**Test: Gold+ Tier - Default Routing**
1. Send simple message (<200 chars, no keywords)
2. Verify GPT-4o-mini is used (default)
3. Verify complexity score < 0.7

### 3. Abuse Detection

**Test: Identical Spam Detection**
1. Send same message 10+ times within 1 hour
2. Verify blocking on 10th identical message
3. Verify `abuse_flags` table has entry
4. Verify user-friendly error message

**Test: Bot Behavior Detection**
1. Send two messages <2 seconds apart
2. Verify temporary block
3. Verify warning message
4. Wait 2+ seconds, verify can send again

**Test: Token Hogging**
1. Send 100 messages in one day
2. Verify warning at 100th message
3. Verify throttle on 101st message
4. Verify user-friendly message

**Test: Long Message Truncation**
1. Send message >500 words
2. Verify message truncated to 500 words
3. Verify notice message included
4. Verify truncated content used for AI call

### 4. Cost Tracking

**Test: Cost Calculation**
1. Send message using GPT-4o-mini
2. Verify `estimated_cost_pence` increments
3. Verify `gpt4o_mini_tokens` increments
4. Calculate: cost should match pricing map

**Test: Per-Model Cost Breakdown**
1. Send messages using both models (Gold+ user)
2. Verify separate tracking:
   - `gpt4o_mini_tokens` and cost
   - `claude_tokens` and cost
3. Verify total cost = sum of both

**Test: Cost API**
1. Call `GET /functions/v1/governance-cost`
2. Verify response includes:
   - `daily_cost_pence`
   - `daily_cost_gbp`
   - `per_model` breakdown
3. Verify calculations are correct

### 5. Alert System

**Test: Alert Thresholds**
1. Set daily budget to 1000 pence (£10)
2. Send messages until cost reaches:
   - 500 pence (50%) → verify alert triggers
   - 750 pence (75%) → verify alert triggers
   - 900 pence (90%) → verify alert triggers
3. Verify `cost_alerts.last_triggered_at` updates
4. Verify alerts don't trigger twice same day

**Test: Alert Notifications**
1. Configure email recipient
2. Trigger alert
3. Verify email stub logs message
4. Configure Slack webhook
5. Verify Slack stub sends message

### 6. Governance Rules

**Test: Rule Evaluation Priority**
1. Verify rules evaluated by priority (lower = higher)
2. Test daily_limit_block (priority 5) blocks before warning
3. Test spam_identical (priority 20) blocks after limit checks

**Test: Enable/Disable Rules**
1. Via admin API: disable `spam_identical` rule
2. Send 10 identical messages
3. Verify NOT blocked (rule disabled)
4. Re-enable rule
5. Verify blocking works again

**Test: Rule Conditions**
1. Modify `large_message` rule condition (change max_words)
2. Verify new threshold applies
3. Test with message at new threshold

### 7. Integration Tests

**Test: End-to-End Flow**
1. Send message as Gold user
2. Verify flow:
   - Topic validation ✓
   - Abuse checks ✓
   - Token deduction (before AI) ✓
   - Model routing (GPT-4o-mini) ✓
   - AI call ✓
   - Message persistence ✓
   - Token recording ✓
3. Verify response includes warning if >=80%

**Test: Blocking Behavior**
1. Exhaust daily limit
2. Send another message
3. Verify:
   - No AI call made
   - User-friendly blocking message
   - Upgrade CTA (for Gold users)
   - Tokens not deducted

**Test: Warning Behavior**
1. Use 80% of daily limit
2. Send message
3. Verify:
   - AI call proceeds
   - Warning included in response
   - Tokens deducted
   - Upgrade CTA (for Gold users)

### 8. Admin Dashboard

**Test: Cost Dashboard**
1. Access admin governance screen
2. Verify displays:
   - Total cost (daily/weekly/monthly)
   - Per-model breakdown
   - Top users by cost
   - Daily trends
3. Switch between periods (daily/weekly/monthly)
4. Verify data updates correctly

**Test: Governance Rules Management**
1. View all rules
2. Toggle rule enable/disable
3. Verify rule status updates
4. Verify changes persist

**Test: Alert Management**
1. View all alerts
2. Verify threshold percentages
3. Verify last triggered times
4. Verify email recipients

## Manual Test Scripts

### Script 1: Daily Limit Test
```bash
# As Gold user
1. Check token balance: GET /functions/v1/governance-tokens
2. Send messages until 8,000 tokens used
3. Verify warning appears
4. Continue until 10,000 tokens
5. Verify blocking message
6. Verify upgrade CTA
```

### Script 2: Abuse Detection Test
```bash
# Spam test
1. Send same message 10 times rapidly
2. Verify block on 10th message
3. Check abuse_flags table

# Bot test
1. Send message
2. Immediately send another (<2 seconds)
3. Verify temporary block
4. Wait 2+ seconds
5. Verify can send again
```

### Script 3: Model Routing Test
```bash
# Gold+ user
1. Send simple message → verify GPT-4o-mini
2. Send emotional message → verify Claude
3. Set time to 3 AM UTC → send message → verify GPT-4o-mini (off-peak)
4. Send complex matching query → verify Claude
```

## Automated Test Examples

### Unit Test: TokenGovernanceService
```typescript
describe('checkAndDeductTokens', () => {
  it('blocks when daily limit exceeded', async () => {
    const result = await checkAndDeductTokens(
      supabase,
      userId,
      'gold',
      15000, // exceeds 10k limit
      'gpt-4o-mini'
    );
    expect(result.allowed).toBe(false);
    expect(result.blocked).toBe(true);
    expect(result.reason).toContain('Daily token limit exceeded');
  });

  it('warns at >=80% usage', async () => {
    // Setup: user has used 8,000 of 10,000 tokens
    const result = await checkAndDeductTokens(
      supabase,
      userId,
      'gold',
      1000,
      'gpt-4o-mini'
    );
    expect(result.warning).toBeDefined();
    expect(result.warning).toContain('80%');
  });
});
```

### Unit Test: AbuseDetectionService
```typescript
describe('checkIdenticalSpam', () => {
  it('blocks after 10 identical messages', async () => {
    // Setup: send 9 identical messages
    for (let i = 0; i < 9; i++) {
      await saveMessage(userId, 'test message');
    }
    
    const result = await checkIdenticalSpam(
      supabase,
      userId,
      'test message',
      sessionId
    );
    
    expect(result.allowed).toBe(false);
    expect(result.blocked).toBe(true);
  });
});
```

### Integration Test: Full Flow
```typescript
describe('MMAgentMessageHandler', () => {
  it('blocks when limit exceeded', async () => {
    // Setup: exhaust daily limit
    await exhaustDailyLimit(userId);
    
    const handler = new MMAgentMessageHandler(supabase, userId);
    const response = await handler.handleMessage({
      sessionId: 'test-session',
      content: 'test message',
      clerkUserId: userId
    });
    
    expect(response.blocked).toBe(true);
    expect(response.message).toContain('limit exceeded');
  });
});
```

## Performance Testing

### Load Test: Abuse Detection
- Send 100 messages rapidly
- Verify spam detection triggers
- Verify no performance degradation
- Verify database queries optimized

### Load Test: Cost Calculation
- Process 1000 messages
- Verify cost calculations accurate
- Verify no race conditions
- Verify database updates atomic

## Edge Cases

1. **Timezone Edge Cases**
   - User in timezone where reset happens at different time
   - Verify UTC-based reset works correctly

2. **Concurrent Requests**
   - Send multiple messages simultaneously
   - Verify token deduction is atomic
   - Verify no double-counting

3. **Rule Disabled During Evaluation**
   - Disable rule mid-request
   - Verify current request completes
   - Verify next request respects disabled rule

4. **Alert Race Conditions**
   - Multiple alerts trigger simultaneously
   - Verify only one notification sent
   - Verify `last_triggered_at` updates correctly

## Verification Checklist

- [ ] Gold tier: 10k limit enforced
- [ ] Gold+ tier: 25k limit enforced
- [ ] Warning at >=80% usage
- [ ] Blocking at 100% usage
- [ ] Upgrade CTA for Gold users
- [ ] Gold: always GPT-4o-mini
- [ ] Gold+: off-peak routing (2-6 AM UTC)
- [ ] Gold+: complexity routing (>=0.7)
- [ ] Spam detection: 10 identical messages
- [ ] Bot detection: <2 seconds between messages
- [ ] Token hogging: >100 messages/day
- [ ] Long message: >500 words truncated
- [ ] Cost tracking per model
- [ ] Alerts trigger at thresholds
- [ ] Admin dashboard displays data
- [ ] Rules can be enabled/disabled
- [ ] Daily reset works correctly
