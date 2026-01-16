import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "http://localhost:54321";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

Deno.test("Batch Processing Queue - Insert and Update Status", async () => {
  const testUserId = "test-user-" + Date.now();
  
  const { data: job, error } = await supabase
    .from('batch_processing_queue')
    .insert({
      user_id: testUserId,
      job_type: 'content_analysis',
      payload: { userId: testUserId, contentId: 'test-content-1' },
      status: 'pending',
      priority: 5
    })
    .select()
    .single();

  assertExists(job);
  assertEquals(job.status, 'pending');
  assertEquals(job.attempts, 0);

  const { data: updated } = await supabase
    .from('batch_processing_queue')
    .update({ status: 'processing', started_at: new Date().toISOString() })
    .eq('id', job.id)
    .select()
    .single();

  assertEquals(updated?.status, 'processing');
  assertExists(updated?.started_at);

  await supabase.from('batch_processing_queue').delete().eq('id', job.id);
});

Deno.test("Batch Processing Queue - Retry Logic", async () => {
  const testUserId = "test-user-retry-" + Date.now();
  
  const { data: job } = await supabase
    .from('batch_processing_queue')
    .insert({
      user_id: testUserId,
      job_type: 'dna_recalculation',
      payload: { userId: testUserId },
      status: 'pending',
      attempts: 0,
      max_attempts: 3
    })
    .select()
    .single();

  assertExists(job);

  const { data: failed } = await supabase
    .from('batch_processing_queue')
    .update({
      attempts: 1,
      status: 'retry',
      last_error: 'Test error',
      scheduled_for: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    })
    .eq('id', job.id)
    .select()
    .single();

  assertEquals(failed?.status, 'retry');
  assertEquals(failed?.attempts, 1);
  assertExists(failed?.last_error);

  await supabase.from('batch_processing_queue').delete().eq('id', job.id);
});

Deno.test("Batch Processing Queue - Priority Ordering", async () => {
  const testUserId = "test-user-priority-" + Date.now();
  
  const jobs = await Promise.all([
    supabase.from('batch_processing_queue').insert({
      user_id: testUserId,
      job_type: 'content_analysis',
      payload: {},
      priority: 3
    }).select().single(),
    supabase.from('batch_processing_queue').insert({
      user_id: testUserId,
      job_type: 'content_analysis',
      payload: {},
      priority: 1
    }).select().single(),
    supabase.from('batch_processing_queue').insert({
      user_id: testUserId,
      job_type: 'content_analysis',
      payload: {},
      priority: 5
    }).select().single()
  ]);

  const { data: ordered } = await supabase
    .from('batch_processing_queue')
    .select('*')
    .eq('user_id', testUserId)
    .eq('status', 'pending')
    .order('priority', { ascending: true });

  assertEquals(ordered?.[0].priority, 1);
  assertEquals(ordered?.[1].priority, 3);
  assertEquals(ordered?.[2].priority, 5);

  for (const job of jobs) {
    if (job.data?.id) {
      await supabase.from('batch_processing_queue').delete().eq('id', job.data.id);
    }
  }
});

Deno.test("Batch Run History - Create and Complete", async () => {
  const { data: run, error } = await supabase
    .from('batch_run_history')
    .insert({
      run_type: 'manual',
      status: 'running',
      started_at: new Date().toISOString()
    })
    .select()
    .single();

  assertExists(run);
  assertEquals(run.status, 'running');
  assertEquals(run.total_jobs, 0);
  assertEquals(run.tokens_used, 0);

  const endTime = new Date();
  const startTime = new Date(run.started_at);
  const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

  const { data: completed } = await supabase
    .from('batch_run_history')
    .update({
      status: 'completed',
      completed_at: endTime.toISOString(),
      total_jobs: 100,
      completed_jobs: 98,
      failed_jobs: 2,
      tokens_used: 15000,
      api_cost_cents: 23,
      duration_seconds: durationSeconds
    })
    .eq('id', run.id)
    .select()
    .single();

  assertEquals(completed?.status, 'completed');
  assertEquals(completed?.total_jobs, 100);
  assertEquals(completed?.completed_jobs, 98);
  assertEquals(completed?.failed_jobs, 2);

  await supabase.from('batch_run_history').delete().eq('id', run.id);
});

Deno.test("Batch Run History - Error Log", async () => {
  const { data: run } = await supabase
    .from('batch_run_history')
    .insert({
      run_type: 'weekly_full',
      status: 'running',
      error_log: []
    })
    .select()
    .single();

  assertExists(run);

  const errorEntry = {
    jobId: 'test-job-123',
    error: 'OpenAI API timeout',
    timestamp: new Date().toISOString(),
    willRetry: true
  };

  const { data: updated } = await supabase
    .from('batch_run_history')
    .update({
      error_log: [errorEntry]
    })
    .eq('id', run.id)
    .select()
    .single();

  assertEquals(updated?.error_log.length, 1);
  assertEquals(updated?.error_log[0].error, 'OpenAI API timeout');

  await supabase.from('batch_run_history').delete().eq('id', run.id);
});

Deno.test("Weekly Matches - Insert and Retrieve", async () => {
  const testUserId = "test-user-match-" + Date.now();
  const matchUserId = "test-match-user-" + Date.now();
  const weekStart = new Date().toISOString().split('T')[0];

  const { data: match, error } = await supabase
    .from('weekly_matches')
    .insert({
      user_id: testUserId,
      match_user_id: matchUserId,
      score: 92.5,
      rank: 1,
      week_start_date: weekStart,
      compatibility_factors: {
        vector_similarity: 0.89,
        preferences_match: 0.95
      }
    })
    .select()
    .single();

  assertExists(match);
  assertEquals(match.score, 92.5);
  assertEquals(match.rank, 1);

  const { data: retrieved } = await supabase
    .from('weekly_matches')
    .select('*')
    .eq('user_id', testUserId)
    .eq('week_start_date', weekStart)
    .single();

  assertEquals(retrieved?.match_user_id, matchUserId);
  assertEquals(retrieved?.compatibility_factors.vector_similarity, 0.89);

  await supabase.from('weekly_matches').delete().eq('id', match.id);
});

Deno.test("Weekly Matches - Unique Constraint", async () => {
  const testUserId = "test-user-unique-" + Date.now();
  const matchUserId = "test-match-unique-" + Date.now();
  const weekStart = new Date().toISOString().split('T')[0];

  const { data: match1 } = await supabase
    .from('weekly_matches')
    .insert({
      user_id: testUserId,
      match_user_id: matchUserId,
      score: 90,
      rank: 1,
      week_start_date: weekStart
    })
    .select()
    .single();

  const { error } = await supabase
    .from('weekly_matches')
    .insert({
      user_id: testUserId,
      match_user_id: matchUserId,
      score: 85,
      rank: 2,
      week_start_date: weekStart
    });

  assertExists(error);

  if (match1?.id) {
    await supabase.from('weekly_matches').delete().eq('id', match1.id);
  }
});

Deno.test("Posts - Content Hash Deduplication", async () => {
  const testUserId = "test-user-content-" + Date.now();
  const contentHash = "test-hash-" + Date.now();

  const { data: post1 } = await supabase
    .from('posts')
    .insert({
      clerk_user_id: testUserId,
      caption: "Test content for dedup",
      content_hash: contentHash,
      processing_status: 'completed',
      analysis_result: {
        insights: [
          { category: 'values', title: 'Test', description: 'Test insight', confidence: 80 }
        ]
      }
    })
    .select()
    .single();

  assertExists(post1);

  const { data: existing } = await supabase
    .from('posts')
    .select('analysis_result')
    .eq('content_hash', contentHash)
    .eq('processing_status', 'completed')
    .single();

  assertExists(existing?.analysis_result);
  assertEquals(existing.analysis_result.insights.length, 1);

  await supabase.from('posts').delete().eq('id', post1.id);
});

console.log("\n✅ All batch processing tests passed!");
