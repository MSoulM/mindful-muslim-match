# DNA Batch Processing System

**Version:** 1.0.0  
**Last Updated:** 2026-01-16  
**Status:** ✅ Fully Implemented

---

## Overview

The DNA Batch Processing System is the "engine room" of MatchMe v2.0, running weekly on Sunday mornings (2–7 AM UTC) to analyze shared content, generate insights, recalculate MySoul DNA scores, and produce weekly matches with ChaiChat previews.

### Key Features

- ✅ **Automated Weekly Processing**: Scheduled via pg_cron
- ✅ **Job Queue with Retry Logic**: Exponential backoff for failed jobs
- ✅ **Content Deduplication**: SHA256 hash-based insight reuse
- ✅ **Token & Cost Tracking**: Monitors API usage per batch run
- ✅ **Admin Controls**: Manual triggers, retry failed jobs, view history
- ✅ **Scalable Architecture**: Processes jobs in batches with rate limiting
- ✅ **Comprehensive Monitoring**: Run history, error logs, queue status

---

## System Architecture

### 1. Database Schema

#### `batch_processing_queue`
Job queue with priority and retry support.

```sql
CREATE TABLE batch_processing_queue (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  job_type VARCHAR(30) CHECK IN (
    'content_analysis',
    'dna_recalculation',
    'match_generation',
    'embedding_update'
  ),
  payload JSONB NOT NULL,
  status VARCHAR(20) CHECK IN (
    'pending',
    'processing',
    'completed',
    'failed',
    'retry'
  ),
  priority INTEGER DEFAULT 5 (1=highest, 10=lowest),
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ DEFAULT now()
);
```

**Indexes:**
- `(status, priority DESC, scheduled_for ASC)` - Job retrieval
- `(user_id)` - User-specific queries
- `(job_type)` - Type filtering

#### `batch_run_history`
Tracks execution history, metrics, and errors.

```sql
CREATE TABLE batch_run_history (
  id UUID PRIMARY KEY,
  run_type VARCHAR(30) CHECK IN (
    'weekly_full',
    'daily_incremental',
    'manual'
  ),
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  total_jobs INTEGER DEFAULT 0,
  completed_jobs INTEGER DEFAULT 0,
  failed_jobs INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  api_cost_cents INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  status VARCHAR(20) CHECK IN (
    'running',
    'completed',
    'failed',
    'cancelled'
  ),
  error_log JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}'
);
```

#### `weekly_matches`
Stores top 5 weekly matches per user.

```sql
CREATE TABLE weekly_matches (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  match_user_id TEXT NOT NULL,
  score NUMERIC(5,2) CHECK (0-100),
  rank INTEGER CHECK (1-5),
  week_start_date DATE NOT NULL,
  compatibility_factors JSONB,
  chaichat_preview JSONB,
  batch_run_id UUID REFERENCES batch_run_history(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  viewed_at TIMESTAMPTZ,
  actioned_at TIMESTAMPTZ,
  UNIQUE (user_id, match_user_id, week_start_date)
);
```

#### `posts` (Extended)
Added fields for batch processing:

- `content_hash TEXT` - SHA256 for deduplication
- `processing_status VARCHAR(20)` - pending/processing/completed/failed/skipped
- `processed_at TIMESTAMPTZ` - Completion timestamp
- `analysis_result JSONB` - Cached insights for reuse
- `embedding vector(1536)` - pgvector for matching

---

## 2. Batch Processing Flow

### Weekly Schedule

**Cron Expression:** `0 2 * * 0` (Sunday 2:00 AM UTC)

**Total Duration Target:** <5 hours (2:00 AM - 7:00 AM)

### Processing Phases

```
Phase 1: Content Analysis (~2 hours)
  ├─ Load pending content_analysis jobs (limit 500)
  ├─ Check content_hash for deduplication
  ├─ Call OpenAI GPT-4o-mini (max_tokens: 300, temp: 0.3)
  ├─ Insert insights into user_insights (status: pending)
  ├─ Update posts.processing_status = 'completed'
  └─ Rate limit: 100ms sleep between calls

Phase 2: Embedding Generation (~1 hour)
  ├─ Load pending embedding_update jobs (limit 200)
  ├─ Generate embeddings via OpenAI text-embedding-ada-002
  ├─ Store in posts.embedding (vector 1536)
  └─ Rate limit: 100ms sleep between calls

Phase 3: DNA Recalculation (~30 minutes)
  ├─ Load pending dna_recalculation jobs (limit 1000)
  ├─ Query approved insights per user
  ├─ Calculate DNA strands:
  │   - Trait Uniqueness (35%): insights count × 5
  │   - Profile Completeness (25%): posts × 3 + insights × 2
  │   - Behavior (20%): avg depth × 25
  │   - Content (15%): posts × 2
  │   - Cultural (5%): 50 (placeholder)
  ├─ Determine rarity tier (Common → Legendary)
  └─ Upsert mysoul_dna_scores

Phase 4: Weekly Match Generation (~1 hour)
  ├─ Load all active users (limit 1000)
  ├─ For each user:
  │   ├─ Get user embedding vector
  │   ├─ Load match preferences
  │   ├─ Find top 50 candidates via pgvector similarity
  │   ├─ Score: (vector_sim × 0.6) + (preferences × 0.4)
  │   ├─ Select top 5 matches
  │   └─ Insert into weekly_matches
  └─ Rate limit: 100ms sleep per user

Phase 5: ChaiChat Previews (~30 minutes)
  ├─ Load matches without previews (limit 100)
  ├─ Generate Level 1-2 conversation starters
  ├─ Update weekly_matches.chaichat_preview
  └─ Rate limit: 100ms sleep between calls
```

### Error Handling & Retry Logic

**Retry Strategy:**
- Max attempts: 3
- Backoff: 2^(attempts) × 5 minutes (5min, 10min, 20min)
- Status transitions: `pending → processing → retry → failed`

**Failure Handling:**
1. Increment job.attempts
2. If attempts < max_attempts:
   - Set status = 'retry'
   - Set scheduled_for = now() + backoff
3. Else:
   - Set status = 'failed'
   - Store last_error
4. Append to run_history.error_log

---

## 3. Job Types

### Content Analysis
**Purpose:** Extract insights from user posts

**Payload:**
```json
{
  "userId": "clerk_user_id",
  "contentId": "post_uuid"
}
```

**Process:**
1. Load post by ID
2. Check content_hash for existing analysis
3. If exists: Reuse cached insights (0 tokens)
4. Else: Call OpenAI with CONTENT_ANALYSIS_PROMPT
5. Parse JSON response, extract insights
6. Insert into user_insights (status: pending)
7. Update post.processing_status = 'completed'

**Model:** GPT-4o-mini  
**Tokens:** ~300/call  
**Temperature:** 0.3

### DNA Recalculation
**Purpose:** Recalculate MySoul DNA scores from approved insights

**Payload:**
```json
{
  "userId": "clerk_user_id"
}
```

**Process:**
1. Query approved insights count
2. Query posts count and avg depth
3. Calculate weighted scores (see Phase 3)
4. Determine rarity tier
5. Upsert mysoul_dna_scores

**Model:** None (compute only)  
**Tokens:** 0

### Match Generation
**Purpose:** Generate top 5 weekly matches per user

**Payload:** None (batch-level job)

**Process:**
1. Get user's embedding vector
2. Load match preferences
3. pgvector cosine similarity search (top 50)
4. Apply preference filters
5. Score and rank matches
6. Insert top 5 into weekly_matches

**Model:** Claude 3.5 Sonnet (~10% complex cases)  
**Tokens:** Variable

### Embedding Update
**Purpose:** Generate vector embeddings for content

**Payload:**
```json
{
  "userId": "clerk_user_id",
  "contentId": "post_uuid"
}
```

**Process:**
1. Load post content
2. Concatenate caption + categories
3. Call OpenAI embeddings API
4. Store in posts.embedding

**Model:** text-embedding-ada-002  
**Tokens:** ~$0.13/1M tokens

---

## 4. API Endpoints

### POST `/functions/v1/batch-trigger`
**Auth:** Admin only  
**Purpose:** Manually trigger batch processing

**Request:**
```json
{
  "run_type": "manual" | "weekly_full" | "daily_incremental"
}
```

**Response:**
```json
{
  "success": true,
  "runId": "uuid",
  "duration": 1234,
  "stats": {
    "total_jobs": 500,
    "completed": 495,
    "failed": 5,
    "tokens_used": 150000,
    "api_cost_cents": 225
  }
}
```

### GET `/functions/v1/batch-status`
**Auth:** User  
**Purpose:** Get current batch status

**Response:**
```json
{
  "current_run": {
    "id": "uuid",
    "run_type": "weekly_full",
    "status": "running",
    "started_at": "2026-01-16T02:00:00Z",
    "completed_jobs": 120,
    "total_jobs": 500
  },
  "last_completed_run": {...},
  "queue_summary": {
    "pending": 380,
    "processing": 5,
    "retry": 2
  }
}
```

### GET `/functions/v1/batch-history?limit=20&offset=0`
**Auth:** User  
**Purpose:** Get batch run history

**Response:**
```json
{
  "history": [
    {
      "id": "uuid",
      "run_type": "weekly_full",
      "started_at": "2026-01-09T02:00:00Z",
      "completed_at": "2026-01-09T05:23:15Z",
      "total_jobs": 452,
      "completed_jobs": 448,
      "failed_jobs": 4,
      "tokens_used": 138000,
      "api_cost_cents": 207,
      "duration_seconds": 12195,
      "status": "completed"
    }
  ],
  "total": 8,
  "limit": 20,
  "offset": 0
}
```

### GET `/functions/v1/batch-queue?userId=clerk_user_id`
**Auth:** User (own queue only)  
**Purpose:** View user's pending/processing jobs

**Response:**
```json
{
  "queue": [
    {
      "id": "uuid",
      "job_type": "content_analysis",
      "status": "pending",
      "priority": 5,
      "attempts": 0,
      "scheduled_for": "2026-01-16T02:00:00Z",
      "created_at": "2026-01-15T12:00:00Z"
    }
  ],
  "userId": "clerk_user_id"
}
```

### POST `/functions/v1/batch-retry`
**Auth:** Admin only  
**Purpose:** Retry a failed job

**Request:**
```json
{
  "jobId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Job scheduled for retry",
  "job": {
    "id": "uuid",
    "status": "retry",
    "scheduled_for": "2026-01-16T03:00:00Z"
  }
}
```

---

## 5. Admin Configuration

### Environment Variables

**Required:**
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
ADMIN_USER_IDS=clerk_user_id_1,clerk_user_id_2
```

### Setting Admin User IDs

Option A: Environment Variable (Current)
```bash
# In Supabase Dashboard > Settings > Edge Functions > Secrets
ADMIN_USER_IDS=user_abc123,user_xyz789
```

Option B: Database Table (Future Enhancement)
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'moderator', 'user'))
);

INSERT INTO user_roles (user_id, role) VALUES ('clerk_user_id', 'admin');
```

---

## 6. Monitoring & Observability

### Key Metrics

**Performance Targets:**
- ✅ Total batch duration: <5 hours
- ✅ Failed jobs: <0.5%
- ✅ Token usage tracked per run
- ✅ Cost estimation: $0.15/1M tokens (GPT-4o-mini)

### Logging

**Edge Function Logs:**
```
[Weekly Batch] Starting weekly_full batch run
[Weekly Batch] Phase 1: Content Analysis
[Weekly Batch] Processing 485 jobs
[Weekly Batch] Content analysis job abc-123 failed: OpenAI timeout
[Weekly Batch] Phase 2: Embedding Updates
[Weekly Batch] Phase 3: DNA Recalculation
[Weekly Batch] Phase 4: Weekly Match Generation
[Weekly Batch] Phase 5: ChaiChat Previews
[Weekly Batch] Completed in 10234s. Tokens: 142000, Cost: $2.13
```

### Error Tracking

**View Recent Errors:**
```sql
SELECT 
  id,
  run_type,
  started_at,
  failed_jobs,
  error_log
FROM batch_run_history
WHERE status = 'completed'
  AND failed_jobs > 0
ORDER BY started_at DESC
LIMIT 10;
```

**View Failed Jobs:**
```sql
SELECT 
  id,
  user_id,
  job_type,
  attempts,
  last_error,
  created_at
FROM batch_processing_queue
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 50;
```

---

## 7. Scaling Considerations

### Current Limits

- Content analysis jobs: 500/run
- Embedding jobs: 200/run
- DNA recalculation jobs: 1000/run
- Match generation: 1000 users/run
- ChaiChat previews: 100/batch

### Scaling Strategy

**If queue grows beyond limits:**

1. **Increase Batch Frequency**
   - Add daily incremental runs (not just weekly)
   - Cron: `0 2 * * *` (every day at 2 AM)

2. **Parallel Processing**
   - Split jobs by user_id ranges
   - Run multiple edge function instances
   - Use Supabase Edge Function concurrency

3. **Priority Management**
   - Premium users: priority 1-3
   - Free users: priority 4-7
   - Low-priority tasks: priority 8-10

4. **Optimize Rate Limits**
   - Reduce sleep from 100ms to 50ms (2x throughput)
   - Use OpenAI batch API for embeddings (cheaper)

### Cost Projections

**10,000 Active Users (Weekly):**
- Content analysis: 50,000 jobs × 300 tokens × $0.15/1M = $2.25
- Embeddings: 50,000 × $0.13/1M = $6.50
- DNA recalc: 10,000 jobs (no cost)
- Match gen: 10,000 users (compute only)
- ChaiChat: 50,000 previews × 100 tokens × $0.15/1M = $0.75
- **Total:** ~$9.50/week = **$38/month**

---

## 8. Testing

### Unit Tests

Run tests:
```bash
cd supabase/functions/tests
deno test batch-processing.test.ts
```

**Test Coverage:**
- ✅ Queue insertion and status transitions
- ✅ Retry logic with exponential backoff
- ✅ Priority ordering
- ✅ Batch run history creation
- ✅ Error log appending
- ✅ Weekly matches insertion
- ✅ Unique constraint enforcement
- ✅ Content hash deduplication

### Manual Testing

**1. Insert Test Jobs:**
```sql
INSERT INTO batch_processing_queue (user_id, job_type, payload, priority)
VALUES 
  ('test_user_1', 'content_analysis', '{"userId":"test_user_1","contentId":"test_post_1"}', 5),
  ('test_user_1', 'dna_recalculation', '{"userId":"test_user_1"}', 3);
```

**2. Trigger Batch (Admin):**
```bash
curl -X POST https://your-project.supabase.co/functions/v1/batch-trigger \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"run_type":"manual"}'
```

**3. Check Status:**
```bash
curl https://your-project.supabase.co/functions/v1/batch-status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**4. View History:**
```sql
SELECT * FROM batch_run_history ORDER BY started_at DESC LIMIT 5;
```

---

## 9. Troubleshooting

### Issue: Batch Stuck in "Running" Status

**Symptoms:** current_run.status = 'running' for >6 hours

**Cause:** Edge function timeout or crash

**Solution:**
```sql
UPDATE batch_run_history
SET status = 'failed',
    completed_at = now(),
    error_log = jsonb_build_array(
      jsonb_build_object(
        'error', 'Batch timeout - manual intervention',
        'timestamp', now()
      )
    )
WHERE status = 'running'
  AND started_at < now() - INTERVAL '6 hours';
```

### Issue: High Failed Job Rate (>0.5%)

**Symptoms:** batch_run_history.failed_jobs > 0.5% of total_jobs

**Cause:** OpenAI API errors, rate limits, or malformed content

**Solution:**
1. Check error_log in batch_run_history
2. Retry failed jobs via admin endpoint
3. Increase max_attempts if transient errors
4. Fix data quality issues if consistent failures

### Issue: pg_cron Not Triggering

**Symptoms:** No batch runs on Sunday 2 AM UTC

**Verification:**
```sql
SELECT * FROM cron.job WHERE jobname = 'weekly-dna-batch-processing';
```

**Solution:**
```sql
-- Re-create cron job
SELECT cron.unschedule('weekly-dna-batch-processing');
SELECT cron.schedule(
  'weekly-dna-batch-processing',
  '0 2 * * 0',
  $$ SELECT net.http_post(...) $$
);
```

### Issue: OpenAI API Rate Limits

**Symptoms:** Many jobs failing with "Rate limit exceeded"

**Solution:**
1. Increase sleep between calls (100ms → 200ms)
2. Request rate limit increase from OpenAI
3. Batch embeddings via OpenAI Batch API
4. Spread processing across multiple days

---

## 10. Future Enhancements

### Planned Features

1. **Incremental Processing**
   - Daily content analysis for new posts
   - Weekly full recalculation remains

2. **Advanced Matching**
   - Multi-factor compatibility scoring
   - Cultural cluster analysis
   - Personality assessment integration

3. **Real-time Insights**
   - Immediate insight generation on post creation
   - Async queue processing

4. **Cost Optimization**
   - OpenAI Batch API integration (50% cheaper)
   - Cached embeddings for recurring content
   - Smarter deduplication (semantic similarity)

5. **Admin Dashboard**
   - React component for batch monitoring
   - Real-time queue visualization
   - Cost tracking graphs

---

## 11. Deployment Checklist

### Pre-Deployment

- [ ] Set OPENAI_API_KEY in Supabase secrets
- [ ] Set ADMIN_USER_IDS in Supabase secrets
- [ ] Run all migrations (20260116T000001-5)
- [ ] Deploy edge functions (weekly-batch, batch-trigger, etc.)
- [ ] Run test suite
- [ ] Verify pg_cron schedule

### Post-Deployment

- [ ] Trigger manual batch run via admin endpoint
- [ ] Monitor first run completion
- [ ] Verify tokens_used and api_cost_cents
- [ ] Check failed_jobs < 0.5%
- [ ] Confirm weekly_matches populated
- [ ] Validate ChaiChat previews generated

### Rollback Plan

If critical issues occur:
1. Disable pg_cron: `SELECT cron.unschedule('weekly-dna-batch-processing');`
2. Stop processing: Update all 'processing' jobs to 'retry'
3. Investigate error_log in batch_run_history
4. Fix and redeploy

---

## 12. Support & Maintenance

### Weekly Monitoring Tasks

- Review last batch run stats
- Check failed job count
- Monitor token usage trends
- Verify match quality feedback

### Monthly Tasks

- Analyze cost trends
- Optimize slow job types
- Review error patterns
- Update documentation

### Quarterly Tasks

- Evaluate scaling needs
- Test disaster recovery
- Update rate limits
- Tune DNA algorithms

---

## Appendix A: SQL Queries

### Current Batch Status
```sql
SELECT 
  run_type,
  status,
  started_at,
  completed_jobs,
  total_jobs,
  ROUND((completed_jobs::NUMERIC / NULLIF(total_jobs, 0)) * 100, 2) as progress_pct,
  tokens_used,
  api_cost_cents / 100.0 as api_cost_usd
FROM batch_run_history
WHERE status = 'running'
ORDER BY started_at DESC
LIMIT 1;
```

### Queue Backlog by Type
```sql
SELECT 
  job_type,
  status,
  COUNT(*) as count,
  AVG(attempts) as avg_attempts
FROM batch_processing_queue
WHERE status IN ('pending', 'retry')
GROUP BY job_type, status
ORDER BY count DESC;
```

### Weekly Match Quality
```sql
SELECT 
  week_start_date,
  COUNT(*) as total_matches,
  AVG(score) as avg_score,
  MIN(score) as min_score,
  MAX(score) as max_score
FROM weekly_matches
GROUP BY week_start_date
ORDER BY week_start_date DESC
LIMIT 10;
```

### Cost Analysis
```sql
SELECT 
  DATE(started_at) as run_date,
  run_type,
  SUM(tokens_used) as total_tokens,
  SUM(api_cost_cents) / 100.0 as total_cost_usd,
  COUNT(*) as run_count
FROM batch_run_history
WHERE status = 'completed'
  AND started_at > now() - INTERVAL '30 days'
GROUP BY DATE(started_at), run_type
ORDER BY run_date DESC;
```

---

## Appendix B: Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    pg_cron Scheduler                     │
│              (Sunday 2 AM UTC - Weekly)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│           Edge Function: weekly-batch                    │
│  ┌─────────────────────────────────────────────────┐   │
│  │  1. Create batch_run_history (status=running)   │   │
│  │  2. Load jobs from batch_processing_queue       │   │
│  │  3. Process each phase sequentially:            │   │
│  │     ├─ Content Analysis (GPT-4o-mini)          │   │
│  │     ├─ Embeddings (text-embedding-ada-002)     │   │
│  │     ├─ DNA Recalculation (compute)             │   │
│  │     ├─ Match Generation (pgvector)             │   │
│  │     └─ ChaiChat Previews (GPT-4o-mini)         │   │
│  │  4. Update run_history (status=completed)       │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
┌──────────────────┐    ┌──────────────────┐
│  batch_service   │    │   admin-auth     │
│  - Job handlers  │    │  - requireAdmin  │
│  - Retry logic   │    │  - extractUserId │
└──────────────────┘    └──────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│                   Database Tables                        │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ batch_queue      │  │ batch_run_history│            │
│  │ - jobs           │  │ - runs           │            │
│  │ - status         │  │ - metrics        │            │
│  │ - retry          │  │ - error_log      │            │
│  └──────────────────┘  └──────────────────┘            │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ weekly_matches   │  │ posts (extended) │            │
│  │ - top 5/user     │  │ - content_hash   │            │
│  │ - previews       │  │ - embedding      │            │
│  └──────────────────┘  └──────────────────┘            │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │ user_insights    │  │ mysoul_dna_scores│            │
│  │ (existing)       │  │ (existing)       │            │
│  └──────────────────┘  └──────────────────┘            │
└─────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────┐
│                    API Endpoints                         │
│  POST /batch-trigger    (admin - manual trigger)        │
│  GET  /batch-status     (user - current status)         │
│  GET  /batch-history    (user - run history)            │
│  GET  /batch-queue      (user - own jobs)               │
│  POST /batch-retry      (admin - retry failed)          │
└─────────────────────────────────────────────────────────┘
```

---

## Contact & Support

**System Owner:** MatchMe Development Team  
**Documentation Version:** 1.0.0  
**Last Review:** 2026-01-16

For questions or issues, refer to:
- Repository: `docs/dna_batch_audit.md`
- Tests: `supabase/functions/tests/batch-processing.test.ts`
- Source: `supabase/functions/weekly-batch/`
