import { useProfile } from '@/hooks/useProfile';

/**
 * Subscription tiers for personality assessment features:
 * - free: No personality assessment access
 * - gold: RM49 - Full 5-question assessment, standard responses, 10k tokens/day, custom naming
 * - gold_plus: RM79 - Full 5-question assessment, enhanced memory, 25k tokens/day, custom naming, tone adjustments
 */
export type SubscriptionTier = 'free' | 'gold' | 'gold_plus' | 'unknown' | string;

export const useSubscriptionTier = () => {
  const { profile, isLoading } = useProfile();

  const tier: SubscriptionTier = profile?.subscriptionTier || 'free';
  const isGold = tier === 'gold' || tier === 'gold_plus';
  const isGoldPlus = tier === 'gold_plus';
  const isFree = tier === 'free' || !tier;

  return {
    tier,
    isGold,
    isGoldPlus,
    isFree,
    isLoading,
  };
};


