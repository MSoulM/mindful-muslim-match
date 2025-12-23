/**
 * MySoul DNA™ Score Hook
 * Manages the user's DNA score calculation and storage
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';
import { supabase as originalSupabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface DNAScore {
  score: number;
  rarityTier: RarityTier;
  traitUniquenessScore: number;
  profileCompletenessScore: number;
  behaviorScore: number;
  lastCalculatedAt: Date;
}

// Rarity tier configuration
export const RARITY_CONFIG: Record<RarityTier, {
  minScore: number;
  maxScore: number;
  color: string;
  bgGradient: string;
  glowColor: string;
  description: string;
}> = {
  Common: {
    minScore: 0,
    maxScore: 40,
    color: '#9CA3AF',
    bgGradient: 'from-gray-400 to-gray-500',
    glowColor: 'rgba(156, 163, 175, 0.3)',
    description: 'Just getting started'
  },
  Uncommon: {
    minScore: 41,
    maxScore: 60,
    color: '#22C55E',
    bgGradient: 'from-green-400 to-green-500',
    glowColor: 'rgba(34, 197, 94, 0.3)',
    description: 'Building your identity'
  },
  Rare: {
    minScore: 61,
    maxScore: 80,
    color: '#3B82F6',
    bgGradient: 'from-blue-400 to-blue-600',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    description: 'Standing out from the crowd'
  },
  Epic: {
    minScore: 81,
    maxScore: 95,
    color: '#A855F7',
    bgGradient: 'from-purple-400 to-purple-600',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    description: 'Exceptionally unique'
  },
  Legendary: {
    minScore: 96,
    maxScore: 100,
    color: '#F59E0B',
    bgGradient: 'from-amber-400 to-orange-500',
    glowColor: 'rgba(245, 158, 11, 0.5)',
    description: 'One in a million'
  }
};

// Get rarity tier from score
export const getRarityTier = (score: number): RarityTier => {
  if (score >= 96) return 'Legendary';
  if (score >= 81) return 'Epic';
  if (score >= 61) return 'Rare';
  if (score >= 41) return 'Uncommon';
  return 'Common';
};

// Get rarity config for a score
export const getRarityConfig = (score: number) => {
  const tier = getRarityTier(score);
  return { tier, ...RARITY_CONFIG[tier] };
};

// DNA Score row type for database
interface DNAScoreRow {
  id: string;
  user_id: string;
  score: number;
  rarity_tier: string;
  trait_uniqueness_score: number;
  profile_completeness_score: number;
  behavior_score: number;
  last_calculated_at: string;
  created_at: string;
  updated_at: string;
}

export function useDNAScore() {
  const { userId, isLoaded } = useAuth();
  const [dnaScore, setDnaScore] = useState<DNAScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch DNA score from database
  const fetchDNAScore = useCallback(async () => {
    if (!userId || !isLoaded) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Use the Cloud Supabase client with the correct table name
      const { data, error: fetchError } = await supabase
        .from('user_dna_scores')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (data) {
        const row = data as DNAScoreRow;
        setDnaScore({
          score: row.score,
          rarityTier: row.rarity_tier as RarityTier,
          traitUniquenessScore: row.trait_uniqueness_score,
          profileCompletenessScore: row.profile_completeness_score,
          behaviorScore: row.behavior_score,
          lastCalculatedAt: new Date(row.last_calculated_at)
        });
      } else {
        // No score exists yet, calculate and create one
        await calculateAndSaveScore();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch DNA score';
      setError(message);
      console.error('Error fetching DNA score:', err);
    } finally {
      setLoading(false);
    }
  }, [userId, isLoaded]);

  // Calculate DNA score based on various factors
  const calculateScore = useCallback(async (): Promise<{
    score: number;
    traitUniqueness: number;
    profileCompleteness: number;
    behavior: number;
  }> => {
    if (!userId) {
      return { score: 0, traitUniqueness: 0, profileCompleteness: 0, behavior: 0 };
    }

    try {
      // Use the original Supabase client to query posts (which has the posts table)
      if (!originalSupabase) {
        console.warn('Original Supabase client not available');
        return { score: 0, traitUniqueness: 0, profileCompleteness: 0, behavior: 0 };
      }

      // Get user's posts count for profile completeness
      const { count: postsCount } = await originalSupabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('clerk_user_id', userId);

      // Calculate profile completeness (0-40 points)
      // More posts = more complete profile
      const postScore = Math.min((postsCount || 0) * 8, 40);

      // Calculate trait uniqueness (0-35 points)
      // Based on depth levels and variety of categories
      const { data: posts } = await originalSupabase
        .from('posts')
        .select('depth_level, categories')
        .eq('clerk_user_id', userId);

      let uniquenessScore = 0;
      if (posts && posts.length > 0) {
        const avgDepth = posts.reduce((sum: number, p: any) => sum + (p.depth_level || 0), 0) / posts.length;
        const uniqueCategories = new Set(posts.flatMap((p: any) => p.categories || [])).size;
        
        uniquenessScore = Math.min(
          (avgDepth * 5) + (uniqueCategories * 5),
          35
        );
      }

      // Calculate behavior score (0-25 points)
      // Based on engagement patterns (simplified for MVP)
      const daysSinceFirstPost = posts && posts.length > 0 ? 7 : 0; // Placeholder
      const behaviorScore = Math.min(daysSinceFirstPost * 3, 25);

      const totalScore = Math.round(postScore + uniquenessScore + behaviorScore);

      return {
        score: Math.min(totalScore, 100),
        traitUniqueness: Math.round(uniquenessScore),
        profileCompleteness: Math.round(postScore),
        behavior: Math.round(behaviorScore)
      };
    } catch (err) {
      console.error('Error calculating DNA score:', err);
      return { score: 0, traitUniqueness: 0, profileCompleteness: 0, behavior: 0 };
    }
  }, [userId]);

  // Calculate and save score to database
  const calculateAndSaveScore = useCallback(async () => {
    if (!userId) return;

    try {
      const { score, traitUniqueness, profileCompleteness, behavior } = await calculateScore();
      const rarityTier = getRarityTier(score);

      // Upsert the score using Cloud Supabase
      const { error: upsertError } = await supabase
        .from('user_dna_scores')
        .upsert({
          user_id: userId,
          score,
          rarity_tier: rarityTier,
          trait_uniqueness_score: traitUniqueness,
          profile_completeness_score: profileCompleteness,
          behavior_score: behavior,
          last_calculated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) throw upsertError;

      setDnaScore({
        score,
        rarityTier,
        traitUniquenessScore: traitUniqueness,
        profileCompletenessScore: profileCompleteness,
        behaviorScore: behavior,
        lastCalculatedAt: new Date()
      });
    } catch (err) {
      console.error('Error saving DNA score:', err);
    }
  }, [userId, calculateScore]);

  // Recalculate score (call this after profile updates)
  const recalculateScore = useCallback(async () => {
    setLoading(true);
    try {
      await calculateAndSaveScore();
      toast.success('DNA score updated!');
    } catch (err) {
      toast.error('Failed to update DNA score');
    } finally {
      setLoading(false);
    }
  }, [calculateAndSaveScore]);

  // Initial load
  useEffect(() => {
    if (isLoaded && userId) {
      fetchDNAScore();
    } else if (isLoaded && !userId) {
      setLoading(false);
    }
  }, [isLoaded, userId, fetchDNAScore]);

  return {
    dnaScore,
    loading,
    error,
    recalculateScore,
    refetch: fetchDNAScore,
    rarityConfig: dnaScore ? getRarityConfig(dnaScore.score) : null
  };
}
