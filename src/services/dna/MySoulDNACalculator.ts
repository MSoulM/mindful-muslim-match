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
      behavioralScore,
      contentOriginalityScore,
      culturalVarianceScore
    ] = await Promise.all([
      this.calculateTraitRarity(userId, approvedInsights || []),
      this.calculateProfileDepth(profile),
      this.calculateBehavioralUniqueness(userId, daysActive),
      this.calculateContentOriginality(userId),
      this.calculateCulturalVariance(userId, profile)
    ]);

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
      .eq('user_id', userId)
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
        weightedScore: componentScores.profileDepth * COMPONENT_WEIGHTS.profileDepth,
        explanation: profileDepthScore.explanation,
        dimensions: profileDepthScore.dimensions
      },
      behavioral: {
        score: componentScores.behavioral,
        weight: COMPONENT_WEIGHTS.behavioral,
        weightedScore: componentScores.behavioral * COMPONENT_WEIGHTS.behavioral,
        explanation: behavioralScore.explanation,
        dimensions: behavioralScore.dimensions
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

  async calculateTraitRarity(userId: string, approvedInsights: any[]): Promise<{
    score: number;
    explanation: string;
    rareTraits: RareTrait[];
    dimensions?: Record<string, number>;
  }> {
    const traits = this.extractTraitsFromProfile(userId);
    
    const { data: traitStats } = await this.supabase
      .from('trait_distribution_stats')
      .select('*')
      .in('trait_key', traits.map(t => t.key));

    if (!traitStats || traitStats.length === 0) {
      return {
        score: 50,
        explanation: 'Trait rarity baseline - awaiting distribution data.',
        rareTraits: []
      };
    }

    const traitScores = traits
      .map(trait => {
        const stat = traitStats.find(s => s.trait_key === trait.key);
        if (!stat) return null;
        
        const idfScore = stat.idf_score || 0;
        const normalizedScore = Math.min(100, (idfScore / 5) * 100);
        
        return {
          trait,
          stat,
          normalizedScore
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    const avgScore = traitScores.length > 0
      ? traitScores.reduce((sum, t) => sum + t.normalizedScore, 0) / traitScores.length
      : 50;

    const rareTraits: RareTrait[] = traitScores
      .filter(t => t.stat.frequency < 0.1)
      .sort((a, b) => b.stat.idf_score - a.stat.idf_score)
      .slice(0, 5)
      .map(t => ({
        category: t.stat.trait_category,
        trait: t.trait.key,
        displayName: t.stat.trait_display_name || t.trait.key,
        idfScore: t.stat.idf_score,
        frequency: t.stat.frequency,
        percentile: (1 - t.stat.frequency) * 100
      }));

    const categoryScores = this.groupTraitScoresByCategory(traitScores);

    return {
      score: Math.round(avgScore),
      explanation: rareTraits.length > 0
        ? `You have ${rareTraits.length} rare traits that make you unique.`
        : 'Your trait combination is moderately unique.',
      rareTraits,
      dimensions: categoryScores
    };
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

  async calculateProfileDepth(profile: Profile): Promise<{
    score: number;
    explanation: string;
    dimensions: ProfileDepthDimensions;
  }> {
    const dimensions: ProfileDepthDimensions = {
      religious: this.scoreReligiousDimension(profile),
      career: this.scoreCareerDimension(profile),
      personality: this.scorePersonalityDimension(profile),
      lifestyle: this.scoreLifestyleDimension(profile),
      family: this.scoreFamilyDimension(profile)
    };

    const avgScore = (dimensions.religious + dimensions.career + dimensions.personality + dimensions.lifestyle + dimensions.family) / 5;

    const completedDimensions = Object.values(dimensions).filter(d => d >= 70).length;

    return {
      score: Math.round(avgScore),
      explanation: `Profile is ${Math.round(avgScore)}% complete across 5 dimensions. ${completedDimensions}/5 dimensions are well-developed.`,
      dimensions
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

  async calculateBehavioralUniqueness(userId: string, daysActive: number): Promise<{
    score: number;
    explanation: string;
    uniqueBehaviors: UniqueBehavior[];
    dimensions?: Record<string, number>;
  }> {
    if (daysActive < MIN_DAYS_FOR_BEHAVIORAL) {
      return {
        score: 0,
        explanation: `Need at least ${MIN_DAYS_FOR_BEHAVIORAL} days of activity. You have ${daysActive} days.`,
        uniqueBehaviors: []
      };
    }

    const { data: posts } = await this.supabase
      .from('posts')
      .select('depth_level, created_at')
      .eq('clerk_user_id', userId)
      .order('created_at', { ascending: true });

    if (!posts || posts.length === 0) {
      return {
        score: 30,
        explanation: 'Behavioral patterns will emerge as you create more content.',
        uniqueBehaviors: []
      };
    }

    const postCount = posts.length;
    const avgDepth = posts.reduce((sum, p) => sum + (p.depth_level || 1), 0) / postCount;
    
    const firstPost = new Date(posts[0].created_at);
    const lastPost = new Date(posts[posts.length - 1].created_at);
    const postingSpanDays = Math.max(1, Math.floor((lastPost.getTime() - firstPost.getTime()) / (1000 * 60 * 60 * 24)));
    const postFrequency = postCount / Math.max(1, postingSpanDays);

    const consistencyScore = Math.min(100, (postingSpanDays / 30) * 50);
    const depthScore = Math.min(100, (avgDepth / 5) * 100);
    const frequencyScore = Math.min(100, postFrequency * 20);

    const overallScore = (consistencyScore + depthScore + frequencyScore) / 3;

    const uniqueBehaviors: UniqueBehavior[] = [];

    if (avgDepth >= 4) {
      uniqueBehaviors.push({
        metric: 'depth_level',
        displayName: 'Deep Content Creator',
        value: avgDepth,
        populationMean: 2.5,
        zScore: (avgDepth - 2.5) / 1.0,
        percentile: 90
      });
    }

    if (postFrequency > 1.5) {
      uniqueBehaviors.push({
        metric: 'post_frequency',
        displayName: 'Highly Active Poster',
        value: postFrequency,
        populationMean: 0.5,
        zScore: (postFrequency - 0.5) / 0.5,
        percentile: 85
      });
    }

    return {
      score: Math.round(overallScore),
      explanation: uniqueBehaviors.length > 0
        ? `You exhibit ${uniqueBehaviors.length} unique behavioral patterns.`
        : 'Your behavioral patterns are emerging as you engage more.',
      uniqueBehaviors,
      dimensions: {
        consistency: Math.round(consistencyScore),
        depth: Math.round(depthScore),
        frequency: Math.round(frequencyScore)
      }
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
      .eq('user_id', userId)
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
      .eq('user_id', userId)
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
      .eq('user_id', userId)
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
  }
}
