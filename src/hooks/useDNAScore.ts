/**
 * MySoul DNA™ Score Hook
 * Manages the user's DNA score calculation and storage
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type RarityTier = 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';

export interface DNAScore {
  score: number;
  rarityTier: RarityTier;
  // Five DNA Strands with their weights:
  traitRarityScore: number;      // 35% weight - Trait Rarity
  profileDepthScore: number;     // 25% weight - Profile Depth
  behavioralScore: number;       // 20% weight - Behavioral
  contentScore: number;           // 15% weight - Content Originality
  culturalScore: number;          // 5% weight - Cultural Variance
  lastCalculatedAt: Date;
  // Business rule tracking
  approvedInsightsCount?: number;
  daysActive?: number;
  previousTier?: RarityTier;
  tierChangedAt?: Date;
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
      const { data, error: fetchError } = await supabase
        .from('mysoul_dna_scores')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (data) {
        setDnaScore({
          score: data.score,
          rarityTier: data.rarity_tier as RarityTier,
          traitRarityScore: data.trait_uniqueness_score || 0,
          profileDepthScore: data.profile_completeness_score || 0,
          behavioralScore: data.behavior_score || 0,
          contentScore: data.content_score || 0,
          culturalScore: data.cultural_score || 0,
          lastCalculatedAt: new Date(data.last_calculated_at),
          approvedInsightsCount: data.approved_insights_count || 0,
          daysActive: data.days_active || 0,
          previousTier: data.previous_tier as RarityTier | undefined,
          tierChangedAt: data.tier_changed_at ? new Date(data.tier_changed_at) : undefined
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

  // Calculate DNA score based on 5-strand weighted system
  // Spec: Trait Rarity (35%), Profile Depth (25%), Behavioral (20%), Content (15%), Cultural (5%)
  const calculateScore = useCallback(async (): Promise<{
    score: number;
    traitRarity: number;      // 35% weight (0-35 points)
    profileDepth: number;     // 25% weight (0-25 points)
    behavioral: number;       // 20% weight (0-20 points)
    content: number;          // 15% weight (0-15 points)
    cultural: number;         // 5% weight (0-5 points)
    approvedInsightsCount: number;
    daysActive: number;
  }> => {
    if (!userId) {
      return { 
        score: 0, 
        traitRarity: 0, 
        profileDepth: 0, 
        behavioral: 0, 
        content: 0, 
        cultural: 0,
        approvedInsightsCount: 0,
        daysActive: 0
      };
    }

    try {
      // Get user profile for location and other data
      const { data: profile } = await supabase
        .from('profiles')
        .select('location, lat, lng, created_at')
        .eq('clerk_user_id', userId)
        .maybeSingle();

      // Get user's posts
      const { data: posts } = await supabase
        .from('posts')
        .select('depth_level, categories, content, created_at, is_shared_content')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      // Get approved insights count (business rule: minimum 5 required)
      // Note: This should query from insights table where status = 'approved'
      // For now, using posts count as proxy
      const approvedInsightsCount = posts?.length || 0;

      // Calculate days active (business rule: 7+ days required for behavioral)
      const accountCreatedAt = profile?.created_at ? new Date(profile.created_at) : new Date();
      const daysActive = Math.floor((Date.now() - accountCreatedAt.getTime()) / (1000 * 60 * 60 * 24));

      // BUSINESS RULE: Minimum 5 approved insights required to generate DNA score
      if (approvedInsightsCount < 5) {
        return {
          score: 0,
          traitRarity: 0,
          profileDepth: 0,
          behavioral: 0,
          content: 0,
          cultural: 0,
          approvedInsightsCount,
          daysActive
        };
      }

      // 1. TRAIT RARITY (35% weight, 0-35 points)
      // Measures how unique traits are vs population
      let traitRarity = 0;
      if (posts && posts.length > 0) {
        const avgDepth = posts.reduce((sum, p) => sum + (p.depth_level || 1), 0) / posts.length;
        const uniqueCategories = new Set(posts.flatMap(p => p.categories || [])).size;
        
        // Depth contributes to rarity (deeper = rarer)
        const depthScore = Math.min(avgDepth * 7, 20); // Max 20 points from depth
        
        // Category variety contributes to rarity
        const varietyScore = Math.min(uniqueCategories * 3, 15); // Max 15 points from variety
        
        traitRarity = Math.round(depthScore + varietyScore);
      }

      // 2. PROFILE DEPTH (25% weight, 0-25 points)
      // Measures completeness across life dimensions
      const postsCount = posts?.length || 0;
      const profileDepth = Math.min(Math.floor(postsCount * 1.5), 25);

      // 3. BEHAVIORAL (20% weight, 0-20 points)
      // Measures interaction patterns & authenticity
      // BUSINESS RULE: Requires 7+ days of activity
      let behavioral = 0;
      if (daysActive >= 7 && posts && posts.length > 0) {
        const firstPostDate = new Date(posts[0].created_at);
        const lastPostDate = new Date(posts[posts.length - 1].created_at);
        const postingSpanDays = Math.max(1, Math.floor((lastPostDate.getTime() - firstPostDate.getTime()) / (1000 * 60 * 60 * 24)));
        
        // Consistency score (regular posting)
        const consistencyScore = Math.min(postingSpanDays / 7, 10); // Max 10 points
        
        // Engagement score (number of posts)
        const engagementScore = Math.min(postsCount / 2, 10); // Max 10 points
        
        behavioral = Math.round(consistencyScore + engagementScore);
      }

      // 4. CONTENT (15% weight, 0-15 points)
      // Measures originality of shared content
      let content = 0;
      if (posts && posts.length > 0) {
        const originalPosts = posts.filter(p => !p.is_shared_content).length;
        const totalPosts = posts.length;
        const originalityRatio = originalPosts / totalPosts;
        
        // Originality score (higher ratio = more original)
        const originalityScore = originalityRatio * 10; // Max 10 points
        
        // Content depth score (deeper content = more original)
        const avgContentDepth = posts.reduce((sum, p) => sum + (p.depth_level || 1), 0) / posts.length;
        const depthScore = Math.min((avgContentDepth - 1) * 1.67, 5); // Max 5 points
        
        content = Math.round(originalityScore + depthScore);
      }

      // 5. CULTURAL (5% weight, 0-5 points)
      // Measures uniqueness within city cluster
      let cultural = 0;
      if (profile?.location && posts && posts.length > 0) {
        // Get users in same city cluster (simplified: same city name)
        const { count: cityUsersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('location', profile.location);
        
        if (cityUsersCount && cityUsersCount > 1) {
          // Calculate uniqueness: fewer users in city = more unique
          // Inverse relationship: more users = less unique
          const uniquenessFactor = Math.max(0, 1 - (cityUsersCount / 1000)); // Normalize to 0-1
          cultural = Math.round(uniquenessFactor * 5); // Max 5 points
        } else {
          cultural = 5; // Very unique if no other users in city
        }
      }

      // Calculate weighted total score
      const totalScore = Math.round(
        traitRarity +      // 35% (already scaled to 0-35)
        profileDepth +     // 25% (already scaled to 0-25)
        behavioral +       // 20% (already scaled to 0-20)
        content +          // 15% (already scaled to 0-15)
        cultural           // 5% (already scaled to 0-5)
      );

      return {
        score: Math.min(totalScore, 100),
        traitRarity: Math.round(traitRarity),
        profileDepth: Math.round(profileDepth),
        behavioral: Math.round(behavioral),
        content: Math.round(content),
        cultural: Math.round(cultural),
        approvedInsightsCount,
        daysActive
      };
    } catch (err) {
      console.error('Error calculating DNA score:', err);
      return { 
        score: 0, 
        traitRarity: 0, 
        profileDepth: 0, 
        behavioral: 0, 
        content: 0, 
        cultural: 0,
        approvedInsightsCount: 0,
        daysActive: 0
      };
    }
  }, [userId]);

  // Calculate and save score to database
  const calculateAndSaveScore = useCallback(async () => {
    if (!userId) return;

    try {
      const { 
        score, 
        traitRarity, 
        profileDepth, 
        behavioral, 
        content, 
        cultural,
        approvedInsightsCount,
        daysActive
      } = await calculateScore();
      
      // Get current score to detect tier changes
      const { data: currentData } = await supabase
        .from('mysoul_dna_scores')
        .select('rarity_tier')
        .eq('user_id', userId)
        .maybeSingle();
      
      const currentTier = currentData?.rarity_tier as RarityTier | undefined;
      const newTier = getRarityTier(score);
      const tierChanged = currentTier && currentTier !== newTier;

      // Upsert the score
      const { error: upsertError } = await supabase
        .from('mysoul_dna_scores')
        .upsert({
          user_id: userId,
          score,
          rarity_tier: newTier,
          trait_uniqueness_score: traitRarity,  // Keep old column name for backward compatibility
          profile_completeness_score: profileDepth,  // Keep old column name
          behavior_score: behavioral,  // Keep old column name
          content_score: content,
          cultural_score: cultural,
          approved_insights_count: approvedInsightsCount,
          days_active: daysActive,
          previous_tier: tierChanged ? currentTier : null,
          tier_changed_at: tierChanged ? new Date().toISOString() : null,
          last_calculated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (upsertError) throw upsertError;

      // Show notification if tier changed
      if (tierChanged) {
        toast.success(`DNA Tier Upgraded!`, {
          description: `You've reached ${newTier} tier! 🎉`
        });
      }

      setDnaScore({
        score,
        rarityTier: newTier,
        traitRarityScore: traitRarity,
        profileDepthScore: profileDepth,
        behavioralScore: behavioral,
        contentScore: content,
        culturalScore: cultural,
        lastCalculatedAt: new Date(),
        approvedInsightsCount,
        daysActive,
        previousTier: tierChanged ? currentTier : undefined,
        tierChangedAt: tierChanged ? new Date() : undefined
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
