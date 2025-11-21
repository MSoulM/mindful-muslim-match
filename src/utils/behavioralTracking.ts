import posthog from 'posthog-js';

/**
 * BehavioralEventBuffer - Optimizes event tracking through batching
 * Reduces API calls by buffering events and flushing periodically
 */
class BehavioralEventBuffer {
  private buffer: Map<string, any[]> = new Map();
  private flushTimer?: ReturnType<typeof setTimeout>;
  private readonly FLUSH_INTERVAL = 5000; // 5 seconds
  private readonly MAX_BUFFER_SIZE = 100;
  private sessionId: string;
  
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    
    // Flush on page unload to prevent data loss
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush(true);
      });
      
      // Also flush on visibility change (user switching tabs/apps)
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.flush(true);
        }
      });
    }
  }
  
  /**
   * Track a behavioral event with automatic batching
   */
  track(eventType: string, data: any) {
    if (!this.buffer.has(eventType)) {
      this.buffer.set(eventType, []);
    }
    
    const events = this.buffer.get(eventType)!;
    events.push({
      ...data,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    });
    
    // Flush if buffer is full
    if (events.length >= this.MAX_BUFFER_SIZE) {
      this.flush();
    } else if (!this.flushTimer) {
      // Schedule flush
      this.flushTimer = setTimeout(() => this.flush(), this.FLUSH_INTERVAL);
    }
  }
  
  /**
   * Flush all buffered events to PostHog
   * @param isSync - Whether to use sendBeacon for synchronous send (on page unload)
   */
  private async flush(isSync = false) {
    if (this.buffer.size === 0) return;
    
    try {
      const batchData: Array<{ event: string; properties: any }> = [];
      
      // Aggregate events by type
      for (const [eventType, events] of this.buffer.entries()) {
        batchData.push({
          event: eventType,
          properties: {
            batch_count: events.length,
            session_id: this.sessionId,
            events: events,
            batched_at: new Date().toISOString(),
          },
        });
      }
      
      // Send to PostHog
      if (isSync) {
        // Use sendBeacon for guaranteed delivery on page unload
        batchData.forEach(({ event, properties }) => {
          posthog.capture(event, properties);
        });
      } else {
        // Normal async capture
        batchData.forEach(({ event, properties }) => {
          posthog.capture(event, properties);
        });
      }
      
      console.log(`[BehavioralTracker] Flushed ${this.buffer.size} event types`);
    } catch (error) {
      console.error('[BehavioralTracker] Failed to flush events:', error);
    } finally {
      // Clear buffer and timer
      this.buffer.clear();
      if (this.flushTimer) {
        clearTimeout(this.flushTimer);
        this.flushTimer = undefined;
      }
    }
  }
  
  /**
   * Get or create a session ID for tracking continuity
   */
  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') {
      return `session_${Date.now()}_server`;
    }
    
    let sessionId = sessionStorage.getItem('behavioral_session_id');
    
    if (!sessionId) {
      sessionId = this.createSessionId();
      sessionStorage.setItem('behavioral_session_id', sessionId);
    }
    
    return sessionId;
  }
  
  /**
   * Create a unique session ID
   */
  private createSessionId(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `session_${timestamp}_${random}`;
  }
  
  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }
  
  /**
   * Get buffer stats for monitoring
   */
  getStats() {
    const totalEvents = Array.from(this.buffer.values()).reduce(
      (sum, events) => sum + events.length,
      0
    );
    
    return {
      eventTypes: this.buffer.size,
      totalEvents,
      sessionId: this.sessionId,
      bufferUtilization: (totalEvents / this.MAX_BUFFER_SIZE) * 100,
    };
  }
  
  /**
   * Force immediate flush (useful for testing or critical events)
   */
  forceFlush() {
    return this.flush(true);
  }
  
  /**
   * Clear all buffered events without sending
   */
  clear() {
    this.buffer.clear();
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = undefined;
    }
  }
}

// Export singleton instance
export const behavioralTracker = new BehavioralEventBuffer();

/**
 * Convenience functions for common tracking scenarios
 */
export const trackBehavioralEvent = {
  messageStyle: (data: {
    length_category: string;
    emoji_count: number;
    response_category?: string;
    [key: string]: any;
  }) => {
    behavioralTracker.track('message_style', data);
  },
  
  profileEngagement: (data: {
    view_depth_percentage: number;
    time_spent_seconds: number;
    engagement_level: string;
    [key: string]: any;
  }) => {
    behavioralTracker.track('profile_engagement', data);
  },
  
  featureUsage: (data: {
    feature_name: string;
    action_type: string;
    session_time_minutes: number;
    [key: string]: any;
  }) => {
    behavioralTracker.track('feature_usage', data);
  },
  
  matchDecision: (data: {
    decision_type: 'like' | 'pass' | 'superlike';
    view_time_seconds: number;
    decision_speed: string;
    [key: string]: any;
  }) => {
    behavioralTracker.track('match_decision', data);
  },
  
  searchActivity: (data: {
    query_length: number;
    results_count: number;
    filters_count: number;
    [key: string]: any;
  }) => {
    behavioralTracker.track('search_activity', data);
  },
};
