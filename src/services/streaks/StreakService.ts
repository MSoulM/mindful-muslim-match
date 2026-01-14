import { createSupabaseClient } from '@/lib/supabase';
import type { SubscriptionTier } from '@/hooks/useSubscriptionTier';
import { MILESTONE_REWARDS, getMilestoneReward, type MilestoneDay } from './MilestoneRewards';

export interface StreakStatus {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  gracePeriodUsed: boolean;
  graceExpiresAt: string | null;
  milestonesAchieved: {
    day_7: boolean;
    day_14: boolean;
    day_30: boolean;
    day_60: boolean;
  };
  discountEarned: boolean;
  discountPercentage: number;
  discountExpiresAt: string | null;
  bonusCredits: number;
  nextMilestone: MilestoneDay | null;
  daysUntilNextMilestone: number | null;
}

export interface RecordActivityResult {
  success: boolean;
  streakUpdated: boolean;
  streakBefore: number;
  streakAfter: number;
  milestoneReached: MilestoneDay | null;
  rewardGiven: string | null;
  graceUsed: boolean;
  reset: boolean;
  error?: string;
}

export class StreakService {
  async recordActivity(clerkUserId: string, clerkToken: string | null, tier: SubscriptionTier = 'free'): Promise<RecordActivityResult> {
    try {
      const supabase = createSupabaseClient(clerkToken || undefined);
      if (!supabase) {
        return {
          success: false,
          streakUpdated: false,
          streakBefore: 0,
          streakAfter: 0,
          milestoneReached: null,
          rewardGiven: null,
          graceUsed: false,
          reset: false,
          error: 'Supabase client not configured',
        };
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayDate = today.toISOString().split('T')[0];

      const { data: existing, error: fetchError } = await supabase
        .from('streak_rewards')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existing) {
        const { data: newRecord, error: insertError } = await supabase
          .from('streak_rewards')
          .insert({
            clerk_user_id: clerkUserId,
            current_streak: 1,
            longest_streak: 1,
            last_activity_date: todayDate,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        await this.logHistory(clerkUserId, clerkToken, 'activity', 0, 1, null, null);

        return {
          success: true,
          streakUpdated: true,
          streakBefore: 0,
          streakAfter: 1,
          milestoneReached: null,
          rewardGiven: null,
          graceUsed: false,
          reset: false,
        };
      }

      const lastActivityDate = new Date(existing.last_activity_date);
      lastActivityDate.setHours(0, 0, 0, 0);
      const todayDateObj = new Date(todayDate);
      todayDateObj.setHours(0, 0, 0, 0);

      const daysSince = Math.floor((todayDateObj.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSince === 0) {
        return {
          success: true,
          streakUpdated: false,
          streakBefore: existing.current_streak,
          streakAfter: existing.current_streak,
          milestoneReached: null,
          rewardGiven: null,
          graceUsed: false,
          reset: false,
        };
      }

      let newStreak = existing.current_streak;
      let graceUsed = false;
      let reset = false;
      let milestoneReached: MilestoneDay | null = null;
      let rewardGiven: string | null = null;

      if (daysSince === 1) {
        newStreak = existing.current_streak + 1;
      } else if (daysSince >= 2 && daysSince <= 3 && !existing.grace_period_used) {
        newStreak = existing.current_streak + 1;
        graceUsed = true;
        const graceExpiresAt = new Date(today);
        graceExpiresAt.setHours(graceExpiresAt.getHours() + 72);
        
        await this.logHistory(clerkUserId, clerkToken, 'grace_used', existing.current_streak, newStreak, null, null);
      } else if (daysSince >= 4) {
        newStreak = 1;
        reset = true;
        await this.logHistory(clerkUserId, clerkToken, 'reset', existing.current_streak, 0, null, null);
      } else {
        return {
          success: true,
          streakUpdated: false,
          streakBefore: existing.current_streak,
          streakAfter: existing.current_streak,
          milestoneReached: null,
          rewardGiven: null,
          graceUsed: false,
          reset: false,
        };
      }

      const longestStreak = Math.max(newStreak, existing.longest_streak);
      const milestonesAchieved = { ...existing.milestones_achieved };
      let bonusCredits = existing.bonus_credits;
      let discountEarned = existing.discount_earned;
      let discountPercentage = existing.discount_percentage;
      let discountExpiresAt = existing.discount_expires_at;

      if (newStreak === 7 && !milestonesAchieved.day_7) {
        milestoneReached = 7;
        milestonesAchieved.day_7 = true;
        const reward = getMilestoneReward(7, tier);
        rewardGiven = reward.reward;
      } else if (newStreak === 14 && !milestonesAchieved.day_14) {
        milestoneReached = 14;
        milestonesAchieved.day_14 = true;
        const reward = getMilestoneReward(14, tier);
        rewardGiven = reward.reward;
        if (reward.credits) {
          bonusCredits += reward.credits;
        }
      } else if (newStreak === 30 && !milestonesAchieved.day_30) {
        milestoneReached = 30;
        milestonesAchieved.day_30 = true;
        const reward = getMilestoneReward(30, tier);
        rewardGiven = reward.reward;
        if (reward.credits) {
          bonusCredits += reward.credits;
        }
      } else if (newStreak === 60 && !milestonesAchieved.day_60) {
        milestoneReached = 60;
        milestonesAchieved.day_60 = true;
        const reward = getMilestoneReward(60, tier);
        rewardGiven = reward.reward;
        if (reward.discount) {
          discountEarned = true;
          discountPercentage = reward.discount;
          const expiresAt = new Date(today);
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          discountExpiresAt = expiresAt.toISOString();
        }
      }

      const updateData: any = {
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_activity_date: todayDate,
        milestones_achieved: milestonesAchieved,
        bonus_credits: bonusCredits,
        discount_earned: discountEarned,
        discount_percentage: discountPercentage,
        discount_expires_at: discountExpiresAt,
      };

      if (graceUsed) {
        updateData.grace_period_used = true;
        const graceExpiresAt = new Date(today);
        graceExpiresAt.setHours(graceExpiresAt.getHours() + 72);
        updateData.grace_expires_at = graceExpiresAt.toISOString();
      }

      if (reset) {
        updateData.grace_period_used = false;
        updateData.grace_expires_at = null;
      }

      const { error: updateError } = await supabase
        .from('streak_rewards')
        .update(updateData)
        .eq('clerk_user_id', clerkUserId);

      if (updateError) throw updateError;

      if (milestoneReached) {
        await this.logHistory(clerkUserId, clerkToken, 'milestone', existing.current_streak, newStreak, `day_${milestoneReached}`, rewardGiven);
      } else {
        await this.logHistory(clerkUserId, clerkToken, 'activity', existing.current_streak, newStreak, null, null);
      }

      return {
        success: true,
        streakUpdated: true,
        streakBefore: existing.current_streak,
        streakAfter: newStreak,
        milestoneReached,
        rewardGiven,
        graceUsed,
        reset,
      };
    } catch (error) {
      console.error('StreakService.recordActivity error:', error);
      return {
        success: false,
        streakUpdated: false,
        streakBefore: 0,
        streakAfter: 0,
        milestoneReached: null,
        rewardGiven: null,
        graceUsed: false,
        reset: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getStatus(clerkUserId: string, clerkToken: string | null): Promise<StreakStatus | null> {
    try {
      const supabase = createSupabaseClient(clerkToken || undefined);
      if (!supabase) {
        return null;
      }

      const { data, error } = await supabase
        .from('streak_rewards')
        .select('*')
        .eq('clerk_user_id', clerkUserId)
        .single();

      if (error && error.code === 'PGRST116') {
        return null;
      }

      if (error) throw error;

      const nextMilestone = this.getNextMilestone(data.current_streak);
      const daysUntilNext = nextMilestone ? nextMilestone - data.current_streak : null;

      return {
        currentStreak: data.current_streak,
        longestStreak: data.longest_streak,
        lastActivityDate: data.last_activity_date,
        gracePeriodUsed: data.grace_period_used,
        graceExpiresAt: data.grace_expires_at,
        milestonesAchieved: data.milestones_achieved,
        discountEarned: data.discount_earned,
        discountPercentage: data.discount_percentage,
        discountExpiresAt: data.discount_expires_at,
        bonusCredits: data.bonus_credits,
        nextMilestone,
        daysUntilNextMilestone: daysUntilNext,
      };
    } catch (error) {
      console.error('StreakService.getStatus error:', error);
      return null;
    }
  }

  private getNextMilestone(currentStreak: number): MilestoneDay | null {
    if (currentStreak < 7) return 7;
    if (currentStreak < 14) return 14;
    if (currentStreak < 30) return 30;
    if (currentStreak < 60) return 60;
    return null;
  }

  private async logHistory(
    clerkUserId: string,
    clerkToken: string | null,
    eventType: 'activity' | 'milestone' | 'reset' | 'grace_used' | 'discount_applied',
    streakBefore: number,
    streakAfter: number,
    milestoneReached: string | null,
    rewardGiven: string | null
  ): Promise<void> {
    try {
      const supabase = createSupabaseClient(clerkToken || undefined);
      if (!supabase) {
        console.error('Supabase client not configured for logging history');
        return;
      }

      await supabase.from('streak_history').insert({
        clerk_user_id: clerkUserId,
        event_type: eventType,
        streak_before: streakBefore,
        streak_after: streakAfter,
        milestone_reached: milestoneReached,
        reward_given: rewardGiven,
      });
    } catch (error) {
      console.error('Failed to log streak history:', error);
    }
  }
}

export const streakService = new StreakService();
