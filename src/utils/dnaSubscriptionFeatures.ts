/**
 * MySoul DNA™ Subscription Tier Feature Gating
 * Based on specification:
 * - Gold (RM49): Basic score + tier, Top 3 rare traits, Current scores only, Your rank shown, Basic compatibility
 * - Gold+ (RM79): Full breakdown + trends, All rare traits, Historical trends + graphs, Full leaderboard access, Shared rare traits highlighted, Personalized strand development
 */

import type { SubscriptionTier } from '@/hooks/useSubscriptionTier';

export interface DNAFeatureAccess {
  // Score Display
  canViewFullBreakdown: boolean;
  canViewTrends: boolean;
  
  // Rare Traits
  canViewAllRareTraits: boolean;
  maxRareTraitsShown: number;
  
  // Analytics
  canViewHistoricalTrends: boolean;
  canViewGraphs: boolean;
  
  // Leaderboard
  canViewFullLeaderboard: boolean;
  canViewOwnRank: boolean;
  
  // Matching
  canViewSharedRareTraits: boolean;
  
  // Growth Insights
  canViewPersonalizedInsights: boolean;
}

/**
 * Get DNA feature access based on subscription tier
 */
export function getDNAFeatureAccess(tier: SubscriptionTier): DNAFeatureAccess {
  const isGold = tier === 'gold';
  const isGoldPlus = tier === 'gold_plus';
  
  if (isGoldPlus) {
    // Gold+ (RM79) - Full access
    return {
      canViewFullBreakdown: true,
      canViewTrends: true,
      canViewAllRareTraits: true,
      maxRareTraitsShown: Infinity,
      canViewHistoricalTrends: true,
      canViewGraphs: true,
      canViewFullLeaderboard: true,
      canViewOwnRank: true,
      canViewSharedRareTraits: true,
      canViewPersonalizedInsights: true,
    };
  } else if (isGold) {
    // Gold (RM49) - Basic access
    return {
      canViewFullBreakdown: false,
      canViewTrends: false,
      canViewAllRareTraits: false,
      maxRareTraitsShown: 3,
      canViewHistoricalTrends: false,
      canViewGraphs: false,
      canViewFullLeaderboard: false,
      canViewOwnRank: true,
      canViewSharedRareTraits: false,
      canViewPersonalizedInsights: false,
    };
  } else {
    // Free tier - No DNA access
    return {
      canViewFullBreakdown: false,
      canViewTrends: false,
      canViewAllRareTraits: false,
      maxRareTraitsShown: 0,
      canViewHistoricalTrends: false,
      canViewGraphs: false,
      canViewFullLeaderboard: false,
      canViewOwnRank: false,
      canViewSharedRareTraits: false,
      canViewPersonalizedInsights: false,
    };
  }
}

