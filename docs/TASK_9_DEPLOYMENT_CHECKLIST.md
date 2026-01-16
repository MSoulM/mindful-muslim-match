# TASK 9: Content Originality System - Deployment Checklist

**Status:** Ready for Deployment  
**Created:** 2026-01-16  
**Estimated Deployment Time:** 30 minutes

---

## Pre-Deployment Validation

### ✅ Code Review
- [ ] All 11 new files reviewed
- [ ] All 3 modified files reviewed  
- [ ] No sensitive data exposed in code
- [ ] OPENAI_API_KEY usage verified (env var only)

### ✅ Testing
- [ ] Unit tests pass locally: `npm test src/tests/originality.test.ts`
- [ ] No TypeScript errors: `npm run type-check`
- [ ] No linter errors: `npm run lint`
- [ ] Manual integration test completed (see below)

---

## Deployment Steps

### STEP 1: Database Migration (5 minutes)

**Environment:** Staging first, then Production

```bash
cd supabase
npx supabase migration up
```

**Verify migration success:**
```sql
-- Check new columns exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'mysoul_dna_scores' 
  AND column_name LIKE 'content_originality%';

-- Expected: 3 rows
-- content_originality_score
-- content_originality_percentile
-- content_originality_calculated_at

-- Check cache table exists
SELECT * FROM content_similarity_cache LIMIT 0;

-- Check RPC functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('calculate_originality_percentiles', 'is_originality_cache_valid');

-- Expected: 2 rows

-- Check trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'trg_invalidate_originality_cache';

-- Expected: 1 row
```

**Rollback Plan (if needed):**
```sql
-- Undo migration manually
DROP TRIGGER IF EXISTS trg_invalidate_originality_cache ON posts;
DROP FUNCTION IF EXISTS invalidate_originality_cache_on_delete();
DROP FUNCTION IF EXISTS is_originality_cache_valid(TEXT);
DROP FUNCTION IF EXISTS calculate_originality_percentiles();
DROP TABLE IF EXISTS content_similarity_cache;
ALTER TABLE mysoul_dna_scores DROP COLUMN IF EXISTS content_originality_score;
ALTER TABLE mysoul_dna_scores DROP COLUMN IF EXISTS content_originality_percentile;
ALTER TABLE mysoul_dna_scores DROP COLUMN IF EXISTS content_originality_calculated_at;
```

---

### STEP 2: Deploy Edge Functions (10 minutes)

**Deploy updated weekly-batch function:**
```bash
npx supabase functions deploy weekly-batch
```

**Deploy new dna-originality function:**
```bash
npx supabase functions deploy dna-originality
```

**Verify deployment:**
```bash
npx supabase functions list
```

Expected output:
```
- weekly-batch (deployed)
- dna-originality (deployed)
```

**Test API endpoint (staging):**
```bash
curl -X GET 'https://<project-ref>.supabase.co/functions/v1/dna-originality' \
  -H 'Authorization: Bearer <USER_JWT_TOKEN>' \
  -H 'Content-Type: application/json'
```

Expected response:
```json
{
  "score": 50,
  "percentile": null,
  "label": "Moderately Original",
  "last_calculated_at": null,
  "tooltip": "How unique your perspective is compared to others"
}
```

---

### STEP 3: Deploy Frontend (10 minutes)

**Build and deploy:**
```bash
npm run build
npm run deploy  # or your deployment command
```

**Verify files deployed:**
- [ ] `src/services/originality/embeddings.ts`
- [ ] `src/services/originality/calculator.ts`
- [ ] `src/hooks/useOriginality.ts`
- [ ] `src/components/profile/MySoulDNA.tsx` (updated)

**Check UI in staging:**
1. Log in as test user
2. Navigate to profile screen
3. Verify MySoul DNA card shows
4. Verify "Content Originality" section appears (if data exists)
5. Hover over originality section → verify tooltip shows

---

### STEP 4: Run Initial Batch (5 minutes)

**Trigger manual batch run:**
```bash
curl -X POST 'https://<project-ref>.supabase.co/functions/v1/weekly-batch' \
  -H 'Authorization: Bearer <SERVICE_ROLE_KEY>' \
  -H 'Content-Type: application/json' \
  -d '{"run_type": "manual"}'
```

**Monitor logs:**
```bash
npx supabase functions logs weekly-batch --tail
```

**Look for:**
```
[Weekly Batch] Phase 2.5: Content Originality Calculation
[Originality Batch] Starting originality calculation batch
[Originality Batch] Processing X users
[Originality Batch] Processed 10/X users
[Originality Batch] Calculating percentiles
[Originality Batch] Completed: X processed, 0 failed
```

**Verify data populated:**
```sql
-- Check originality scores populated
SELECT COUNT(*) 
FROM mysoul_dna_scores 
WHERE content_originality_score IS NOT NULL;

-- Check cache populated
SELECT COUNT(*) FROM content_similarity_cache;

-- Check percentiles calculated
SELECT COUNT(*) 
FROM mysoul_dna_scores 
WHERE content_originality_percentile IS NOT NULL;

-- Sample scores
SELECT 
  user_id,
  content_originality_score,
  content_originality_percentile,
  content_originality_calculated_at
FROM mysoul_dna_scores
WHERE content_originality_score IS NOT NULL
LIMIT 10;
```

---

## Post-Deployment Validation

### Test Scenario 1: New User Flow
1. Create test user account
2. Share 2 posts
3. Check originality score → Should be 50 (default)
4. Share 3rd post
5. Run batch: `POST /functions/v1/weekly-batch`
6. Check originality score → Should be calculated (≠ 50)

### Test Scenario 2: Cache Behavior
1. Run batch for user with 5 posts
2. Note processing time in logs (e.g., 3 seconds)
3. Run batch again immediately (no new content)
4. Check logs → Should show cache hit (< 10ms)
5. Add new post for that user
6. Run batch again
7. Check logs → Should show cache miss + recalculation

### Test Scenario 3: Deletion Flow
1. User has score 75
2. User deletes one post
3. Run batch
4. Verify score recalculated (may change slightly)
5. Check cache: `SELECT valid_until FROM content_similarity_cache WHERE user_id = '...'`
   - Should be updated to recent timestamp

### Test Scenario 4: UI Display
1. Log in as user with calculated originality
2. Go to profile screen
3. Check MySoul DNA card
4. Verify originality section shows:
   - ✅ Score (0–100)
   - ✅ Label (e.g., "Highly Original")
   - ✅ Percentile (e.g., "Top 32%")
   - ✅ Lightbulb icon
   - ✅ Tooltip on hover

### Test Scenario 5: API Endpoint
```bash
# Test with valid JWT
curl -X GET 'https://<project-ref>.supabase.co/functions/v1/dna-originality' \
  -H 'Authorization: Bearer <VALID_JWT>'

# Expected: 200 OK with score data

# Test without auth
curl -X GET 'https://<project-ref>.supabase.co/functions/v1/dna-originality'

# Expected: 401 Unauthorized
```

---

## Monitoring Setup

### CloudWatch / Supabase Logs

**Create alert: Batch Duration**
```
Condition: weekly-batch duration > 45 minutes
Action: Send email to backend-team@example.com
```

**Create alert: Failed Users**
```
Condition: originality failed count > 10% of processed count
Action: Send Slack notification to #backend-alerts
```

**Create dashboard panel: Originality Metrics**
- Batch processing duration (Phase 2.5)
- Cache hit rate (%)
- Average originality score
- Score distribution histogram

---

## Rollback Procedure (if critical issues)

### STEP 1: Disable Originality Batch Processing

**Edit `weekly-batch/index.ts`:**
```typescript
// Comment out Phase 2.5
/*
console.log(`[Weekly Batch] Phase 2.5: Content Originality Calculation`);
try {
  const originalityResult = await processOriginalityBatch(supabase);
  // ...
} catch (error) {
  // ...
}
*/
```

**Redeploy:**
```bash
npx supabase functions deploy weekly-batch
```

### STEP 2: Hide UI Display

**Edit `MySoulDNA.tsx`:**
```typescript
// Comment out originality section
{/* !originalityLoading && originality && (
  <motion.div>
    ...
  </motion.div>
) */}
```

**Redeploy frontend**

### STEP 3: Rollback Migration (if database issues)

See "Rollback Plan" in STEP 1 above.

---

## Success Criteria

- [ ] ✅ Migration applied successfully (no errors)
- [ ] ✅ Edge functions deployed (weekly-batch, dna-originality)
- [ ] ✅ Frontend deployed (UI shows originality)
- [ ] ✅ Initial batch run completed (Phase 2.5 executed)
- [ ] ✅ Cache table populated (> 0 rows)
- [ ] ✅ Percentiles calculated (> 0 rows with non-null percentile)
- [ ] ✅ API endpoint returns valid data with auth
- [ ] ✅ UI displays originality correctly
- [ ] ✅ All 5 test scenarios pass
- [ ] ✅ Monitoring alerts configured

**If all checked:** 🎉 **Deployment Successful!**

---

## Support Contacts

**Backend Team Lead**: [Name] - [Email]  
**DevOps**: [Name] - [Email]  
**On-Call Engineer**: Check PagerDuty rotation

**Documentation**:
- Implementation Guide: `docs/content_originality_implementation.md`
- Summary: `docs/TASK_9_IMPLEMENTATION_SUMMARY.md`
- This Checklist: `docs/TASK_9_DEPLOYMENT_CHECKLIST.md`

---

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Sign-Off:** _____________
