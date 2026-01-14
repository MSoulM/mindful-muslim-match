const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface StreakStatus {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
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
  nextMilestone: number | null;
  daysUntilNextMilestone: number | null;
}

export interface RecordActivityResult {
  success: boolean;
  streakUpdated: boolean;
  streakBefore: number;
  streakAfter: number;
  milestoneReached: number | null;
  rewardGiven: string | null;
  graceUsed: boolean;
  reset: boolean;
  error?: string;
}

export const streaksApi = {
  async recordActivity(
    tier: string,
    getToken: () => Promise<string | null>
  ): Promise<RecordActivityResult> {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/streaks-activity`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tier }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to record streak activity');
    }

    return data as RecordActivityResult;
  },

  async getStatus(getToken: () => Promise<string | null>): Promise<StreakStatus> {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/streaks-status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch streak status');
    }

    return data as StreakStatus;
  },
};
