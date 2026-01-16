import { createSupabaseClient } from '@/lib/supabase';

const MIN_CONTENT_REQUIRED = 3;
const MIN_POPULATION_REQUIRED = 10;
const MAX_USER_EMBEDDINGS = 10;
const POPULATION_SAMPLE_SIZE = 1000;
const DEFAULT_SCORE = 50;

export interface OriginalityResult {
  score: number;
  avgSimilarity: number;
  minSimilarity: number;
  maxSimilarity: number;
  contentCount: number;
  populationSampleSize: number;
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

export async function calculateOriginality(
  userId: string, 
  token?: string
): Promise<OriginalityResult> {
  const supabase = createSupabaseClient(token);
  
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  const cacheValid = await checkCacheValidity(userId, token);
  if (cacheValid) {
    const cachedResult = await getCachedResult(userId, token);
    if (cachedResult) {
      return cachedResult;
    }
  }

  const { data: userPosts, error: userError } = await supabase
    .from('posts')
    .select('embedding')
    .eq('clerk_user_id', userId)
    .not('embedding', 'is', null)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(MAX_USER_EMBEDDINGS);

  if (userError) {
    throw new Error(`Failed to fetch user posts: ${userError.message}`);
  }

  const userContentCount = userPosts?.length || 0;

  if (userContentCount < MIN_CONTENT_REQUIRED) {
    return {
      score: DEFAULT_SCORE,
      avgSimilarity: 0,
      minSimilarity: 0,
      maxSimilarity: 0,
      contentCount: userContentCount,
      populationSampleSize: 0
    };
  }

  const userEmbeddings = userPosts.map(p => p.embedding as number[]);

  const { data: populationPosts, error: popError } = await supabase
    .from('posts')
    .select('embedding')
    .neq('clerk_user_id', userId)
    .not('embedding', 'is', null)
    .is('deleted_at', null)
    .limit(POPULATION_SAMPLE_SIZE);

  if (popError) {
    throw new Error(`Failed to fetch population posts: ${popError.message}`);
  }

  const populationSize = populationPosts?.length || 0;

  if (populationSize < MIN_POPULATION_REQUIRED) {
    return {
      score: DEFAULT_SCORE,
      avgSimilarity: 0,
      minSimilarity: 0,
      maxSimilarity: 0,
      contentCount: userContentCount,
      populationSampleSize: populationSize
    };
  }

  const populationEmbeddings = populationPosts.map(p => p.embedding as number[]);

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

  const result: OriginalityResult = {
    score: originalityScore,
    avgSimilarity: parseFloat(avgSimilarity.toFixed(4)),
    minSimilarity: parseFloat(minSim.toFixed(4)),
    maxSimilarity: parseFloat(maxSim.toFixed(4)),
    contentCount: userContentCount,
    populationSampleSize: populationSize
  };

  await cacheResult(userId, result, token);

  return result;
}

async function checkCacheValidity(userId: string, token?: string): Promise<boolean> {
  const supabase = createSupabaseClient(token);
  if (!supabase) return false;

  try {
    const { data, error } = await supabase.rpc('is_originality_cache_valid', {
      p_user_id: userId
    });

    if (error) {
      console.warn('Cache validity check failed:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.warn('Cache validity check error:', error);
    return false;
  }
}

async function getCachedResult(userId: string, token?: string): Promise<OriginalityResult | null> {
  const supabase = createSupabaseClient(token);
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('content_similarity_cache')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    score: data.originality_score,
    avgSimilarity: parseFloat(data.avg_similarity_to_population),
    minSimilarity: parseFloat(data.min_similarity),
    maxSimilarity: parseFloat(data.max_similarity),
    contentCount: data.content_count,
    populationSampleSize: 0
  };
}

async function cacheResult(userId: string, result: OriginalityResult, token?: string): Promise<void> {
  const supabase = createSupabaseClient(token);
  if (!supabase) return;

  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 7);

  const { error } = await supabase
    .from('content_similarity_cache')
    .upsert({
      user_id: userId,
      avg_similarity_to_population: result.avgSimilarity,
      min_similarity: result.minSimilarity,
      max_similarity: result.maxSimilarity,
      content_count: result.contentCount,
      originality_score: result.score,
      calculated_at: new Date().toISOString(),
      valid_until: validUntil.toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });

  if (error) {
    console.error('Failed to cache originality result:', error);
  }
}

export function getOriginalityLabel(score: number): string {
  if (score >= 90) return 'Ultra Original';
  if (score >= 70) return 'Highly Original';
  if (score >= 50) return 'Moderately Original';
  if (score >= 30) return 'Somewhat Common';
  return 'Very Common';
}
