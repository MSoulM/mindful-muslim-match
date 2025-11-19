/**
 * Custom hook for managing Journey Milestone data
 */

import { useState, useEffect, useCallback } from 'react';
import { JourneyStatus, JourneyEvent, StageInfo } from '@/types/journey.types';
import { toast } from 'sonner';

// Mock data for development - replace with API calls
const MOCK_JOURNEY_STATUS: JourneyStatus = {
  current_stage: 'seed',
  dna_confidence: {
    overall: 12,
    surface: 25,
    behavioral: 8,
    emotional: 5,
    values: 10,
    relational: 0,
    evolution: 0,
  },
  progress_to_next: {
    meaningful_shares: 2,
    required_shares: 3,
    mmagent_chats: 0,
    required_chats: 1,
  },
  unlocked_features: ['browse_profiles', 'basic_chat'],
  badges_earned: ['newcomer'],
  days_in_current_stage: 3,
};

export const STAGE_INFO: Record<string, StageInfo> = {
  seed: {
    id: 'seed',
    name: 'Seed Stage',
    icon: 'Sprout',
    description: 'Beginning your journey with faith and intention',
    dnaRange: { min: 0, max: 15 },
    timeEstimate: 'Days 1-7',
    color: '#86efac',
    glowColor: 'rgba(134, 239, 172, 0.3)',
    features: ['Browse profiles', '1 MMAgent chat/day'],
    restrictions: ['Limited introductions', 'Basic matching only'],
  },
  sprout: {
    id: 'sprout',
    name: 'Sprout Stage',
    icon: 'Leaf',
    description: 'Growing through authentic sharing and reflection',
    dnaRange: { min: 15, max: 30 },
    timeEstimate: 'Weeks 2-4',
    color: '#5eead4',
    glowColor: 'rgba(94, 234, 212, 0.3)',
    features: ['3 introductions/week', 'Personality insights'],
    restrictions: ['Limited weekly matches'],
  },
  growth: {
    id: 'growth',
    name: 'Growth Stage',
    icon: 'TreeDeciduous',
    description: 'Deepening connections through meaningful engagement',
    dnaRange: { min: 30, max: 60 },
    timeEstimate: 'Months 2-3',
    color: '#34d399',
    glowColor: 'rgba(52, 211, 153, 0.3)',
    features: ['10 introductions/week', 'Deep DNA analysis', 'ChaiChat access'],
    restrictions: ['Standard matching speed'],
  },
  rooted: {
    id: 'rooted',
    name: 'Rooted Stage',
    icon: 'TreePine',
    description: 'Established presence with authentic self-expression',
    dnaRange: { min: 60, max: 85 },
    timeEstimate: 'Months 4-6',
    color: '#059669',
    glowColor: 'rgba(5, 150, 105, 0.3)',
    features: ['Unlimited connections', 'Priority matching', 'Advanced filters'],
    restrictions: [],
  },
  transcendent: {
    id: 'transcendent',
    name: 'Transcendent Stage',
    icon: 'Sparkles',
    description: 'Mastery of authentic connection and self-knowledge',
    dnaRange: { min: 85, max: 100 },
    timeEstimate: '6+ Months',
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    features: ['Full platform access', 'Legacy features', 'Matchmaker status'],
    restrictions: [],
  },
};

export function useJourney() {
  const [journeyStatus, setJourneyStatus] = useState<JourneyStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch journey status from API
  const fetchJourneyStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/user/journey-status');
      // const data = await response.json();
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setJourneyStatus(MOCK_JOURNEY_STATUS);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load journey status';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Track journey event
  const trackJourneyEvent = useCallback(async (event: JourneyEvent) => {
    try {
      // TODO: Replace with actual API call
      // await fetch('/api/user/journey-event', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
      
      console.log('Journey event tracked:', event);
      
      // Refresh journey status after event
      await fetchJourneyStatus();
    } catch (err) {
      console.error('Failed to track journey event:', err);
    }
  }, [fetchJourneyStatus]);

  // Calculate progress percentage to next stage
  const getProgressPercentage = useCallback(() => {
    if (!journeyStatus) return 0;
    
    const currentStage = STAGE_INFO[journeyStatus.current_stage];
    const dna = journeyStatus.dna_confidence.overall;
    const { min, max } = currentStage.dnaRange;
    
    return Math.min(((dna - min) / (max - min)) * 100, 100);
  }, [journeyStatus]);

  // Get estimated time to next stage
  const getTimeToNextStage = useCallback(() => {
    if (!journeyStatus) return null;
    
    const progress = journeyStatus.progress_to_next;
    const totalActions = progress.required_shares + progress.required_chats;
    const completedActions = progress.meaningful_shares + progress.mmagent_chats;
    const remaining = totalActions - completedActions;
    
    // Rough estimate: 1 action per day
    if (remaining <= 0) return 'Ready to advance!';
    if (remaining === 1) return '~1 day';
    if (remaining <= 7) return `~${remaining} days`;
    if (remaining <= 30) return `~${Math.ceil(remaining / 7)} weeks`;
    return `~${Math.ceil(remaining / 30)} months`;
  }, [journeyStatus]);

  // Check if feature is unlocked
  const isFeatureUnlocked = useCallback((feature: string) => {
    return journeyStatus?.unlocked_features.includes(feature) ?? false;
  }, [journeyStatus]);

  // Initial load
  useEffect(() => {
    fetchJourneyStatus();
  }, [fetchJourneyStatus]);

  return {
    journeyStatus,
    loading,
    error,
    refetch: fetchJourneyStatus,
    trackJourneyEvent,
    getProgressPercentage,
    getTimeToNextStage,
    isFeatureUnlocked,
    stageInfo: STAGE_INFO,
  };
}
