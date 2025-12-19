import { useProfile } from '@/hooks/useProfile';

export type SubscriptionTier = 'free' | 'gold' | 'unknown' | string;

export const useSubscriptionTier = () => {
  const { profile, isLoading } = useProfile();

  const tier: SubscriptionTier = profile?.subscriptionTier || 'free';
  const isGold = tier === 'gold';
  const isFree = tier === 'free' || !tier;

  return {
    tier,
    isGold,
    isFree,
    isLoading,
  };
};


