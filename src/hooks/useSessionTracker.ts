/**
 * Session Tracking Hook
 * Tracks overall session patterns and engagement
 */

import { useEffect } from 'react';
import { MicroMomentTracker } from '@/services/MicroMomentTracker';

export const useSessionTracker = () => {
  useEffect(() => {
    // Check if user opted out
    if (MicroMomentTracker.isOptedOut()) {
      return;
    }

    const sessionStart = Date.now();
    const sessionId = MicroMomentTracker.getSessionId();
    let totalActiveTime = 0;
    let lastActiveTime = Date.now();
    let isActive = true;

    // Track session start
    MicroMomentTracker.track('session_start', {
      session_id: sessionId,
      time_of_day: new Date().getHours(),
      day_of_week: new Date().getDay(),
      is_weekend: [0, 6].includes(new Date().getDay()),
      user_agent: navigator.userAgent,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
    });

    // Track page visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User switched tabs or minimized
        if (isActive) {
          totalActiveTime += Date.now() - lastActiveTime;
          isActive = false;
        }
        
        MicroMomentTracker.track('session_pause', {
          session_id: sessionId,
          active_duration_ms: totalActiveTime,
          time_since_start: Date.now() - sessionStart,
        });
      } else {
        // User returned
        lastActiveTime = Date.now();
        isActive = true;
        
        MicroMomentTracker.track('session_resume', {
          session_id: sessionId,
          pause_duration: Date.now() - lastActiveTime,
        });
      }
    };

    // Track user activity (mouse, keyboard, touch)
    let activityTimeout: NodeJS.Timeout | null = null;
    let isIdle = false;

    const handleActivity = () => {
      if (isIdle) {
        isIdle = false;
        lastActiveTime = Date.now();
        
        MicroMomentTracker.track('user_active', {
          session_id: sessionId,
          was_idle: true,
        });
      }

      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }

      // Mark as idle after 2 minutes of inactivity
      activityTimeout = setTimeout(() => {
        if (isActive) {
          totalActiveTime += Date.now() - lastActiveTime;
        }
        isIdle = true;
        
        MicroMomentTracker.track('user_idle', {
          session_id: sessionId,
          active_time_before_idle: Date.now() - lastActiveTime,
        });
      }, 120000); // 2 minutes
    };

    // Track session end
    const handleBeforeUnload = () => {
      if (isActive) {
        totalActiveTime += Date.now() - lastActiveTime;
      }

      MicroMomentTracker.track('session_end', {
        session_id: sessionId,
        total_duration_ms: Date.now() - sessionStart,
        active_duration_ms: totalActiveTime,
        engagement_percentage: Math.round((totalActiveTime / (Date.now() - sessionStart)) * 100),
      });
      
      MicroMomentTracker.sendBatch(); // Force send remaining events
    };

    // Track network status changes
    const handleOnline = () => {
      MicroMomentTracker.track('network_online', {
        session_id: sessionId,
      });
    };

    const handleOffline = () => {
      MicroMomentTracker.track('network_offline', {
        session_id: sessionId,
      });
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Activity listeners (debounced)
    const debouncedActivity = debounce(handleActivity, 1000);
    window.addEventListener('mousemove', debouncedActivity);
    window.addEventListener('keydown', debouncedActivity);
    window.addEventListener('touchstart', debouncedActivity);
    window.addEventListener('scroll', debouncedActivity);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('mousemove', debouncedActivity);
      window.removeEventListener('keydown', debouncedActivity);
      window.removeEventListener('touchstart', debouncedActivity);
      window.removeEventListener('scroll', debouncedActivity);
      
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
    };
  }, []);
};

// Debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
