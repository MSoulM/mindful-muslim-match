import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { insightsApi, UserInsight, GamificationProgress } from '@/services/api/insights';
import { useToast } from '@/hooks/use-toast';

export function useInsights() {
  const { getToken } = useAuth();
  const [pendingInsights, setPendingInsights] = useState<UserInsight[]>([]);
  const [approvedInsights, setApprovedInsights] = useState<UserInsight[]>([]);
  const [progress, setProgress] = useState<GamificationProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPendingInsights = useCallback(async () => {
    try {
      setError(null);
      const insights = await insightsApi.getPendingInsights(getToken);
      setPendingInsights(insights);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch pending insights';
      setError(message);
      console.error('Error fetching pending insights:', err);
    }
  }, [getToken]);

  const fetchApprovedInsights = useCallback(async () => {
    try {
      setError(null);
      const result = await insightsApi.getApprovedInsights(50, 0, getToken);
      setApprovedInsights(result.insights);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch approved insights';
      setError(message);
      console.error('Error fetching approved insights:', err);
    }
  }, [getToken]);

  const fetchProgress = useCallback(async () => {
    try {
      setError(null);
      const prog = await insightsApi.getGamificationProgress(getToken);
      setProgress(prog);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch progress';
      setError(message);
      console.error('Error fetching progress:', err);
    }
  }, [getToken]);

  const approveInsight = useCallback(async (insightId: string) => {
    try {
      setError(null);
      const result = await insightsApi.approveInsight(insightId, getToken);
      setPendingInsights(prev => prev.filter(i => i.id !== insightId));
      setApprovedInsights(prev => [result.insight, ...prev]);
      if (result.progress) {
        setProgress(result.progress);
      }
      await fetchApprovedInsights();
      toast({
        title: "Insight Approved! +10 points",
        description: "This helps improve your matching accuracy",
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to approve insight';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  }, [getToken, toast, fetchApprovedInsights]);

  const rejectInsight = useCallback(async (insightId: string) => {
    try {
      setError(null);
      const result = await insightsApi.rejectInsight(insightId, getToken);
      setPendingInsights(prev => prev.filter(i => i.id !== insightId));
      if (result.progress) {
        setProgress(result.progress);
      }
      toast({
        title: "Feedback Received",
        description: "Your feedback helps us learn better",
      });
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reject insight';
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      throw err;
    }
  }, [getToken, toast]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchPendingInsights(),
        fetchProgress(),
        fetchApprovedInsights(),
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchPendingInsights, fetchProgress, fetchApprovedInsights]);

  return {
    pendingInsights,
    approvedInsights,
    progress,
    loading,
    error,
    approveInsight,
    rejectInsight,
    refetchPending: fetchPendingInsights,
    refetchApproved: fetchApprovedInsights,
    refetchProgress: fetchProgress,
  };
}
