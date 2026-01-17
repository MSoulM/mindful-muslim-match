export type RarityTier = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface DNAComponentScores {
  traitRarity: number;
  profileDepth: number;
  behavioral: number;
  contentOriginality: number;
  culturalVariance: number;
}

export interface DNAScoreResult {
  finalScore: number;
  rarityTier: RarityTier;
  percentileRank: number;
  componentScores: DNAComponentScores;
  componentBreakdown: ComponentBreakdown;
  rareTraits: RareTrait[];
  uniqueBehaviors: UniqueBehavior[];
  approvedInsightsCount: number;
  daysActive: number;
  algorithmVersion: string;
  changeDelta?: number;
}

export interface ComponentBreakdown {
  traitRarity: {
    score: number;
    weight: number;
    weightedScore: number;
    explanation: string;
    dimensions?: Record<string, number>;
  };
  profileDepth: {
    score: number;
    weight: number;
    weightedScore: number;
    explanation: string;
    dimensions: ProfileDepthDimensions;
  };
  behavioral: {
    score: number;
    weight: number;
    weightedScore: number;
    explanation: string;
    dimensions?: Record<string, number>;
  };
  contentOriginality: {
    score: number;
    weight: number;
    weightedScore: number;
    explanation: string;
    originality?: number;
  };
  culturalVariance: {
    score: number;
    weight: number;
    weightedScore: number;
    explanation: string;
    cityCluster?: string;
  };
}

export interface ProfileDepthDimensions {
  religious: number;
  career: number;
  personality: number;
  lifestyle: number;
  family: number;
}

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

export interface TraitDistributionStat {
  trait_key: string;
  trait_category: string;
  trait_display_name?: string;
  user_count: number;
  total_users: number;
  frequency: number;
  idf_score: number;
}

export interface Profile {
  clerk_user_id: string;
  religion?: {
    sect?: string;
    practiceLevel?: string;
    halalPreference?: string;
  };
  education_level?: string;
  occupation?: string;
  industry?: string;
  annual_income_range?: string;
  bio?: string;
  smoking?: string;
  exercise_frequency?: string;
  dietary_preferences?: string[];
  hobbies?: string[];
  height?: number;
  build?: string;
  marital_status?: string;
  has_children?: boolean;
  wants_children?: boolean;
  family_structure?: string;
  family_values?: string;
  cultural_traditions?: string;
  hometown?: string;
  location?: string;
  lat?: number;
  lng?: number;
  created_at?: string;
}

export interface BehavioralTracking {
  metrics: {
    login_frequency?: number;
    post_frequency?: number;
    depth_trend?: number;
    interaction_consistency?: number;
    posting_span_days?: number;
  };
  z_scores?: Record<string, number>;
  uniqueness_score?: number;
}

export const RARITY_TIER_THRESHOLDS: Record<RarityTier, { min: number; max: number }> = {
  COMMON: { min: 0, max: 40 },
  UNCOMMON: { min: 41, max: 60 },
  RARE: { min: 61, max: 80 },
  EPIC: { min: 81, max: 95 },
  LEGENDARY: { min: 96, max: 100 }
};

export const COMPONENT_WEIGHTS = {
  traitRarity: 0.35,
  profileDepth: 0.25,
  behavioral: 0.20,
  contentOriginality: 0.15,
  culturalVariance: 0.05
};

export const MIN_APPROVED_INSIGHTS = 5;
export const MIN_DAYS_FOR_BEHAVIORAL = 7;
export const SCORE_HISTORY_RETENTION_MONTHS = 12;
export const DNA_CACHE_TTL_HOURS = 24;
export const ALGORITHM_VERSION = 'v1.0';
