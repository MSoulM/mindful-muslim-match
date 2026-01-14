import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import { streaksApi, type StreakStatus, type RecordActivityResult } from '@/services/api/streaks';

export interface UseStreakReturn {
  status: StreakStatus | null;
  loading: boolean;
  error: string | null;
  recordActivity: () => Promise<RecordActivityResult | null>;
  refresh: () => Promise<void>;
  milestoneReached: number | null;
  showMilestonePopup: boolean;
  milestoneReward: string | null;
  dismissMilestone: () => void;
}

export function useStreak(): UseStreakReturn {
  const { getToken } = useAuth();
  const { tier } = useSubscriptionTier();
  const [status, setStatus] = useState<StreakStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [milestoneReached, setMilestoneReached] = useState<number | null>(null);
  const [milestoneReward, setMilestoneReward] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = await getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      const data = await streaksApi.getStatus(() => Promise.resolve(token));
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch streak status');
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  const recordActivity = useCallback(async (): Promise<RecordActivityResult | null> => {
    try {
      setError(null);
      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }
      const result = await streaksApi.recordActivity(tier, () => Promise.resolve(token));
      
      if (result.success && result.milestoneReached) {
        setMilestoneReached(result.milestoneReached);
        setMilestoneReward(result.rewardGiven || null);
      }

      if (result.success) {
        await fetchStatus();
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record activity');
      return null;
    }
  }, [getToken, tier, fetchStatus]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const dismissMilestone = useCallback(() => {
    setMilestoneReached(null);
    setMilestoneReward(null);
  }, []);

  return {
    status,
    loading,
    error,
    recordActivity,
    refresh: fetchStatus,
    milestoneReached,
    showMilestonePopup: milestoneReached !== null,
    milestoneReward,
    dismissMilestone,
  };
}
