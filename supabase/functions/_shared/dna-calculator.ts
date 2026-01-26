/**
 * Shared DNA Calculator Module
 * 
 * This module contains the DNA calculation logic that should be used
 * by both the frontend MySoulDNACalculator class and Supabase edge functions.
 * 
 * IMPORTANT: Keep this in sync with src/services/dna/MySoulDNACalculator.ts
 */

export const MIN_APPROVED_INSIGHTS = 5;
export const MIN_DAYS_FOR_BEHAVIORAL = 7;
export const ALGORITHM_VERSION = 'v1.0';

export const COMPONENT_WEIGHTS = {
  traitRarity: 0.35,
  profileDepth: 0.25,
  behavioral: 0.20,
  contentOriginality: 0.15,
  culturalVariance: 0.05
};

export const RARITY_TIER_THRESHOLDS = {
  COMMON: { min: 0, max: 40 },
  UNCOMMON: { min: 41, max: 60 },
  RARE: { min: 61, max: 80 },
  EPIC: { min: 81, max: 95 },
  LEGENDARY: { min: 96, max: 100 }
};

export type RarityTier = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface RareTrait {
  category: string;
  trait: string;
  displayName: string;
  idfScore: number;
  frequency: number;
  percentile: number;
}

export interface UniqueBehavior {
  metric: string;
  displayName: string;
  value: number;
  populationMean: number;
  zScore: number;
  percentile: number;
}

export interface DNAScoreResult {
  finalScore: number;
  rarityTier: RarityTier;
  percentileRank: number;
  componentScores: {
    traitRarity: number;
    profileDepth: number;
    behavioral: number;
    contentOriginality: number;
    culturalVariance: number;
  };
  componentBreakdown: any;
  rareTraits: RareTrait[];
  uniqueBehaviors: UniqueBehavior[];
  approvedInsightsCount: number;
  daysActive: number;
  algorithmVersion: string;
}

/**
 * Calculate trait rarity score exactly as defined in TASK_03_MYSOUL_DNA_SYSTEM_FOR_MO_V2_0
 */
export async function calculateTraitRarity(
  supabase: any,
  approvedInsights: any[]
): Promise<{
  score: number;
  explanation: string;
  rareTraits: RareTrait[];
}> {
  // Step 1: Filter approved insights
  const insights = approvedInsights.filter(insight => insight.status === 'approved');
  
  if (insights.length === 0) {
    return {
      score: 0,
      explanation: 'No approved insights available for trait rarity calculation.',
      rareTraits: []
    };
  }

  // Step 2: Fetch all trait_distribution_stats and build a map
  const { data: allTraitStats } = await supabase
    .from('trait_distribution_stats')
    .select('*');

  const traitStatsMap = new Map<string, any>();
  if (allTraitStats) {
    allTraitStats.forEach((stat: any) => {
      traitStatsMap.set(stat.trait_key, stat);
    });
  }

  // Step 3: Process each insight
  let totalRarity = 0;
  const rareTraitsCandidates: Array<{
    category: string;
    trait: string;
    displayName: string;
    rarityScore: number;
    globalFrequency: number;
    confidenceScore: number;
  }> = [];

  for (const insight of insights) {
    // Extract trait_key from insight
    const traitKey = extractTraitKeyFromInsight(insight);
    
    // Look up frequency in trait_distribution_stats (default 0 if missing)
    const traitStat = traitKey ? traitStatsMap.get(traitKey) : null;
    const frequency = traitStat?.frequency ?? 0;

    // Calculate rarityScore based on frequency thresholds
    let rarityScore: number;
    if (frequency < 0.01) {
      rarityScore = 100;
    } else if (frequency < 0.05) {
      rarityScore = 90;
    } else if (frequency < 0.10) {
      rarityScore = 70;
    } else if (frequency < 0.25) {
      rarityScore = 50;
    } else if (frequency < 0.50) {
      rarityScore = 30;
    } else {
      rarityScore = 10;
    }

    // Add to totalRarity weighted by confidence_score (default 1 if missing)
    const confidenceScore = insight.confidence_score ?? 1;
    totalRarity += rarityScore * confidenceScore;

    // If rarityScore >= 70, push into rare_traits
    if (rarityScore >= 70 && traitStat) {
      rareTraitsCandidates.push({
        category: traitStat.trait_category || insight.insight_category || 'unknown',
        trait: traitKey || insight.title || 'unknown',
        displayName: traitStat.trait_display_name || insight.title || 'Unknown Trait',
        rarityScore,
        globalFrequency: frequency,
        confidenceScore
      });
    }
  }

  // Step 4: Calculate final trait_rarity_score
  const traitRarityScore = Math.min(100, Math.round(totalRarity / insights.length));

  // Sort rare_traits by rarityScore desc, then confidence desc, and take top 5
  const rareTraits: RareTrait[] = rareTraitsCandidates
    .sort((a, b) => {
      if (b.rarityScore !== a.rarityScore) {
        return b.rarityScore - a.rarityScore;
      }
      return b.confidenceScore - a.confidenceScore;
    })
    .slice(0, 5)
    .map(rt => ({
      category: rt.category,
      trait: rt.trait,
      displayName: rt.displayName,
      idfScore: 0, // Not used in this calculation method
      frequency: rt.globalFrequency,
      percentile: (1 - rt.globalFrequency) * 100
    }));

  return {
    score: traitRarityScore,
    explanation: rareTraits.length > 0
      ? `You have ${rareTraits.length} rare traits that make you unique.`
      : 'Your trait combination is moderately unique.',
    rareTraits
  };
}

/**
 * Extract trait_key from insight to match with trait_distribution_stats
 */
function extractTraitKeyFromInsight(insight: any): string | null {
  // Map insight_category to trait_category
  const categoryMap: Record<string, string> = {
    'values': 'religious',
    'personality': 'personality',
    'lifestyle': 'lifestyle',
    'interests': 'lifestyle',
    'family': 'family'
  };

  const traitCategory = categoryMap[insight.insight_category] || insight.insight_category || 'unknown';
  
  // Try to extract trait from title or description
  const title = (insight.title || '').toLowerCase();
  const description = (insight.description || '').toLowerCase();
  const text = `${title} ${description}`;
  
  // Try to match common trait patterns
  const traitPatterns = [
    /sect[:\s]+(\w+)/i,
    /practice[:\s]+(\w+)/i,
    /occupation[:\s]+(\w+)/i,
    /education[:\s]+(\w+)/i,
    /industry[:\s]+(\w+)/i,
    /marital[:\s]+status[:\s]+(\w+)/i,
    /family[:\s]+structure[:\s]+(\w+)/i,
    /family[:\s]+values[:\s]+(\w+)/i,
  ];
  
  for (const pattern of traitPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const traitValue = match[1].toLowerCase().trim();
      // Try to construct trait_key based on pattern
      if (pattern.source.includes('sect')) {
        return `sect:${traitValue}`;
      } else if (pattern.source.includes('practice')) {
        return `practice:${traitValue}`;
      } else if (pattern.source.includes('occupation')) {
        return `occupation:${traitValue}`;
      } else if (pattern.source.includes('education')) {
        return `education:${traitValue}`;
      } else if (pattern.source.includes('industry')) {
        return `industry:${traitValue}`;
      } else if (pattern.source.includes('marital')) {
        return `marital_status:${traitValue}`;
      } else if (pattern.source.includes('family.*structure')) {
        return `family_structure:${traitValue}`;
      } else if (pattern.source.includes('family.*values')) {
        return `family_values:${traitValue}`;
      }
    }
  }
  
  // Fallback: create a normalized key from first meaningful words of title
  const words = title.split(/\s+/).filter((w: string) => w.length > 2).slice(0, 2);
  if (words.length > 0) {
    const traitValue = words.join('_').replace(/[^a-z0-9_]/g, '');
    return `${traitCategory}:${traitValue}`;
  }
  
  // Last resort: use insight ID hash
  return `${traitCategory}:insight_${insight.id?.substring(0, 8) || 'unknown'}`;
}

export function calculateDaysActive(createdAt?: string): number {
  if (!createdAt) return 0;
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
}

export function getRarityTier(score: number): RarityTier {
  if (score >= RARITY_TIER_THRESHOLDS.LEGENDARY.min) return 'LEGENDARY';
  if (score >= RARITY_TIER_THRESHOLDS.EPIC.min) return 'EPIC';
  if (score >= RARITY_TIER_THRESHOLDS.RARE.min) return 'RARE';
  if (score >= RARITY_TIER_THRESHOLDS.UNCOMMON.min) return 'UNCOMMON';
  return 'COMMON';
}

/**
 * Calculate Profile Depth score per Task 3 requirements
 * 
 * Implementation:
 * 1. Query user_profile_fields where user_id=userId and dimension in
 *    ['religious','career','personality','lifestyle','family']
 * 2. For any missing dimension, treat completion=0
 * 3. Compute score = average(completion_percentage) across the 5 dimensions
 * 4. Clamp 0-100 and round to 2 decimals
 * 5. Return ComponentDetail with per-dimension details
 */
export async function calculateProfileDepth(
  supabase: any,
  userId: string
): Promise<{
  score: number;
  explanation: string;
  dimensions: {
    religious: number;
    career: number;
    personality: number;
    lifestyle: number;
    family: number;
  };
  missingDimensions: string[];
}> {
  // Query user_profile_fields for all 5 dimensions
  const { data: profileFields } = await supabase
    .from('user_profile_fields')
    .select('dimension, completion_percentage')
    .eq('user_id', userId)
    .in('dimension', ['religious', 'career', 'personality', 'lifestyle', 'family']);

  // Build dimensions map (default to 0 for missing dimensions)
  const dimensionsMap = new Map<string, number>();
  const allDimensions = ['religious', 'career', 'personality', 'lifestyle', 'family'];
  
  if (profileFields) {
    profileFields.forEach((field: any) => {
      dimensionsMap.set(field.dimension, Number(field.completion_percentage) || 0);
    });
  }

  // Build dimensions object and identify missing ones
  const dimensions = {
    religious: dimensionsMap.get('religious') || 0,
    career: dimensionsMap.get('career') || 0,
    personality: dimensionsMap.get('personality') || 0,
    lifestyle: dimensionsMap.get('lifestyle') || 0,
    family: dimensionsMap.get('family') || 0
  };

  const missingDimensions = allDimensions.filter(dim => !dimensionsMap.has(dim));

  // Calculate average completion across 5 dimensions
  const sum = dimensions.religious + dimensions.career + dimensions.personality + 
              dimensions.lifestyle + dimensions.family;
  const avgScore = sum / 5;

  // Clamp 0-100 and round to 2 decimals
  const score = Math.max(0, Math.min(100, Math.round(avgScore * 100) / 100));

  const completedDimensions = Object.values(dimensions).filter(d => d >= 70).length;
  const explanation = missingDimensions.length > 0
    ? `Profile is ${score.toFixed(2)}% complete. ${completedDimensions}/5 dimensions well-developed. Missing: ${missingDimensions.join(', ')}.`
    : `Profile is ${score.toFixed(2)}% complete across 5 dimensions. ${completedDimensions}/5 dimensions are well-developed.`;

  return {
    score,
    explanation,
    dimensions,
    missingDimensions
  };
}
