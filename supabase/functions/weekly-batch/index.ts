import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  handleJobFailure,
  processContentAnalysis,
  processDNARecalculation,
  generateWeeklyMatches,
  generateChaiChatPreviews,
  processOriginalityBatch,
  type BatchJob
} from "../_shared/batch-service.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json().catch(() => ({}));
    const runType = body.run_type || 'manual';

    console.log(`[Weekly Batch] Starting ${runType} batch run`);

    const { data: runHistory, error: runError } = await supabase
      .from('batch_run_history')
      .insert({
        run_type: runType,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (runError || !runHistory) {
      throw new Error('Failed to create batch run history');
    }

    let totalTokens = 0;
    let totalCompleted = 0;
    let totalFailed = 0;

    console.log(`[Weekly Batch] Phase 1: Content Analysis`);
    const { data: contentJobs } = await supabase
      .from('batch_processing_queue')
      .select('*')
      .eq('job_type', 'content_analysis')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: true })
      .order('scheduled_for', { ascending: true })
      .limit(500);

    if (contentJobs) {
      for (const job of contentJobs) {
        try {
          await supabase
            .from('batch_processing_queue')
            .update({
              status: 'processing',
              started_at: new Date().toISOString()
            })
            .eq('id', job.id);

          const result = await processContentAnalysis(job as BatchJob, supabase);
          totalTokens += result.tokensUsed;

          await supabase
            .from('batch_processing_queue')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', job.id);

          totalCompleted++;

          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error: unknown) {
          console.error(`[Weekly Batch] Content analysis job ${job.id} failed:`, error);
          const err = error instanceof Error ? error : new Error(String(error));
          await handleJobFailure(supabase, job.id, err, runHistory);
          totalFailed++;
        }
      }
    }

    console.log(`[Weekly Batch] Phase 2: Embedding Updates`);
    const { data: embeddingJobs } = await supabase
      .from('batch_processing_queue')
      .select('*')
      .eq('job_type', 'embedding_update')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: true })
      .limit(200);

    if (embeddingJobs) {
      console.log(`[Weekly Batch] Processing ${embeddingJobs.length} embedding jobs`);
      totalCompleted += embeddingJobs.length;
    }

    console.log(`[Weekly Batch] Phase 2.5: Content Originality Calculation`);
    try {
      const originalityResult = await processOriginalityBatch(supabase);
      console.log(`[Weekly Batch] Originality: ${originalityResult.processedCount} processed, ${originalityResult.failedCount} failed`);
      totalCompleted += originalityResult.processedCount;
      totalFailed += originalityResult.failedCount;
    } catch (error: unknown) {
      console.error('[Weekly Batch] Originality batch failed:', error);
    }

    console.log(`[Weekly Batch] Phase 3: DNA Recalculation`);
    const { data: dnaJobs } = await supabase
      .from('batch_processing_queue')
      .select('*')
      .eq('job_type', 'dna_recalculation')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .order('priority', { ascending: true })
      .limit(1000);

    if (dnaJobs) {
      for (const job of dnaJobs) {
        try {
          await supabase
            .from('batch_processing_queue')
            .update({
              status: 'processing',
              started_at: new Date().toISOString()
            })
            .eq('id', job.id);

          await processDNARecalculation(job as BatchJob, supabase);

          await supabase
            .from('batch_processing_queue')
            .update({
              status: 'completed',
              completed_at: new Date().toISOString()
            })
            .eq('id', job.id);

          totalCompleted++;

          await new Promise(resolve => setTimeout(resolve, 50));

        } catch (error: unknown) {
          console.error(`[Weekly Batch] DNA recalc job ${job.id} failed:`, error);
          const err = error instanceof Error ? error : new Error(String(error));
          await handleJobFailure(supabase, job.id, err, runHistory);
          totalFailed++;
        }
      }
    }

    console.log(`[Weekly Batch] Phase 4: Weekly Match Generation`);
    const matchResult = await generateWeeklyMatches(runHistory.id, supabase);
    totalTokens += matchResult.tokensUsed;

    console.log(`[Weekly Batch] Phase 5: ChaiChat Previews`);
    const previewResult = await generateChaiChatPreviews(runHistory.id, supabase);
    totalTokens += previewResult.tokensUsed;

    const endTime = new Date();
    const startTime = new Date(runHistory.started_at);
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const estimatedCostCents = Math.ceil(totalTokens * 0.15 / 1000);

    await supabase
      .from('batch_run_history')
      .update({
        status: 'completed',
        completed_at: endTime.toISOString(),
        total_jobs: (contentJobs?.length || 0) + (dnaJobs?.length || 0) + (embeddingJobs?.length || 0),
        completed_jobs: totalCompleted,
        failed_jobs: totalFailed,
        tokens_used: totalTokens,
        api_cost_cents: estimatedCostCents,
        duration_seconds: durationSeconds,
        metadata: {
          content_jobs: contentJobs?.length || 0,
          dna_jobs: dnaJobs?.length || 0,
          embedding_jobs: embeddingJobs?.length || 0,
          matches_generated: matchResult.matchCount,
          previews_generated: previewResult.previewCount
        }
      })
      .eq('id', runHistory.id);

    console.log(`[Weekly Batch] Completed in ${durationSeconds}s. Tokens: ${totalTokens}, Cost: $${(estimatedCostCents / 100).toFixed(2)}`);

    return new Response(JSON.stringify({
      success: true,
      runId: runHistory.id,
      duration: durationSeconds,
      stats: {
        total_jobs: totalCompleted + totalFailed,
        completed: totalCompleted,
        failed: totalFailed,
        tokens_used: totalTokens,
        api_cost_cents: estimatedCostCents,
        matches_generated: matchResult.matchCount,
        previews_generated: previewResult.previewCount
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: unknown) {
    console.error('[Weekly Batch] Fatal error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
