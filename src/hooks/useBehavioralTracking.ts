import { useCallback, useEffect, useRef } from 'react';
import posthog from 'posthog-js';
import { MicroMomentTracker } from '@/services/MicroMomentTracker';
import { behavioralTracker, trackBehavioralEvent } from '@/utils/behavioralTracking';

/**
 * Comprehensive behavioral tracking hook
 * Captures user interaction patterns while respecting privacy
 */
export const useBehavioralTracking = () => {
  const messageStartTime = useRef<number>();
  const lastActivityTime = useRef<number>(Date.now());
  const sessionStartTime = useRef<number>(Date.now());

  // Check if tracking is enabled
  const isTrackingEnabled = useCallback(() => {
    return !MicroMomentTracker.isOptedOut();
  }, []);

  /**
   * Track message sending behavior
   * Extracts behavioral signals without capturing content
   */
  const trackMessageSent = useCallback((message: string, recipientId?: string) => {
    if (!isTrackingEnabled()) return;

    const responseTime = messageStartTime.current 
      ? Date.now() - messageStartTime.current 
      : null;
    
    // Extract behavioral signals (content-agnostic)
    const messageLength = message.length;
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]/gu;
    const emojis = message.match(emojiRegex) || [];
    const hasQuestionMark = message.includes('?');
    const hasExclamation = message.includes('!');
    const paragraphs = message.split('\n\n').length;
    const sentences = message.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    
    // Categorize message length
    const lengthCategory = 
      messageLength < 50 ? 'brief' :
      messageLength < 150 ? 'medium' : 'detailed';
    
    // Categorize response time
    const responseCategory = !responseTime ? 'first_message' :
      responseTime < 60000 ? 'immediate' :      // < 1 min
      responseTime < 300000 ? 'quick' :         // < 5 min
      responseTime < 3600000 ? 'thoughtful' :   // < 1 hour
      'delayed';                                 // > 1 hour
    
    // Send to PostHog with privacy-safe metadata using batched tracker
    try {
      trackBehavioralEvent.messageStyle({
        // Message structure
        length_category: lengthCategory,
        character_count_range: Math.floor(messageLength / 50) * 50, // Rounded to nearest 50
        paragraph_count: paragraphs,
        sentence_count: sentences,
        
        // Emotional expression
        emoji_count: emojis.length,
        emoji_density: messageLength > 0 ? (emojis.length / messageLength * 100).toFixed(1) : 0,
        unique_emoji_types: [...new Set(emojis)].length,
        has_question: hasQuestionMark,
        has_exclamation: hasExclamation,
        
        // Timing
        response_category: responseCategory,
        response_time_seconds: responseTime ? Math.round(responseTime / 1000) : null,
        hour_of_day: new Date().getHours(),
        day_of_week: new Date().getDay(),
        
        // Context
        session_duration_minutes: Math.round((Date.now() - sessionStartTime.current) / 60000),
      });
    } catch (error) {
      console.warn('PostHog tracking failed:', error);
    }
    
    // Reset for next message
    messageStartTime.current = Date.now();
  }, [isTrackingEnabled]);

  /**
   * Track message received for response time calculation
   */
  const trackMessageReceived = useCallback(() => {
    if (!isTrackingEnabled()) return;
    messageStartTime.current = Date.now();
  }, [isTrackingEnabled]);

  /**
   * Track profile viewing behavior
   */
  const trackProfileView = useCallback((profileId: string, scrollDepth: number, timeSpent?: number) => {
    if (!isTrackingEnabled()) return;

    const actualTimeSpent = timeSpent ?? (Date.now() - lastActivityTime.current);
    
    try {
      trackBehavioralEvent.profileEngagement({
        // Viewing depth
        view_depth_percentage: Math.round(scrollDepth),
        profile_section: 
          scrollDepth < 25 ? 'header_only' :
          scrollDepth < 50 ? 'basic' :
          scrollDepth < 75 ? 'detailed' : 'complete',
        
        // Engagement
        time_spent_seconds: Math.round(actualTimeSpent / 1000),
        engagement_level:
          actualTimeSpent < 3000 ? 'quick_glance' :
          actualTimeSpent < 10000 ? 'browsing' :
          actualTimeSpent < 30000 ? 'interested' : 'very_interested',
        
        // Context
        hour_of_day: new Date().getHours(),
        day_of_week: new Date().getDay(),
      });
    } catch (error) {
      console.warn('PostHog tracking failed:', error);
    }
    
    lastActivityTime.current = Date.now();
  }, [isTrackingEnabled]);

  /**
   * Track feature engagement
   */
  const trackEngagement = useCallback((feature: string, action: string, metadata?: Record<string, any>) => {
    if (!isTrackingEnabled()) return;

    try {
      trackBehavioralEvent.featureUsage({
        feature_name: feature,
        action_type: action,
        session_time_minutes: Math.round((Date.now() - sessionStartTime.current) / 60000),
        hour_of_day: new Date().getHours(),
        day_of_week: new Date().getDay(),
        ...metadata,
      });
    } catch (error) {
      console.warn('PostHog tracking failed:', error);
    }
  }, [isTrackingEnabled]);

  /**
   * Track match decision (like/pass)
   */
  const trackMatchDecision = useCallback((
    decision: 'like' | 'pass' | 'superlike',
    profileViewTime: number,
    scrollDepth: number
  ) => {
    if (!isTrackingEnabled()) return;

    try {
      trackBehavioralEvent.matchDecision({
        decision_type: decision,
        view_time_seconds: Math.round(profileViewTime / 1000),
        scroll_depth_percentage: Math.round(scrollDepth),
        decision_speed:
          profileViewTime < 3000 ? 'instant' :
          profileViewTime < 10000 ? 'quick' :
          profileViewTime < 30000 ? 'considered' : 'thorough',
        hour_of_day: new Date().getHours(),
        day_of_week: new Date().getDay(),
      });
    } catch (error) {
      console.warn('PostHog tracking failed:', error);
    }
  }, [isTrackingEnabled]);

  /**
   * Track search/filter usage
   */
  const trackSearch = useCallback((
    query: string,
    resultsCount: number,
    filtersApplied?: Record<string, any>
  ) => {
    if (!isTrackingEnabled()) return;

    try {
      trackBehavioralEvent.searchActivity({
        query_length: query.length,
        word_count: query.split(/\s+/).length,
        results_count: resultsCount,
        has_results: resultsCount > 0,
        filters_count: filtersApplied ? Object.keys(filtersApplied).length : 0,
        hour_of_day: new Date().getHours(),
        day_of_week: new Date().getDay(),
      });
    } catch (error) {
      console.warn('PostHog tracking failed:', error);
    }
  }, [isTrackingEnabled]);

  /**
   * Track app session patterns
   */
  useEffect(() => {
    if (!isTrackingEnabled()) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        try {
          posthog.capture('session_backgrounded', {
            session_duration_minutes: Math.round((Date.now() - sessionStartTime.current) / 60000),
          });
        } catch (error) {
          console.warn('PostHog tracking failed:', error);
        }
      } else {
        try {
          posthog.capture('session_resumed');
        } catch (error) {
          console.warn('PostHog tracking failed:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTrackingEnabled]);

  return {
    trackMessageSent,
    trackMessageReceived,
    trackProfileView,
    trackEngagement,
    trackMatchDecision,
    trackSearch,
    isTrackingEnabled,
  };
};
