/**
 * City Leaderboard Hook for MySoul DNA™
 * Shows user's ranking within their city cluster
 * Gold+ users can view full leaderboard, Gold users see only their rank
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createSupabaseClient } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import { getDNAFeatureAccess } from '@/utils/dnaSubscriptionFeatures';

export interface LeaderboardEntry {
  userId: string;
  firstName?: string;
  lastName?: string;
  score: number;
  rarityTier: string;
  rank: number;
  isCurrentUser: boolean;
}

export interface CityLeaderboard {
  city: string;
  totalUsers: number;
  currentUserRank: number | null;
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export function useCityLeaderboard() {
  const { userId, getToken } = useAuth();
  const { profile } = useProfile();
  const { tier } = useSubscriptionTier();
  const [leaderboard, setLeaderboard] = useState<CityLeaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const featureAccess = getDNAFeatureAccess(tier);

  const fetchLeaderboard = useCallback(async () => {
    if (!userId || !profile?.location) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const supabase = createSupabaseClient(token || undefined);
      if (!supabase) {
        setError('Supabase client not configured');
        return;
      }

      // Get all users in the same city with DNA scores
      const { data: cityProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('clerk_user_id, first_name, last_name, location')
        .eq('location', profile.location);

      if (profilesError) throw profilesError;

      if (!cityProfiles || cityProfiles.length === 0) {
        setLeaderboard({
          city: profile.location,
          totalUsers: 0,
          currentUserRank: null,
          entries: [],
          lastUpdated: new Date()
        });
        setLoading(false);
        return;
      }

      const cityUserIds = cityProfiles.map(p => p.clerk_user_id);

      // Get DNA scores for all users in city
      const { data: dnaScores, error: scoresError } = await supabase
        .from('mysoul_dna_scores')
        .select('user_id, score, rarity_tier')
        .in('user_id', cityUserIds)
        .order('score', { ascending: false })
        .limit(featureAccess.canViewFullLeaderboard ? 100 : 1); // Gold+ gets top 100, Gold gets only their rank

      if (scoresError) throw scoresError;

      // Build leaderboard entries
      const entries: LeaderboardEntry[] = (dnaScores || []).map((score, index) => {
        const profileData = cityProfiles.find(p => p.clerk_user_id === score.user_id);
        return {
          userId: score.user_id,
          firstName: profileData?.first_name,
          lastName: profileData?.last_name,
          score: score.score,
          rarityTier: score.rarity_tier,
          rank: index + 1,
          isCurrentUser: score.user_id === userId
        };
      });

      // Find current user's rank
      const currentUserEntry = entries.find(e => e.isCurrentUser);
      let currentUserRank: number | null = currentUserEntry?.rank || null;

      // If Gold+ and user not in top 100, fetch their rank separately
      if (featureAccess.canViewFullLeaderboard && !currentUserEntry) {
        const { data: userScore } = await supabase
          .from('mysoul_dna_scores')
          .select('score')
          .eq('user_id', userId)
          .maybeSingle();

        if (userScore) {
          // Count users with higher scores
          const { count } = await supabase
            .from('mysoul_dna_scores')
            .select('*', { count: 'exact', head: true })
            .in('user_id', cityUserIds)
            .gt('score', userScore.score);

          currentUserRank = (count || 0) + 1;
        }
      }

      setLeaderboard({
        city: profile.location,
        totalUsers: cityProfiles.length,
        currentUserRank,
        entries: featureAccess.canViewFullLeaderboard ? entries : [], // Gold users don't see full list
        lastUpdated: new Date()
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch leaderboard';
      setError(message);
      console.error('Error fetching city leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, profile?.location, featureAccess.canViewFullLeaderboard, getToken]);

  useEffect(() => {
    if (userId && profile?.location) {
      fetchLeaderboard();
    }
  }, [userId, profile?.location, fetchLeaderboard]);

  // Calculate percentile
  const percentile = leaderboard && leaderboard.currentUserRank && leaderboard.totalUsers > 0
    ? Math.round(((leaderboard.totalUsers - leaderboard.currentUserRank + 1) / leaderboard.totalUsers) * 100)
    : null;

  return {
    leaderboard,
    loading,
    error,
    percentile,
    refetch: fetchLeaderboard,
    canViewFullLeaderboard: featureAccess.canViewFullLeaderboard
  };
}

