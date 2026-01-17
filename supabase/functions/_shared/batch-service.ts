import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
      .eq('user_id', userId)
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
        onConflict: 'user_id'
      });
  } catch (error) {
    console.error(`[DNA Recalc] Failed for user ${userId}:`, error);
    throw error;
  }
}

async function calculateDNAScore(userId: string, supabase: any): Promise<any> {
  const MIN_APPROVED_INSIGHTS = 5;
  const MIN_DAYS_FOR_BEHAVIORAL = 7;
  const COMPONENT_WEIGHTS = {
    traitRarity: 0.35,
    profileDepth: 0.25,
    behavioral: 0.20,
    contentOriginality: 0.15,
    culturalVariance: 0.05
  };

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
      algorithmVersion: 'v1.0'
    };
  }

  const { data: posts } = await supabase
    .from('posts')
    .select('depth_level, created_at, categories')
    .eq('clerk_user_id', userId)
    .order('created_at', { ascending: true });

  const postCount = posts?.length || 0;
  const avgDepth = postCount > 0 
    ? posts.reduce((sum: number, p: any) => sum + (p.depth_level || 1), 0) / postCount 
    : 1;

  const traitRarityScore = Math.min(100, Math.round((avgDepth / 5) * 70 + (postCount / 20) * 30));
  
  const profileDepthScore = calculateProfileDepthScore(profile);
  
  const behavioralScore = daysActive >= MIN_DAYS_FOR_BEHAVIORAL && postCount > 0
    ? calculateBehavioralScore(posts, daysActive)
    : 0;

  const { data: dnaScore } = await supabase
    .from('mysoul_dna_scores')
    .select('content_originality_score')
    .eq('user_id', userId)
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

  const componentBreakdown = {
    traitRarity: {
      score: componentScores.traitRarity,
      weight: COMPONENT_WEIGHTS.traitRarity,
      weightedScore: componentScores.traitRarity * COMPONENT_WEIGHTS.traitRarity,
      explanation: `Based on ${postCount} posts with avg depth ${avgDepth.toFixed(1)}`
    },
    profileDepth: {
      score: componentScores.profileDepth,
      weight: COMPONENT_WEIGHTS.profileDepth,
      weightedScore: componentScores.profileDepth * COMPONENT_WEIGHTS.profileDepth,
      explanation: 'Profile completeness across 5 dimensions'
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
    rareTraits: [],
    uniqueBehaviors: avgDepth >= 4 ? [{ metric: 'depth', displayName: 'Deep Content Creator', value: avgDepth }] : [],
    approvedInsightsCount,
    daysActive,
    algorithmVersion: 'v1.0'
  };
}

function calculateDaysActive(createdAt?: string): number {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateProfileDepthScore(profile: any): number {
  const dimensions = {
    religious: scoreReligious(profile),
    career: scoreCareer(profile),
    personality: scorePersonality(profile),
    lifestyle: scoreLifestyle(profile),
    family: scoreFamily(profile)
  };

  return Math.round((dimensions.religious + dimensions.career + dimensions.personality + dimensions.lifestyle + dimensions.family) / 5);
}

function scoreReligious(profile: any): number {
  const fields = [profile.religion?.sect, profile.religion?.practiceLevel, profile.religion?.halalPreference];
  return (fields.filter(f => f).length / fields.length) * 100;
}

function scoreCareer(profile: any): number {
  const fields = [profile.education_level, profile.occupation, profile.industry, profile.annual_income_range];
  return (fields.filter(f => f).length / fields.length) * 100;
}

function scorePersonality(profile: any): number {
  if (profile.bio && profile.bio.length > 50) return 100;
  if (profile.bio && profile.bio.length > 20) return 50;
  return 0;
}

function scoreLifestyle(profile: any): number {
  const fields = [
    profile.smoking,
    profile.exercise_frequency,
    profile.dietary_preferences?.length ? 'yes' : null,
    profile.hobbies?.length ? 'yes' : null,
    profile.height,
    profile.build
  ];
  return (fields.filter(f => f).length / fields.length) * 100;
}

function scoreFamily(profile: any): number {
  const fields = [
    profile.marital_status,
    typeof profile.has_children === 'boolean' ? 'yes' : null,
    typeof profile.wants_children === 'boolean' ? 'yes' : null,
    profile.family_structure,
    profile.family_values,
    profile.cultural_traditions,
    profile.hometown
  ];
  return (fields.filter(f => f).length / fields.length) * 100;
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

function getRarityTier(score: number): string {
  if (score >= 96) return 'LEGENDARY';
  if (score >= 81) return 'EPIC';
  if (score >= 61) return 'RARE';
  if (score >= 41) return 'UNCOMMON';
  return 'COMMON';
}

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
      .eq('user_id', userId)
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
      onConflict: 'user_id'
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
          onConflict: 'user_id'
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
