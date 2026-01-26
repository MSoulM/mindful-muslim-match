import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  calculateTraitRarity,
  calculateProfileDepth,
  calculateDaysActive,
  getRarityTier,
  COMPONENT_WEIGHTS,
  MIN_APPROVED_INSIGHTS,
  MIN_DAYS_FOR_BEHAVIORAL,
  ALGORITHM_VERSION
} from './dna-calculator.ts';

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

export interface BatchJob {
  id: string;
  user_id: string;
  job_type: string;
  payload: any;
  status: string;
  attempts: number;
  max_attempts: number;
}

export interface BatchRunHistory {
  id: string;
  run_type: string;
  started_at: string;
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  tokens_used: number;
  api_cost_cents: number;
  status: string;
  error_log: any[];
}

const CONTENT_ANALYSIS_PROMPT = `Analyze the following user content and extract meaningful insights about their personality, values, lifestyle, interests, or family preferences.

Content: {CONTENT}

Return a JSON array of insights with this structure:
[
  {
    "category": "values|personality|lifestyle|interests|family",
    "title": "Brief insight title (max 50 chars)",
    "description": "Detailed insight description (max 200 chars)",
    "confidence": 0-100
  }
]

Focus on:
- Authentic personality traits
- Core values and beliefs
- Lifestyle patterns
- Genuine interests and hobbies
- Family preferences and expectations

Be specific and avoid generic observations.`;

export async function handleJobFailure(
  supabase: any,
  jobId: string,
  error: Error,
  runHistory: BatchRunHistory
): Promise<void> {
  const { data: job } = await supabase
    .from('batch_processing_queue')
    .select('*')
    .eq('id', jobId)
    .single();

  if (!job) return;

  const newAttempts = job.attempts + 1;
  const shouldRetry = newAttempts < job.max_attempts;

  const backoffMinutes = Math.pow(2, newAttempts) * 5;
  const scheduledFor = new Date(Date.now() + backoffMinutes * 60 * 1000);

  await supabase
    .from('batch_processing_queue')
    .update({
      attempts: newAttempts,
      status: shouldRetry ? 'retry' : 'failed',
      last_error: error.message,
      scheduled_for: shouldRetry ? scheduledFor.toISOString() : job.scheduled_for
    })
    .eq('id', jobId);

  const errorEntry = {
    jobId,
    error: error.message,
    timestamp: new Date().toISOString(),
    willRetry: shouldRetry
  };

  const currentErrorLog = runHistory.error_log || [];
  await supabase
    .from('batch_run_history')
    .update({
      error_log: [...currentErrorLog, errorEntry],
      failed_jobs: runHistory.failed_jobs + 1
    })
    .eq('id', runHistory.id);
}

export async function processContentAnalysis(
  job: BatchJob,
  supabase: any
): Promise<{ tokensUsed: number; insightsCount: number }> {
  const { userId, contentId } = job.payload;

  const { data: content, error: contentError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', contentId)
    .single();

  if (contentError || !content) {
    throw new Error(`Content not found: ${contentId}`);
  }

  if (content.content_hash) {
    const { data: existingAnalysis } = await supabase
      .from('posts')
      .select('analysis_result')
      .eq('content_hash', content.content_hash)
      .eq('processing_status', 'completed')
      .not('analysis_result', 'is', null)
      .limit(1)
      .single();

    if (existingAnalysis?.analysis_result) {
      const insights = existingAnalysis.analysis_result.insights || [];
      for (const insight of insights) {
        await supabase.from('user_insights').insert({
          clerk_user_id: userId,
          insight_category: insight.category,
          title: insight.title,
          description: insight.description,
          source_quote: content.caption?.substring(0, 200),
          confidence_score: insight.confidence || 70,
          status: 'pending'
        });
      }

      await supabase
        .from('posts')
        .update({
          processing_status: 'completed',
          processed_at: new Date().toISOString(),
          analysis_result: existingAnalysis.analysis_result
        })
        .eq('id', contentId);

      return { tokensUsed: 0, insightsCount: insights.length };
    }
  }

  const contentText = [
    content.caption || '',
    content.categories?.join(', ') || '',
    `Depth Level: ${content.depth_level || 1}`
  ].join('\n');

  const prompt = CONTENT_ANALYSIS_PROMPT.replace('{CONTENT}', contentText);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are an expert at analyzing user content to extract meaningful insights.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const tokensUsed = data.usage?.total_tokens || 0;
  
  let insights = [];
  try {
    const parsed = JSON.parse(data.choices[0].message.content);
    insights = Array.isArray(parsed) ? parsed : (parsed.insights || []);
  } catch (e) {
    insights = [];
  }

  const analysisResult = {
    insights,
    model: 'gpt-4o-mini',
    tokens: tokensUsed,
    timestamp: new Date().toISOString()
  };

  for (const insight of insights) {
    await supabase.from('user_insights').insert({
      clerk_user_id: userId,
      insight_category: insight.category,
      title: insight.title,
      description: insight.description,
      source_quote: content.caption?.substring(0, 200),
      confidence_score: insight.confidence || 70,
      status: 'pending'
    });
  }

  await supabase
    .from('posts')
    .update({
      processing_status: 'completed',
      processed_at: new Date().toISOString(),
      analysis_result: analysisResult
    })
    .eq('id', contentId);

  return { tokensUsed, insightsCount: insights.length };
}

export async function processDNARecalculation(
  job: BatchJob,
  supabase: any
): Promise<void> {
  const userId = job.payload.userId || job.user_id;

  try {
    const result = await calculateDNAScore(userId, supabase);
    
    const { data: existing } = await supabase
      .from('mysoul_dna_scores')
      .select('rarity_tier')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    const previousTier = existing?.rarity_tier;
    const tierChanged = previousTier && previousTier !== result.rarityTier;

    await supabase
      .from('mysoul_dna_scores')
      .upsert({
        user_id: userId,
        score: result.finalScore,
        rarity_tier: result.rarityTier,
        percentile_rank: result.percentileRank,
        trait_rarity_raw_score: result.componentScores.traitRarity,
        profile_depth_raw_score: result.componentScores.profileDepth,
        behavioral_raw_score: result.componentScores.behavioral,
        content_raw_score: result.componentScores.contentOriginality,
        cultural_raw_score: result.componentScores.culturalVariance,
        component_breakdown: result.componentBreakdown,
        rare_traits: result.rareTraits,
        unique_behaviors: result.uniqueBehaviors,
        approved_insights_count: result.approvedInsightsCount,
        days_active: result.daysActive,
        algorithm_version: result.algorithmVersion,
        previous_tier: tierChanged ? previousTier : null,
        tier_changed_at: tierChanged ? new Date().toISOString() : null,
        last_calculated_at: new Date().toISOString()
      }, {
        onConflict: 'clerk_user_id'
      });
  } catch (error) {
    console.error(`[DNA Recalc] Failed for user ${userId}:`, error);
    throw error;
  }
}

async function calculateDNAScore(userId: string, supabase: any): Promise<any> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  if (!profile) {
    throw new Error('Profile not found');
  }

  const { data: approvedInsights } = await supabase
    .from('user_insights')
    .select('*')
    .eq('clerk_user_id', userId)
    .eq('status', 'approved');

  const approvedInsightsCount = approvedInsights?.length || 0;
  const daysActive = calculateDaysActive(profile.created_at);

  if (approvedInsightsCount < MIN_APPROVED_INSIGHTS) {
    return {
      finalScore: 0,
      rarityTier: 'COMMON',
      percentileRank: 0,
      componentScores: {
        traitRarity: 0,
        profileDepth: 0,
        behavioral: 0,
        contentOriginality: 0,
        culturalVariance: 0
      },
      componentBreakdown: {},
      rareTraits: [],
      uniqueBehaviors: [],
      approvedInsightsCount,
      daysActive,
      algorithmVersion: ALGORITHM_VERSION
    };
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('depth_level, created_at, categories')
    .eq('clerk_user_id', userId)
    .order('created_at', { ascending: true });

  const postCount = posts?.length || 0;
  
  // Use shared trait rarity calculation (based on insights and trait_distribution_stats)
  const traitRarityResult = await calculateTraitRarity(supabase, approvedInsights || []);
  const traitRarityScore = traitRarityResult.score;
  
  // Use shared profile depth calculation (based on user_profile_fields table)
  const profileDepthResult = await calculateProfileDepth(supabase, userId);
  const profileDepthScore = profileDepthResult.score;
  
  // Get behavioral tracking data (requires 7+ days of activity)
  let behavioralScore = 0;
  let uniqueBehaviors: any[] = [];
  
  if (daysActive >= MIN_DAYS_FOR_BEHAVIORAL) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .maybeSingle();
    
    if (profile?.id) {
      // Get most recent behavioral tracking period
      const { data: behavioralData } = await supabase
        .from('behavioral_tracking')
        .select('*')
        .eq('profile_id', profile.id)
        .order('period_start', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (behavioralData) {
        // Use uniqueness_score from behavioral_tracking if available
        behavioralScore = behavioralData.uniqueness_score ?? 0;
        
        // Extract unique behaviors from z_scores
        if (behavioralData.z_scores) {
          const zScores = behavioralData.z_scores as any;
          Object.entries(zScores).forEach(([metric, zScore]: [string, any]) => {
            if (Math.abs(zScore) >= 1.5) { // Significant deviation
              uniqueBehaviors.push({
                metric,
                displayName: formatBehavioralMetricName(metric),
                value: getMetricValue(behavioralData, metric),
                populationMean: 0, // Would need population stats
                zScore: Number(zScore),
                percentile: zScoreToPercentile(Number(zScore))
              });
            }
          });
        }
      } else {
        // Fallback to post-based calculation if no behavioral tracking data
        behavioralScore = postCount > 0 ? calculateBehavioralScore(posts, daysActive) : 0;
      }
    }
  }

  const { data: dnaScore } = await supabase
    .from('mysoul_dna_scores')
    .select('content_originality_score')
    .eq('clerk_user_id', userId)
    .maybeSingle();

  const contentOriginalityScore = dnaScore?.content_originality_score ?? 50;

  const culturalVarianceScore = await calculateCulturalVarianceScore(userId, profile, supabase);

  const componentScores = {
    traitRarity: traitRarityScore,
    profileDepth: profileDepthScore,
    behavioral: behavioralScore,
    contentOriginality: contentOriginalityScore,
    culturalVariance: culturalVarianceScore
  };

  const finalScore = Math.round(
    componentScores.traitRarity * COMPONENT_WEIGHTS.traitRarity +
    componentScores.profileDepth * COMPONENT_WEIGHTS.profileDepth +
    componentScores.behavioral * COMPONENT_WEIGHTS.behavioral +
    componentScores.contentOriginality * COMPONENT_WEIGHTS.contentOriginality +
    componentScores.culturalVariance * COMPONENT_WEIGHTS.culturalVariance
  );

  const rarityTier = getRarityTier(finalScore);
  const percentileRank = await calculatePercentileRank(finalScore, supabase);

  const avgDepth = postCount > 0 
    ? posts.reduce((sum: number, p: any) => sum + (p.depth_level || 1), 0) / postCount 
    : 1;

  const componentBreakdown = {
    traitRarity: {
      score: componentScores.traitRarity,
      weight: COMPONENT_WEIGHTS.traitRarity,
      weightedScore: Math.round(componentScores.traitRarity * COMPONENT_WEIGHTS.traitRarity * 100) / 100,
      explanation: traitRarityResult.explanation
    },
    profileDepth: {
      score: componentScores.profileDepth,
      weight: COMPONENT_WEIGHTS.profileDepth,
      weightedScore: Math.round(componentScores.profileDepth * COMPONENT_WEIGHTS.profileDepth * 100) / 100,
      explanation: profileDepthResult.explanation,
      dimensions: profileDepthResult.dimensions,
      missingDimensions: profileDepthResult.missingDimensions
    },
    behavioral: {
      score: componentScores.behavioral,
      weight: COMPONENT_WEIGHTS.behavioral,
      weightedScore: componentScores.behavioral * COMPONENT_WEIGHTS.behavioral,
      explanation: daysActive < MIN_DAYS_FOR_BEHAVIORAL 
        ? `Need ${MIN_DAYS_FOR_BEHAVIORAL} days activity (have ${daysActive})`
        : 'Based on posting patterns and engagement'
    },
    contentOriginality: {
      score: componentScores.contentOriginality,
      weight: COMPONENT_WEIGHTS.contentOriginality,
      weightedScore: componentScores.contentOriginality * COMPONENT_WEIGHTS.contentOriginality,
      explanation: 'Content uniqueness vs population'
    },
    culturalVariance: {
      score: componentScores.culturalVariance,
      weight: COMPONENT_WEIGHTS.culturalVariance,
      weightedScore: componentScores.culturalVariance * COMPONENT_WEIGHTS.culturalVariance,
      explanation: 'Uniqueness within city cluster'
    }
  };

  return {
    finalScore,
    rarityTier,
    percentileRank,
    componentScores,
    componentBreakdown,
    rareTraits: traitRarityResult.rareTraits,
    uniqueBehaviors: uniqueBehaviors.length > 0 ? uniqueBehaviors : (avgDepth >= 4 ? [{ metric: 'depth', displayName: 'Deep Content Creator', value: avgDepth }] : []),
    approvedInsightsCount,
    daysActive,
    algorithmVersion: ALGORITHM_VERSION
  };
}

// calculateDaysActive is now imported from dna-calculator.ts

// calculateProfileDepth is now imported from dna-calculator.ts
// Old profile-based calculation removed - now uses user_profile_fields table

// Helper functions for behavioral uniqueness
function formatBehavioralMetricName(metric: string): string {
  const names: Record<string, string> = {
    'response_time': 'Response Time',
    'messages_per_match': 'Messages per Match',
    'message_length': 'Message Length',
    'emoji_usage': 'Emoji Usage',
    'voice_ratio': 'Voice Messages',
    'profile_views': 'Profile Views',
    'match_acceptance': 'Match Acceptance',
    'weekend_activity': 'Weekend Activity'
  };
  return names[metric] || metric;
}

function getMetricValue(behavioralData: any, metric: string): number {
  const mapping: Record<string, string> = {
    'response_time': 'avg_response_time_hours',
    'messages_per_match': 'messages_per_match',
    'message_length': 'avg_message_length',
    'emoji_usage': 'emoji_usage_rate',
    'voice_ratio': 'voice_message_ratio',
    'profile_views': 'profile_views_per_day',
    'match_acceptance': 'match_acceptance_rate',
    'weekend_activity': 'weekend_activity_ratio'
  };
  return behavioralData[mapping[metric]] ?? 0;
}

function zScoreToPercentile(zScore: number): number {
  // Convert Z-score to percentile (approximation)
  // Using standard normal distribution approximation
  const t = 1 / (1 + 0.2316419 * Math.abs(zScore));
  const d = 0.3989423 * Math.exp(-zScore * zScore / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return zScore > 0 ? (1 - p) * 100 : p * 100;
}

function calculateBehavioralScore(posts: any[], daysActive: number): number {
  const postCount = posts.length;
  const firstPost = new Date(posts[0].created_at);
  const lastPost = new Date(posts[posts.length - 1].created_at);
  const postingSpanDays = Math.max(1, Math.floor((lastPost.getTime() - firstPost.getTime()) / (1000 * 60 * 60 * 24)));
  const postFrequency = postCount / Math.max(1, postingSpanDays);

  const consistencyScore = Math.min(100, (postingSpanDays / 30) * 50);
  const avgDepth = posts.reduce((sum: number, p: any) => sum + (p.depth_level || 1), 0) / postCount;
  const depthScore = Math.min(100, (avgDepth / 5) * 100);
  const frequencyScore = Math.min(100, postFrequency * 20);

  return Math.round((consistencyScore + depthScore + frequencyScore) / 3);
}

async function calculateCulturalVarianceScore(userId: string, profile: any, supabase: any): Promise<number> {
  if (!profile.location) return 50;

  const { data: cityProfiles } = await supabase
    .from('profiles')
    .select('*')
    .eq('location', profile.location)
    .limit(100);

  if (!cityProfiles || cityProfiles.length < 5) return 50;

  const myTraits = {
    religion: profile.religion?.sect,
    occupation: profile.occupation,
    maritalStatus: profile.marital_status,
    wantsChildren: profile.wants_children
  };

  let uniquenessCount = 0;
  let totalComparisons = 0;

  for (const other of cityProfiles) {
    if (other.clerk_user_id === userId) continue;
    
    if (myTraits.religion !== other.religion?.sect) uniquenessCount++;
    if (myTraits.occupation !== other.occupation) uniquenessCount++;
    if (myTraits.maritalStatus !== other.marital_status) uniquenessCount++;
    if (myTraits.wantsChildren !== other.wants_children) uniquenessCount++;
    
    totalComparisons += 4;
  }

  const uniquenessRatio = totalComparisons > 0 ? uniquenessCount / totalComparisons : 0.5;
  return Math.round(uniquenessRatio * 100);
}

// getRarityTier is now imported from dna-calculator.ts

async function calculatePercentileRank(score: number, supabase: any): Promise<number> {
  try {
    const { data } = await supabase.rpc('calculate_dna_percentile_rank', { user_score: score });
    return data || 50;
  } catch (error) {
    console.error('[DNA Percentile] Calculation failed:', error);
    return 50;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
      dimensions: 1536
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate embedding');
  }

  const data = await response.json();
  return data.data[0].embedding;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have same length');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  
  if (denominator === 0) {
    return 0;
  }
  
  return dotProduct / denominator;
}

async function calculateUserOriginality(
  userId: string,
  supabase: any
): Promise<{ score: number; avgSimilarity: number; minSimilarity: number; maxSimilarity: number; contentCount: number }> {
  const MIN_CONTENT_REQUIRED = 3;
  const MIN_POPULATION_REQUIRED = 10;
  const MAX_USER_EMBEDDINGS = 10;
  const POPULATION_SAMPLE_SIZE = 1000;
  const DEFAULT_SCORE = 50;

  const { data: cacheValid } = await supabase.rpc('is_originality_cache_valid', {
    p_user_id: userId
  });

  if (cacheValid === true) {
    const { data: cache } = await supabase
      .from('content_similarity_cache')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    if (cache) {
      return {
        score: cache.originality_score,
        avgSimilarity: parseFloat(cache.avg_similarity_to_population),
        minSimilarity: parseFloat(cache.min_similarity),
        maxSimilarity: parseFloat(cache.max_similarity),
        contentCount: cache.content_count
      };
    }
  }

  const { data: userPosts } = await supabase
    .from('posts')
    .select('embedding')
    .eq('clerk_user_id', userId)
    .not('embedding', 'is', null)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(MAX_USER_EMBEDDINGS);

  const userContentCount = userPosts?.length || 0;

  if (userContentCount < MIN_CONTENT_REQUIRED) {
    return {
      score: DEFAULT_SCORE,
      avgSimilarity: 0,
      minSimilarity: 0,
      maxSimilarity: 0,
      contentCount: userContentCount
    };
  }

  const userEmbeddings = userPosts.map((p: any) => p.embedding as number[]);

  const { data: populationPosts } = await supabase
    .from('posts')
    .select('embedding')
    .neq('clerk_user_id', userId)
    .not('embedding', 'is', null)
    .is('deleted_at', null)
    .limit(POPULATION_SAMPLE_SIZE);

  const populationSize = populationPosts?.length || 0;

  if (populationSize < MIN_POPULATION_REQUIRED) {
    return {
      score: DEFAULT_SCORE,
      avgSimilarity: 0,
      minSimilarity: 0,
      maxSimilarity: 0,
      contentCount: userContentCount
    };
  }

  const populationEmbeddings = populationPosts.map((p: any) => p.embedding as number[]);

  let totalSimilarity = 0;
  let minSim = 1;
  let maxSim = 0;
  let comparisonCount = 0;

  for (const userEmb of userEmbeddings) {
    for (const popEmb of populationEmbeddings) {
      const similarity = cosineSimilarity(userEmb, popEmb);
      totalSimilarity += similarity;
      comparisonCount++;
      
      if (similarity < minSim) minSim = similarity;
      if (similarity > maxSim) maxSim = similarity;
    }
  }

  const avgSimilarity = comparisonCount > 0 ? totalSimilarity / comparisonCount : 0;
  const originalityScore = Math.max(0, Math.min(100, Math.round((1 - avgSimilarity) * 100)));

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7);

  await supabase
    .from('content_similarity_cache')
    .upsert({
      user_id: userId,
      avg_similarity_to_population: avgSimilarity.toFixed(4),
      min_similarity: minSim.toFixed(4),
      max_similarity: maxSim.toFixed(4),
      content_count: userContentCount,
      originality_score: originalityScore,
      calculated_at: new Date().toISOString(),
      valid_until: validUntil.toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'clerk_user_id'
    });

  return {
    score: originalityScore,
    avgSimilarity: parseFloat(avgSimilarity.toFixed(4)),
    minSimilarity: parseFloat(minSim.toFixed(4)),
    maxSimilarity: parseFloat(maxSim.toFixed(4)),
    contentCount: userContentCount
  };
}

export async function processOriginalityBatch(
  supabase: any
): Promise<{ processedCount: number; failedCount: number }> {
  console.log('[Originality Batch] Starting originality calculation batch');

  const { data: usersWithContent } = await supabase
    .from('posts')
    .select('clerk_user_id')
    .not('embedding', 'is', null)
    .is('deleted_at', null);

  if (!usersWithContent || usersWithContent.length === 0) {
    console.log('[Originality Batch] No users with embeddings found');
    return { processedCount: 0, failedCount: 0 };
  }

  const uniqueUserIds = [...new Set(usersWithContent.map((p: any) => p.clerk_user_id))];
  console.log(`[Originality Batch] Processing ${uniqueUserIds.length} users`);

  let processedCount = 0;
  let failedCount = 0;

  for (const userId of uniqueUserIds) {
    try {
      const result = await calculateUserOriginality(userId, supabase);

      await supabase
        .from('mysoul_dna_scores')
        .upsert({
          user_id: userId,
          content_originality_score: result.score,
          content_originality_calculated_at: new Date().toISOString()
        }, {
          onConflict: 'clerk_user_id'
        });

      processedCount++;

      if (processedCount % 10 === 0) {
        console.log(`[Originality Batch] Processed ${processedCount}/${uniqueUserIds.length} users`);
      }

      await new Promise(resolve => setTimeout(resolve, 50));

    } catch (error: unknown) {
      console.error(`[Originality Batch] Failed to process user ${userId}:`, error);
      failedCount++;
    }
  }

  console.log('[Originality Batch] Calculating percentiles');
  try {
    await supabase.rpc('calculate_originality_percentiles');
  } catch (error: unknown) {
    console.error('[Originality Batch] Failed to calculate percentiles:', error);
  }

  console.log(`[Originality Batch] Completed: ${processedCount} processed, ${failedCount} failed`);
  return { processedCount, failedCount };
}

export async function generateWeeklyMatches(
  batchRunId: string,
  supabase: any
): Promise<{ matchCount: number; tokensUsed: number }> {
  const weekStartDate = new Date();
  weekStartDate.setDate(weekStartDate.getDate() - weekStartDate.getDay());
  const weekStart = weekStartDate.toISOString().split('T')[0];

  const { data: users } = await supabase
    .from('profiles')
    .select('clerk_user_id')
    .limit(1000);

  if (!users) return { matchCount: 0, tokensUsed: 0 };

  let totalMatches = 0;
  let totalTokens = 0;

  for (const user of users) {
    const userId = user.clerk_user_id;

    const { data: userPosts } = await supabase
      .from('posts')
      .select('embedding')
      .eq('clerk_user_id', userId)
      .not('embedding', 'is', null)
      .limit(1);

    if (!userPosts || userPosts.length === 0) continue;

    const userEmbedding = userPosts[0].embedding;

    const { data: preferences } = await supabase
      .from('match_preferences')
      .select('*')
      .eq('clerk_user_id', userId)
      .single();

    const { data: candidates } = await supabase
      .from('posts')
      .select('clerk_user_id, embedding')
      .neq('clerk_user_id', userId)
      .not('embedding', 'is', null)
      .limit(50);

    if (!candidates || candidates.length === 0) continue;

    const scoredCandidates = candidates.map((candidate: any) => {
      const vectorSimilarity = 0.8 + Math.random() * 0.2;
      const preferencesMatch = preferences ? 0.7 + Math.random() * 0.3 : 0.5;
      const finalScore = (vectorSimilarity * 0.6 + preferencesMatch * 0.4) * 100;

      return {
        match_user_id: candidate.clerk_user_id,
        score: Math.round(finalScore * 100) / 100,
        compatibility_factors: {
          vector_similarity: vectorSimilarity,
          preferences_match: preferencesMatch
        }
      };
    });

    scoredCandidates.sort((a, b) => b.score - a.score);
    const topMatches = scoredCandidates.slice(0, 5);

    for (let i = 0; i < topMatches.length; i++) {
      await supabase.from('weekly_matches').insert({
        user_id: userId,
        match_user_id: topMatches[i].match_user_id,
        score: topMatches[i].score,
        rank: i + 1,
        week_start_date: weekStart,
        compatibility_factors: topMatches[i].compatibility_factors,
        batch_run_id: batchRunId
      });
      totalMatches++;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { matchCount: totalMatches, tokensUsed: totalTokens };
}

export async function generateChaiChatPreviews(
  batchRunId: string,
  supabase: any
): Promise<{ previewCount: number; tokensUsed: number }> {
  const { data: matches } = await supabase
    .from('weekly_matches')
    .select('id, user_id, match_user_id')
    .eq('batch_run_id', batchRunId)
    .is('chaichat_preview', null)
    .limit(100);

  if (!matches) return { previewCount: 0, tokensUsed: 0 };

  let totalTokens = 0;

  for (const match of matches) {
    const preview = {
      level: 1,
      starters: [
        "What does a perfect weekend look like for you?",
        "If you could travel anywhere next month, where would you go?",
        "What's something you're passionate about that most people don't know?"
      ],
      timestamp: new Date().toISOString()
    };

    await supabase
      .from('weekly_matches')
      .update({ chaichat_preview: preview })
      .eq('id', match.id);

    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return { previewCount: matches.length, tokensUsed: totalTokens };
}
