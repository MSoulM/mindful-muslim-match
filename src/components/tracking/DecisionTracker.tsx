/**
 * Decision Pattern Tracker Component
 * Tracks how users make matching decisions (skip, interest, pass)
 */

import { useEffect, useRef } from 'react';
import { MicroMomentTracker } from '@/services/MicroMomentTracker';

type DecisionType = 'skip' | 'interest' | 'pass' | 'like' | 'superlike';

interface DecisionTrackerProps {
  profileId: string;
  onDecision?: (decision: DecisionType) => void;
}

export const useDecisionTracker = ({ profileId }: DecisionTrackerProps) => {
  const profileShownTime = useRef(Date.now());
  const viewedSections = useRef<string[]>([]);
  const lastDecision = useRef<{ decision: DecisionType; time: number } | null>(null);

  // Track decision
  const trackDecision = (decision: DecisionType, metadata?: Record<string, any>) => {
    if (MicroMomentTracker.isOptedOut()) return;

    const decisionTime = Date.now() - profileShownTime.current;
    const scrollDepth = Math.round(
      (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
    );

    MicroMomentTracker.track('profile_decision', {
      profile_id: profileId,
      decision_type: decision,
      decision_time_ms: decisionTime,
      scroll_depth_at_decision: scrollDepth,
      sections_viewed: viewedSections.current,
      sections_viewed_count: viewedSections.current.length,
      is_instant: decisionTime < 3000, // Less than 3 seconds
      is_quick: decisionTime < 10000, // Less than 10 seconds
      is_considered: decisionTime > 30000, // More than 30 seconds
      time_of_day: new Date().getHours(),
      ...metadata,
    });

    // Store for reversal tracking
    lastDecision.current = {
      decision,
      time: Date.now(),
    };
  };

  // Track decision reversal
  const trackDecisionReversal = (newDecision: DecisionType) => {
    if (MicroMomentTracker.isOptedOut()) return;
    if (!lastDecision.current) return;

    const timeUntilReversal = Date.now() - lastDecision.current.time;

    MicroMomentTracker.track('decision_reversal', {
      profile_id: profileId,
      original_decision: lastDecision.current.decision,
      new_decision: newDecision,
      time_until_reversal_ms: timeUntilReversal,
      is_immediate_reversal: timeUntilReversal < 5000,
    });
  };

  // Track interest reason (when user explains why they're interested)
  const trackInterestReason = (reason: string) => {
    if (MicroMomentTracker.isOptedOut()) return;

    MicroMomentTracker.track('interest_reason', {
      profile_id: profileId,
      reason_length: reason.length,
      has_question_mark: reason.includes('?'),
      word_count: reason.split(/\s+/).length,
      is_detailed: reason.length > 100,
    });
  };

  // Track peak decision hours
  useEffect(() => {
    if (MicroMomentTracker.isOptedOut()) return;

    const hour = new Date().getHours();

    MicroMomentTracker.track('decision_time_context', {
      profile_id: profileId,
      hour_of_day: hour,
      is_morning: hour >= 6 && hour < 12,
      is_afternoon: hour >= 12 && hour < 18,
      is_evening: hour >= 18 && hour < 24,
      is_night: hour >= 0 && hour < 6,
      day_of_week: new Date().getDay(),
      is_weekend: [0, 6].includes(new Date().getDay()),
    });
  }, [profileId]);

  // Track sections viewed (updated by parent component)
  const updateViewedSections = (section: string) => {
    if (!viewedSections.current.includes(section)) {
      viewedSections.current.push(section);
    }
  };

  return {
    trackDecision,
    trackDecisionReversal,
    trackInterestReason,
    updateViewedSections,
  };
};

// Helper hook for tracking decision patterns across multiple profiles
export const useDecisionPatternAnalytics = () => {
  const decisionHistory = useRef<Array<{ profileId: string; decision: DecisionType; timestamp: number }>>([]);

  const recordDecision = (profileId: string, decision: DecisionType) => {
    decisionHistory.current.push({
      profileId,
      decision,
      timestamp: Date.now(),
    });

    // Keep only last 50 decisions
    if (decisionHistory.current.length > 50) {
      decisionHistory.current.shift();
    }

    // Analyze patterns every 10 decisions
    if (decisionHistory.current.length % 10 === 0) {
      analyzeDecisionPatterns();
    }
  };

  const analyzeDecisionPatterns = () => {
    if (MicroMomentTracker.isOptedOut()) return;

    const recentDecisions = decisionHistory.current.slice(-20);
    const decisionCounts = recentDecisions.reduce((acc, { decision }) => {
      acc[decision] = (acc[decision] || 0) + 1;
      return acc;
    }, {} as Record<DecisionType, number>);

    const avgDecisionTime = 
      recentDecisions.length > 1
        ? (recentDecisions[recentDecisions.length - 1].timestamp - recentDecisions[0].timestamp) /
          recentDecisions.length
        : 0;

    MicroMomentTracker.track('decision_pattern_analysis', {
      total_decisions: recentDecisions.length,
      decision_breakdown: decisionCounts,
      avg_decision_time_ms: Math.round(avgDecisionTime),
      skip_rate: ((decisionCounts.skip || 0) / recentDecisions.length) * 100,
      interest_rate: ((decisionCounts.interest || 0) / recentDecisions.length) * 100,
      is_selective: (decisionCounts.skip || 0) > (decisionCounts.interest || 0) * 2,
      is_open: (decisionCounts.interest || 0) > (decisionCounts.skip || 0),
    });
  };

  return { recordDecision };
};
