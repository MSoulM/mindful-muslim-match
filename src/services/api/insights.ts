const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface UserInsight {
  id: string;
  clerk_user_id: string;
  insight_category: 'values' | 'personality' | 'lifestyle' | 'interests' | 'family';
  title: string;
  description: string;
  source_quote: string | null;
  confidence_score: number;
  status: 'pending' | 'approved' | 'rejected';
  contributes_to_dna: boolean;
  dna_weight: number | null;
  reviewed_at: string | null;
  created_at: string;
  expires_at: string;
  updated_at: string;
}

export interface GamificationProgress {
  id: string;
  clerk_user_id: string;
  total_points: number;
  insights_reviewed: number;
  insights_approved: number;
  insights_rejected: number;
  streak_days: number;
  last_review_date: string | null;
  longest_streak: number;
  badges: string[];
  milestone_25: boolean;
  milestone_50: boolean;
  milestone_75: boolean;
  milestone_100: boolean;
  bonus_5_insights: boolean;
  bonus_10_insights: boolean;
  bonus_70_percent_profile: boolean;
  bonus_3_day_streak: boolean;
  bonus_7_day_streak: boolean;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const insightsApi = {
  async getPendingInsights(getToken: () => Promise<string | null>): Promise<UserInsight[]> {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/insights-pending`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch pending insights');
    }

    return (data as { insights: UserInsight[] }).insights || [];
  },

  async approveInsight(insightId: string, getToken: () => Promise<string | null>): Promise<{ insight: UserInsight; progress: GamificationProgress | null }> {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/insights-approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ insightId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to approve insight');
    }

    return data as { insight: UserInsight; progress: GamificationProgress | null };
  },

  async rejectInsight(insightId: string, getToken: () => Promise<string | null>): Promise<{ insight: UserInsight; progress: GamificationProgress | null }> {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/insights-reject`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ insightId }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to reject insight');
    }

    return data as { insight: UserInsight; progress: GamificationProgress | null };
  },

  async getApprovedInsights(limit = 50, offset = 0, getToken: () => Promise<string | null>): Promise<{ insights: UserInsight[]; total: number }> {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/insights-approved?limit=${limit}&offset=${offset}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch approved insights');
    }

    return data as { insights: UserInsight[]; total: number };
  },

  async getGamificationProgress(getToken: () => Promise<string | null>): Promise<GamificationProgress> {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/gamification-progress`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch gamification progress');
    }

    return data as GamificationProgress;
  },

  async getBadges(getToken: () => Promise<string | null>): Promise<Badge[]> {
    const token = await getToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/gamification-badges`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch badges');
    }

    return (data as { badges: Badge[] }).badges || [];
  },
};
