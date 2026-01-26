import { SupabaseClient } from '@supabase/supabase-js';
import {
  DNAScoreResult,
  DNAComponentScores,
  ComponentBreakdown,
  RareTrait,
  UniqueBehavior,
  RarityTier,
  Profile,
  ProfileDepthDimensions,
  TraitDistributionStat,
  BehavioralTracking,
  RARITY_TIER_THRESHOLDS,
  COMPONENT_WEIGHTS,
  MIN_APPROVED_INSIGHTS,
  MIN_DAYS_FOR_BEHAVIORAL,
  ALGORITHM_VERSION
} from './types';

export class MySoulDNACalculator {
  constructor(private supabase: SupabaseClient) {}

  async calculateDNAScore(userId: string): Promise<DNAScoreResult> {
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (!profile) {
      throw new Error('Profile not found');
    }

    const { data: approvedInsights } = await this.supabase
      .from('user_insights')
      .select('*')
      .eq('clerk_user_id', userId)
      .eq('status', 'approved');

    const approvedInsightsCount = approvedInsights?.length || 0;

    const daysActive = this.calculateDaysActive(profile.created_at);

    if (approvedInsightsCount < MIN_APPROVED_INSIGHTS) {
      return this.createSeedState(userId, approvedInsightsCount, daysActive);
    }

    const [
      traitRarityScore,
      profileDepthScore,
      behavioralScoreResult,
      contentOriginalityScore,
      culturalVarianceScore
    ] = await Promise.all([
      this.calculateTraitRarity(userId, approvedInsights || []),
      this.calculateProfileDepth(userId),
      this.calculateBehavioralUniqueness(userId, daysActive),
      this.calculateContentOriginality(userId),
      this.calculateCulturalVariance(userId, profile)
    ]);

    const behavioralScore = behavioralScoreResult;

    const componentScores: DNAComponentScores = {
      traitRarity: traitRarityScore.score,
      profileDepth: profileDepthScore.score,
      behavioral: behavioralScore.score,
      contentOriginality: contentOriginalityScore.score,
      culturalVariance: culturalVarianceScore.score
    };

    const finalScore = this.calculateFinalScore(componentScores);
    const rarityTier = this.getRarityTier(finalScore);

    const { data: existingScore } = await this.supabase
      .from('mysoul_dna_scores')
      .select('score')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    const changeDelta = existingScore ? finalScore - existingScore.score : undefined;

    const percentileRank = await this.calculatePercentileRank(finalScore);

    const componentBreakdown: ComponentBreakdown = {
      traitRarity: {
        score: componentScores.traitRarity,
        weight: COMPONENT_WEIGHTS.traitRarity,
        weightedScore: componentScores.traitRarity * COMPONENT_WEIGHTS.traitRarity,
        explanation: traitRarityScore.explanation,
        dimensions: traitRarityScore.dimensions
      },
      profileDepth: {
        score: componentScores.profileDepth,
        weight: COMPONENT_WEIGHTS.profileDepth,
        weightedScore: Math.round(componentScores.profileDepth * COMPONENT_WEIGHTS.profileDepth * 100) / 100,
        explanation: profileDepthScore.explanation,
        dimensions: profileDepthScore.dimensions,
        missingDimensions: profileDepthScore.missingDimensions || []
      },
      behavioral: {
        score: componentScores.behavioral,
        weight: COMPONENT_WEIGHTS.behavioral,
        weightedScore: Math.round(componentScores.behavioral * COMPONENT_WEIGHTS.behavioral * 100) / 100,
        explanation: behavioralScore.explanation,
        dimensions: behavioralScore.dimensions, // Per-metric z-scores
        details: behavioralScore.metricDetailsFull || (behavioralScore.dimensions ? Object.entries(behavioralScore.dimensions).reduce((acc, [key, zScore]) => {
          // Get user value and population mean from uniqueBehaviors if available
          const behavior = behavioralScore.uniqueBehaviors.find(b => b.metric === key);
          acc[key] = { 
            zScore, 
            userValue: behavior?.value || 0, 
            populationMean: behavior?.populationMean || 0 
          };
          return acc;
        }, {} as Record<string, { zScore: number; userValue: number; populationMean: number }>) : undefined)
      },
      contentOriginality: {
        score: componentScores.contentOriginality,
        weight: COMPONENT_WEIGHTS.contentOriginality,
        weightedScore: componentScores.contentOriginality * COMPONENT_WEIGHTS.contentOriginality,
        explanation: contentOriginalityScore.explanation,
        originality: contentOriginalityScore.originality
      },
      culturalVariance: {
        score: componentScores.culturalVariance,
        weight: COMPONENT_WEIGHTS.culturalVariance,
        weightedScore: componentScores.culturalVariance * COMPONENT_WEIGHTS.culturalVariance,
        explanation: culturalVarianceScore.explanation,
        cityCluster: culturalVarianceScore.cityCluster
      }
    };

    return {
      finalScore: Math.round(finalScore),
      rarityTier,
      percentileRank,
      componentScores,
      componentBreakdown,
      rareTraits: traitRarityScore.rareTraits,
      uniqueBehaviors: behavioralScore.uniqueBehaviors,
      approvedInsightsCount,
      daysActive,
      algorithmVersion: ALGORITHM_VERSION,
      changeDelta
    };
  }

  private createSeedState(userId: string, approvedInsightsCount: number, daysActive: number): DNAScoreResult {
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
      componentBreakdown: {
        traitRarity: {
          score: 0,
          weight: COMPONENT_WEIGHTS.traitRarity,
          weightedScore: 0,
          explanation: `Need at least ${MIN_APPROVED_INSIGHTS} approved insights to calculate trait rarity. You have ${approvedInsightsCount}.`
        },
        profileDepth: {
          score: 0,
          weight: COMPONENT_WEIGHTS.profileDepth,
          weightedScore: 0,
          explanation: 'Profile depth will be calculated once you have enough approved insights.',
          dimensions: { religious: 0, career: 0, personality: 0, lifestyle: 0, family: 0 }
        },
        behavioral: {
          score: 0,
          weight: COMPONENT_WEIGHTS.behavioral,
          weightedScore: 0,
          explanation: 'Behavioral uniqueness requires more activity time and approved insights.'
        },
        contentOriginality: {
          score: 0,
          weight: COMPONENT_WEIGHTS.contentOriginality,
          weightedScore: 0,
          explanation: 'Content originality will be calculated from your posts.'
        },
        culturalVariance: {
          score: 0,
          weight: COMPONENT_WEIGHTS.culturalVariance,
          weightedScore: 0,
          explanation: 'Cultural variance will be assessed against your city cluster.'
        }
      },
      rareTraits: [],
      uniqueBehaviors: [],
      approvedInsightsCount,
      daysActive,
      algorithmVersion: ALGORITHM_VERSION
    };
  }

  /**
   * Calculate trait rarity score exactly as defined in TASK_03_MYSOUL_DNA_SYSTEM_FOR_MO_V2_0
   * 
   * Algorithm:
   * 1. Fetch approved insights from user_insights where user_id = profile.id and status='approved'
   * 2. Fetch all trait_distribution_stats (insight_text, global_percentage) and build a map
   * 3. For each insight:
   *    - frequency = global_percentage (default 0 if missing)
   *    - Calculate rarityScore based on frequency thresholds
   *    - totalRarity += rarityScore * (confidence_score || 1)
   *    - If rarityScore >= 70, push into rare_traits
   * 4. trait_rarity_score = min(100, totalRarity / insights.length)
   * 
   * Persist:
   * - trait_rarity_score into mysoul_dna_scores.trait_rarity_score
   * - rare_traits (top 5 by rarityScore desc, then confidence) into mysoul_dna_scores.rare_traits
   */
  async calculateTraitRarity(userId: string, approvedInsights: any[]): Promise<{
    score: number;
    explanation: string;
    rareTraits: RareTrait[];
    dimensions?: Record<string, number>;
  }> {
    // Step 1: Fetch approved insights (already passed as parameter, but ensure they're approved)
    // Note: Spec says user_id = profile.id, but schema uses clerk_user_id
    // Using approvedInsights passed from calculateDNAScore which already filters by clerk_user_id and status='approved'
    const insights = approvedInsights.filter(insight => insight.status === 'approved');
    
    if (insights.length === 0) {
      return {
        score: 0,
        explanation: 'No approved insights available for trait rarity calculation.',
        rareTraits: []
      };
    }

    // Step 2: Fetch all trait_distribution_stats and build a map
    const { data: allTraitStats } = await this.supabase
      .from('trait_distribution_stats')
      .select('*');

    const traitStatsMap = new Map<string, any>();
    if (allTraitStats) {
      allTraitStats.forEach(stat => {
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
      // Try to match insight to trait_distribution_stats
      // Strategy: Use insight_category to map to trait_category, then try to extract trait_key
      const traitKey = this.extractTraitKeyFromInsight(insight);
      
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
   * 
   * The spec mentions matching insight_text with trait_distribution_stats.
   * Since insights don't have a direct trait_key field, we need to extract it.
   * 
   * Strategy:
   * 1. Map insight_category to trait_category
   * 2. Try to extract trait identifier from title/description
   * 3. Match with existing trait_keys in trait_distribution_stats
   * 4. If no match, use a normalized key based on insight content
   */
  private extractTraitKeyFromInsight(insight: any): string | null {
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
    // Look for common patterns like "sect:", "practice:", "occupation:", etc.
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
    const words = title.split(/\s+/).filter(w => w.length > 2).slice(0, 2);
    if (words.length > 0) {
      const traitValue = words.join('_').replace(/[^a-z0-9_]/g, '');
      return `${traitCategory}:${traitValue}`;
    }
    
    // Last resort: use insight ID hash (ensures uniqueness but not ideal)
    return `${traitCategory}:insight_${insight.id?.substring(0, 8) || 'unknown'}`;
  }

  private extractTraitsFromProfile(userId: string): Array<{ key: string; value: any }> {
    return [];
  }

  private groupTraitScoresByCategory(traitScores: any[]): Record<string, number> {
    const categories: Record<string, number[]> = {};
    
    traitScores.forEach(t => {
      const cat = t.stat.trait_category;
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(t.normalizedScore);
    });

    const result: Record<string, number> = {};
    for (const [cat, scores] of Object.entries(categories)) {
      result[cat] = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
    }
    
    return result;
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
  async calculateProfileDepth(userId: string): Promise<{
    score: number;
    explanation: string;
    dimensions: ProfileDepthDimensions;
    missingDimensions: string[];
  }> {
    // Query user_profile_fields for all 5 dimensions
    const { data: profileFields } = await this.supabase
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
    const dimensions: ProfileDepthDimensions = {
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

  private scoreReligiousDimension(profile: Profile): number {
    let score = 0;
    const fields = [
      profile.religion?.sect,
      profile.religion?.practiceLevel,
      profile.religion?.halalPreference
    ];
    
    const filledFields = fields.filter(f => f).length;
    score = (filledFields / fields.length) * 100;
    
    return Math.round(score);
  }

  private scoreCareerDimension(profile: Profile): number {
    let score = 0;
    const fields = [
      profile.education_level,
      profile.occupation,
      profile.industry,
      profile.annual_income_range
    ];
    
    const filledFields = fields.filter(f => f).length;
    score = (filledFields / fields.length) * 100;
    
    return Math.round(score);
  }

  private scorePersonalityDimension(profile: Profile): number {
    let score = 0;
    if (profile.bio && profile.bio.length > 50) score += 100;
    else if (profile.bio && profile.bio.length > 20) score += 50;
    
    return Math.round(score);
  }

  private scoreLifestyleDimension(profile: Profile): number {
    let score = 0;
    const fields = [
      profile.smoking,
      profile.exercise_frequency,
      profile.dietary_preferences?.length ? 'yes' : null,
      profile.hobbies?.length ? 'yes' : null,
      profile.height,
      profile.build
    ];
    
    const filledFields = fields.filter(f => f).length;
    score = (filledFields / fields.length) * 100;
    
    return Math.round(score);
  }

  private scoreFamilyDimension(profile: Profile): number {
    let score = 0;
    const fields = [
      profile.marital_status,
      typeof profile.has_children === 'boolean' ? 'yes' : null,
      typeof profile.wants_children === 'boolean' ? 'yes' : null,
      profile.family_structure,
      profile.family_values,
      profile.cultural_traditions,
      profile.hometown
    ];
    
    const filledFields = fields.filter(f => f).length;
    score = (filledFields / fields.length) * 100;
    
    return Math.round(score);
  }

  /**
   * Calculate Behavioral Uniqueness score per Task 3 requirements
   * 
   * Implementation:
   * 1. Gate: Check if user has <7 days activity OR no behavioral_tracking row
   * 2. Fetch latest behavioral_tracking row (tracking_period_end DESC)
   * 3. Fetch population stats (mean and stddev) for each metric
   * 4. Calculate Z-scores: z = (user_value - mean) / stddev
   * 5. Convert combined |z| into 0-100 behavioral_uniqueness_score
   * 6. Build unique_behaviors array with metrics where |z| >= 1.5
   * 7. Return with per-metric z-scores in dimensions
   */
  async calculateBehavioralUniqueness(userId: string, daysActive: number): Promise<{
    score: number;
    explanation: string;
    uniqueBehaviors: UniqueBehavior[];
    dimensions?: Record<string, number>;
  }> {
    // Gate: Check if user has <7 days activity
    if (daysActive < MIN_DAYS_FOR_BEHAVIORAL) {
      return {
        score: 0,
        explanation: `Insufficient data: Need at least ${MIN_DAYS_FOR_BEHAVIORAL} days of activity. You have ${daysActive} days.`,
        uniqueBehaviors: []
      };
    }

    // Get profile_id from profiles table
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (!profile?.id) {
      return {
        score: 0,
        explanation: 'Insufficient data: Profile not found for behavioral tracking.',
        uniqueBehaviors: []
      };
    }

    // Get most recent behavioral tracking period (tracking_period_end DESC)
    const { data: behavioralData } = await this.supabase
      .from('behavioral_tracking')
      .select('*')
      .eq('profile_id', profile.id)
      .order('tracking_period_end', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Gate: Check if no behavioral_tracking row exists
    if (!behavioralData) {
      return {
        score: 0,
        explanation: 'Insufficient data: No behavioral tracking data available yet. Behavioral patterns will be calculated after 7 days of activity.',
        uniqueBehaviors: []
      };
    }

    // Define metrics to calculate Z-scores for
    const metrics = [
      { key: 'avg_response_time_hours', name: 'Response Time', description: 'Average time to respond to messages' },
      { key: 'avg_message_length', name: 'Message Length', description: 'Average length of messages sent' },
      { key: 'peak_activity_hour', name: 'Peak Activity Hour', description: 'Hour of day when most active' },
      { key: 'emoji_usage_rate', name: 'Emoji Usage', description: 'Frequency of emoji usage in messages' },
      { key: 'voice_message_ratio', name: 'Voice Messages', description: 'Ratio of voice to text messages' },
      { key: 'profile_views_per_day', name: 'Profile Views', description: 'Average profile views per day' },
      { key: 'match_acceptance_rate', name: 'Match Acceptance', description: 'Rate of accepting matches' },
      { key: 'weekend_activity_ratio', name: 'Weekend Activity', description: 'Ratio of activity on weekends' },
      { key: 'messages_per_match', name: 'Messages per Match', description: 'Average messages exchanged per match' }
    ];

    // Fetch population statistics for each metric
    const populationStats: Record<string, { mean: number; stddev: number }> = {};
    
    for (const metric of metrics) {
      // Try RPC function first
      const { data: rpcStats, error: rpcError } = await this.supabase.rpc('calculate_metric_population_stats', {
        metric_column: metric.key,
        period_start: behavioralData.period_start,
        period_end: behavioralData.period_end
      });

      if (!rpcError && rpcStats && rpcStats.length > 0) {
        const stats = rpcStats[0];
        populationStats[metric.key] = {
          mean: Number(stats.mean) || 0,
          stddev: Number(stats.stddev) || 0
        };
      } else {
        // Fallback: Calculate directly from behavioral_tracking table
        const { data: allData } = await this.supabase
          .from('behavioral_tracking')
          .select(metric.key)
          .eq('period_start', behavioralData.period_start)
          .eq('period_end', behavioralData.period_end)
          .not(metric.key, 'is', null);

        if (allData && allData.length > 0) {
          const values = allData.map((d: any) => Number(d[metric.key])).filter((v: number) => !isNaN(v));
          if (values.length > 0) {
            const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
            const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
            const stddev = Math.sqrt(variance);
            populationStats[metric.key] = { mean, stddev };
          }
        }
      }
    }

    // Calculate Z-scores for each metric
    const zScores: Record<string, number> = {};
    const metricDetails: Record<string, number> = {}; // Per-metric z-scores for component breakdown
    const metricDetailsFull: Record<string, { zScore: number; userValue: number; populationMean: number }> = {};
    const Z_SCORE_THRESHOLD = 1.5; // Threshold for unique behaviors

    for (const metric of metrics) {
      const userValue = behavioralData[metric.key];
      if (userValue === null || userValue === undefined) {
        continue;
      }

      const stats = populationStats[metric.key];
      if (!stats || stats.stddev === 0) {
        // If no population data or stddev is 0, skip this metric
        continue;
      }

      const zScore = (Number(userValue) - stats.mean) / stats.stddev;
      zScores[metric.key] = zScore;
      metricDetails[metric.key] = zScore;
      metricDetailsFull[metric.key] = {
        zScore,
        userValue: Number(userValue),
        populationMean: stats.mean
      };
    }

    // Convert combined |z| into 0-100 behavioral_uniqueness_score
    // Formula: Sum of absolute Z-scores, normalized and clamped
    const totalAbsZScore = Object.values(zScores).reduce((sum, z) => sum + Math.abs(z), 0);
    const avgAbsZScore = Object.keys(zScores).length > 0 ? totalAbsZScore / Object.keys(zScores).length : 0;
    
    // Map average absolute Z-score to 0-100 scale
    // avgAbsZScore of 0 = 50 (average), avgAbsZScore of 2+ = 100 (very unique)
    const behavioralUniquenessScore = Math.max(0, Math.min(100, Math.round(50 + (avgAbsZScore * 25))));

    // Build unique_behaviors array (metrics where |z| >= threshold)
    const uniqueBehaviors: UniqueBehavior[] = [];
    
    Object.entries(zScores).forEach(([metricKey, zScore]) => {
      if (Math.abs(zScore) >= Z_SCORE_THRESHOLD) {
        const metric = metrics.find(m => m.key === metricKey);
        const userValue = behavioralData[metricKey];
        const stats = populationStats[metricKey];
        
        uniqueBehaviors.push({
          metric: metricKey,
          displayName: metric?.name || metricKey,
          value: Number(userValue) || 0,
          populationMean: stats?.mean || 0,
          zScore,
          percentile: this.zScoreToPercentile(zScore),
          description: metric?.description
        });
      }
    });

    // Sort by absolute Z-score descending
    uniqueBehaviors.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));

    const explanation = uniqueBehaviors.length > 0
      ? `Your behavior shows ${uniqueBehaviors.length} unique pattern${uniqueBehaviors.length > 1 ? 's' : ''} that make you stand out.`
      : 'Your behavioral patterns are within normal range.';

    return {
      score: behavioralUniquenessScore,
      explanation,
      uniqueBehaviors,
      dimensions: metricDetails, // Per-metric z-scores for component breakdown
      metricDetailsFull // Full details with userValue and populationMean
    };
  }

  async calculateContentOriginality(userId: string): Promise<{
    score: number;
    explanation: string;
    originality?: number;
  }> {
    const { data: dnaScore } = await this.supabase
      .from('mysoul_dna_scores')
      .select('content_originality_score, content_originality_percentile')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    if (dnaScore?.content_originality_score !== null && dnaScore?.content_originality_score !== undefined) {
      const score = dnaScore.content_originality_score;
      const percentile = dnaScore.content_originality_percentile || 50;
      
      return {
        score,
        explanation: `Your content is ${percentile}% more original than other users.`,
        originality: score
      };
    }

    return {
      score: 50,
      explanation: 'Content originality will be calculated as you create more posts.',
      originality: 50
    };
  }

  async calculateCulturalVariance(userId: string, profile: Profile): Promise<{
    score: number;
    explanation: string;
    cityCluster?: string;
  }> {
    if (!profile.location) {
      return {
        score: 50,
        explanation: 'Cultural variance requires location information.'
      };
    }

    const { data: cityAssignment } = await this.supabase
      .from('user_city_assignments')
      .select('city_key')
      .eq('clerk_user_id', userId)
      .eq('is_current', true)
      .maybeSingle();

    const cityKey = cityAssignment?.city_key || 'london';

    const { data: cityProfiles, count: totalInCity } = await this.supabase
      .from('profiles')
      .select('*', { count: 'exact', head: false })
      .eq('location', profile.location)
      .limit(100);

    if (!cityProfiles || cityProfiles.length < 5) {
      return {
        score: 50,
        explanation: `You're in ${cityKey} cluster with limited comparison data.`,
        cityCluster: cityKey
      };
    }

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
    const score = Math.round(uniquenessRatio * 100);

    return {
      score,
      explanation: `You are ${score}% different from others in ${cityKey} cluster.`,
      cityCluster: cityKey
    };
  }

  private calculateFinalScore(components: DNAComponentScores): number {
    return (
      components.traitRarity * COMPONENT_WEIGHTS.traitRarity +
      components.profileDepth * COMPONENT_WEIGHTS.profileDepth +
      components.behavioral * COMPONENT_WEIGHTS.behavioral +
      components.contentOriginality * COMPONENT_WEIGHTS.contentOriginality +
      components.culturalVariance * COMPONENT_WEIGHTS.culturalVariance
    );
  }

  private getRarityTier(score: number): RarityTier {
    if (score >= RARITY_TIER_THRESHOLDS.LEGENDARY.min) return 'LEGENDARY';
    if (score >= RARITY_TIER_THRESHOLDS.EPIC.min) return 'EPIC';
    if (score >= RARITY_TIER_THRESHOLDS.RARE.min) return 'RARE';
    if (score >= RARITY_TIER_THRESHOLDS.UNCOMMON.min) return 'UNCOMMON';
    return 'COMMON';
  }

  private async calculatePercentileRank(score: number): Promise<number> {
    const { data } = await this.supabase.rpc('calculate_dna_percentile_rank', {
      user_score: score
    });

    return data || 50;
  }

  private calculateDaysActive(createdAt?: string): number {
    if (!createdAt) return 0;
    const created = new Date(createdAt);
    const now = new Date();
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  }

  async saveDNAScore(userId: string, result: DNAScoreResult): Promise<void> {
    const { data: existing } = await this.supabase
      .from('mysoul_dna_scores')
      .select('rarity_tier')
      .eq('clerk_user_id', userId)
      .maybeSingle();

    const previousTier = existing?.rarity_tier;
    const tierChanged = previousTier && previousTier !== result.rarityTier;

    await this.supabase
      .from('mysoul_dna_scores')
      .upsert({
        user_id: userId,
        score: result.finalScore,
        rarity_tier: result.rarityTier,
        percentile_rank: result.percentileRank,
        trait_rarity_raw_score: result.componentScores.traitRarity,
        profile_depth_raw_score: result.componentScores.profileDepth,
        behavioral_raw_score: result.componentScores.behavioral,
        behavioral_uniqueness_score: result.componentScores.behavioral, // Also store as behavioral_uniqueness_score
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
  }
}
