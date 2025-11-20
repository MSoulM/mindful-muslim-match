/**
 * Micro-Moment Tracker Service
 * Captures unconscious user behaviors for DNA building
 * Privacy-first, performance-optimized, invisible tracking
 */

export interface MicroMoment {
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  timestamp: number;
  session_id: string;
}

interface TrackerConfig {
  batchSize: number;
  batchInterval: number;
  apiEndpoint: string;
  enableLogging: boolean;
}

class MicroMomentTrackerService {
  private events: MicroMoment[] = [];
  private sessionId: string;
  private batchTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  
  private config: TrackerConfig = {
    batchSize: 50,
    batchInterval: 30000, // 30 seconds
    apiEndpoint: '/api/tracking/micro-moments',
    enableLogging: false,
  };

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Initialize the tracker and start batch sending
   */
  initialize(config?: Partial<TrackerConfig>) {
    if (this.isInitialized) return;
    
    this.config = { ...this.config, ...config };
    this.isInitialized = true;
    
    // Start batch interval
    this.batchTimer = setInterval(() => {
      this.sendBatch();
    }, this.config.batchInterval);

    // Load any unsent events from localStorage
    this.loadUnsentEvents();

    // Send batch before page unload
    window.addEventListener('beforeunload', () => {
      this.sendBatch();
    });

    // Send batch on visibility change (user switches tabs)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.sendBatch();
      }
    });

    if (this.config.enableLogging) {
      console.log('[MicroMomentTracker] Initialized with session:', this.sessionId);
    }
  }

  /**
   * Track a micro-moment event
   */
  track(eventType: string, eventData: Record<string, any> = {}) {
    if (!this.isInitialized) {
      console.warn('[MicroMomentTracker] Tracker not initialized. Call initialize() first.');
      return;
    }

    try {
      const moment: MicroMoment = {
        user_id: this.getCurrentUserId(),
        event_type: eventType,
        event_data: {
          ...eventData,
          // Add metadata
          viewport_width: window.innerWidth,
          viewport_height: window.innerHeight,
          device_type: this.getDeviceType(),
          connection_type: this.getConnectionType(),
        },
        timestamp: Date.now(),
        session_id: this.sessionId,
      };

      this.events.push(moment);

      if (this.config.enableLogging) {
        console.log('[MicroMomentTracker] Tracked:', eventType, eventData);
      }

      // Auto-send if batch size reached
      if (this.events.length >= this.config.batchSize) {
        this.sendBatch();
      }
    } catch (error) {
      // Never let tracking errors break user experience
      console.error('[MicroMomentTracker] Error tracking event:', error);
    }
  }

  /**
   * Send batch of events to API
   */
  async sendBatch() {
    if (this.events.length === 0) return;

    const batch = [...this.events];
    this.events = [];

    try {
      // Use requestIdleCallback for non-critical tracking
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
          this.sendBatchRequest(batch).catch((error) => {
            console.error('[MicroMomentTracker] Error sending batch (idle):', error);
            this.storeUnsentEvents(batch);
          });
        }, { timeout: 2000 });
      } else {
        await this.sendBatchRequest(batch);
      }
    } catch (error) {
      console.error('[MicroMomentTracker] Error sending batch:', error);
      // Store in localStorage for retry
      this.storeUnsentEvents(batch);
    }
  }

  /**
   * Actual API request
   */
  private async sendBatchRequest(batch: MicroMoment[]) {
    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ events: batch }),
      });

      if (!response.ok) {
        // 404 is expected when backend endpoint is not implemented yet
        if (this.config.enableLogging) {
          console.warn('[MicroMomentTracker] Tracking endpoint returned', response.status);
        }
        return;
      }

      if (this.config.enableLogging) {
        console.log('[MicroMomentTracker] Batch sent successfully:', batch.length, 'events');
      }
    } catch (error) {
      console.error('[MicroMomentTracker] API request failed:', error);
      // Swallow errors to avoid unhandled promise rejections; caller handles persistence
    }
  }

  /**
   * Store unsent events in localStorage for retry
   */
  private storeUnsentEvents(events: MicroMoment[]) {
    try {
      const existing = localStorage.getItem('unsent_micro_moments');
      const existingEvents: MicroMoment[] = existing ? JSON.parse(existing) : [];
      const combined = [...existingEvents, ...events];
      
      // Keep only last 500 events to avoid storage bloat
      const trimmed = combined.slice(-500);
      
      localStorage.setItem('unsent_micro_moments', JSON.stringify(trimmed));
    } catch (error) {
      console.error('[MicroMomentTracker] Error storing unsent events:', error);
    }
  }

  /**
   * Load and retry unsent events from previous sessions
   */
  private loadUnsentEvents() {
    try {
      const stored = localStorage.getItem('unsent_micro_moments');
      if (stored) {
        const events: MicroMoment[] = JSON.parse(stored);
        if (events.length > 0) {
          this.sendBatchRequest(events).then(() => {
            localStorage.removeItem('unsent_micro_moments');
          }).catch(() => {
            // Keep for next retry
          });
        }
      }
    } catch (error) {
      console.error('[MicroMomentTracker] Error loading unsent events:', error);
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get current user ID (from auth context or localStorage)
   */
  private getCurrentUserId(): string {
    // Try to get from localStorage or auth context
    const userId = localStorage.getItem('user_id') || 'anonymous';
    return userId;
  }

  /**
   * Detect device type
   */
  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  /**
   * Get network connection type
   */
  private getConnectionType(): string {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  /**
   * Cleanup and stop tracking
   */
  destroy() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
    this.sendBatch();
    this.isInitialized = false;
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Check if user has opted out of tracking
   */
  isOptedOut(): boolean {
    return localStorage.getItem('tracking_opt_out') === 'true';
  }

  /**
   * Set opt-out preference
   */
  setOptOut(optOut: boolean) {
    localStorage.setItem('tracking_opt_out', optOut ? 'true' : 'false');
    if (optOut) {
      this.events = [];
      localStorage.removeItem('unsent_micro_moments');
    }
  }
}

// Singleton instance
export const MicroMomentTracker = new MicroMomentTrackerService();
