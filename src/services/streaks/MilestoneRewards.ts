import type { SubscriptionTier } from '@/hooks/useSubscriptionTier';

export type MilestoneDay = 7 | 14 | 30 | 60;

export interface MilestoneReward {
  milestone: MilestoneDay;
  gold: {
    reward: string;
    credits?: number;
    discount?: number;
  };
  gold_plus: {
    reward: string;
    credits?: number;
    discount?: number;
  };
}

export const MILESTONE_REWARDS: Record<MilestoneDay, MilestoneReward> = {
  7: {
    milestone: 7,
    gold: {
      reward: 'Personality Badge',
    },
    gold_plus: {
      reward: 'Personality Badge',
    },
  },
  14: {
    milestone: 14,
    gold: {
      reward: '+5 Bonus Credits',
      credits: 5,
    },
    gold_plus: {
      reward: '+10 Bonus Credits',
      credits: 10,
    },
  },
  30: {
    milestone: 30,
    gold: {
      reward: '+10 Bonus Credits',
      credits: 10,
    },
    gold_plus: {
      reward: '+20 Bonus Credits',
      credits: 20,
    },
  },
  60: {
    milestone: 60,
    gold: {
      reward: '10% Subscription Discount',
      discount: 10,
    },
    gold_plus: {
      reward: '20% Subscription Discount',
      discount: 20,
    },
  },
};

export function getMilestoneReward(day: MilestoneDay, tier: SubscriptionTier): MilestoneReward['gold'] | MilestoneReward['gold_plus'] {
  const milestone = MILESTONE_REWARDS[day];
  return tier === 'gold_plus' ? milestone.gold_plus : milestone.gold;
}

export function getNextMilestone(currentStreak: number): MilestoneDay | null {
  if (currentStreak < 7) return 7;
  if (currentStreak < 14) return 14;
  if (currentStreak < 30) return 30;
  if (currentStreak < 60) return 60;
  return null;
}

export function getDaysUntilNextMilestone(currentStreak: number): number | null {
  const next = getNextMilestone(currentStreak);
  if (!next) return null;
  return next - currentStreak;
}
