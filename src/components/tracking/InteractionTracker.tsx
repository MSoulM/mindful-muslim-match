/**
 * Platform Interaction Tracker Component
 * Tracks navigation patterns and feature usage
 */

import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MicroMomentTracker } from '@/services/MicroMomentTracker';

export const useInteractionTracker = () => {
  const location = useLocation();
  const previousLocation = useRef<string | null>(null);
  const pageLoadTime = useRef(Date.now());
  const discoveredFeatures = useRef<Set<string>>(new Set());

  // Load discovered features from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('discovered_features');
    if (stored) {
      try {
        const features = JSON.parse(stored);
        discoveredFeatures.current = new Set(features);
      } catch (error) {
        console.error('Error loading discovered features:', error);
      }
    }
  }, []);

  // Track navigation
  useEffect(() => {
    if (MicroMomentTracker.isOptedOut()) return;

    const currentPath = location.pathname;

    if (previousLocation.current && previousLocation.current !== currentPath) {
      const timeOnPreviousPage = Date.now() - pageLoadTime.current;

      MicroMomentTracker.track('navigation_pattern', {
        from_page: previousLocation.current,
        to_page: currentPath,
        time_on_previous_page_ms: timeOnPreviousPage,
        is_quick_exit: timeOnPreviousPage < 2000,
        is_engaged: timeOnPreviousPage > 30000,
      });
    }

    previousLocation.current = currentPath;
    pageLoadTime.current = Date.now();
  }, [location.pathname]);

  // Track feature discovery
  const trackFeatureDiscovery = (featureName: string) => {
    if (MicroMomentTracker.isOptedOut()) return;

    if (!discoveredFeatures.current.has(featureName)) {
      discoveredFeatures.current.add(featureName);

      // Save to localStorage
      localStorage.setItem(
        'discovered_features',
        JSON.stringify(Array.from(discoveredFeatures.current))
      );

      const userSignupTime = localStorage.getItem('user_signup_time');
      const timeSinceSignup = userSignupTime ? Date.now() - parseInt(userSignupTime) : null;

      MicroMomentTracker.track('feature_discovery', {
        feature_name: featureName,
        discovery_order: discoveredFeatures.current.size,
        time_since_signup_ms: timeSinceSignup,
        accessed_from: location.pathname,
      });
    }
  };

  // Track settings change
  const trackSettingsChange = (settingName: string, oldValue: any, newValue: any) => {
    if (MicroMomentTracker.isOptedOut()) return;

    const userSignupTime = localStorage.getItem('user_signup_time');
    const timeSinceSignup = userSignupTime ? Date.now() - parseInt(userSignupTime) : null;

    MicroMomentTracker.track('settings_adjustment', {
      setting_name: settingName,
      old_value: typeof oldValue,
      new_value: typeof newValue,
      value_changed: oldValue !== newValue,
      time_since_signup_ms: timeSinceSignup,
    });
  };

  // Track help documentation usage
  const trackHelpUsage = (helpTopic: string) => {
    if (MicroMomentTracker.isOptedOut()) return;

    const sessionStartTime = sessionStorage.getItem('session_start_time');
    const timeOnPlatform = sessionStartTime ? Date.now() - parseInt(sessionStartTime) : null;

    MicroMomentTracker.track('help_documentation', {
      help_topic: helpTopic,
      time_on_platform_ms: timeOnPlatform,
      previous_page: previousLocation.current || 'unknown',
      is_early_help: timeOnPlatform && timeOnPlatform < 300000, // < 5 minutes
    });
  };

  // Track search usage
  const trackSearch = (query: string, resultsCount: number) => {
    if (MicroMomentTracker.isOptedOut()) return;

    MicroMomentTracker.track('search_usage', {
      query_length: query.length,
      results_count: resultsCount,
      has_results: resultsCount > 0,
      word_count: query.split(/\s+/).length,
      from_page: location.pathname,
    });
  };

  // Track filter usage
  const trackFilterUsage = (filterType: string, filterValue: any) => {
    if (MicroMomentTracker.isOptedOut()) return;

    MicroMomentTracker.track('filter_usage', {
      filter_type: filterType,
      filter_value_type: typeof filterValue,
      from_page: location.pathname,
    });
  };

  // Track button clicks
  const trackButtonClick = (buttonName: string, context?: Record<string, any>) => {
    if (MicroMomentTracker.isOptedOut()) return;

    MicroMomentTracker.track('button_click', {
      button_name: buttonName,
      page: location.pathname,
      ...context,
    });
  };

  return {
    trackFeatureDiscovery,
    trackSettingsChange,
    trackHelpUsage,
    trackSearch,
    trackFilterUsage,
    trackButtonClick,
  };
};

// Hook for tracking form interactions
export const useFormTracker = (formName: string) => {
  const formStartTime = useRef<number | null>(null);
  const fieldInteractions = useRef<Record<string, number>>({});

  useEffect(() => {
    formStartTime.current = Date.now();

    return () => {
      // Track form abandonment on unmount
      if (formStartTime.current && !MicroMomentTracker.isOptedOut()) {
        MicroMomentTracker.track('form_abandonment', {
          form_name: formName,
          time_spent_ms: Date.now() - formStartTime.current,
          fields_interacted: Object.keys(fieldInteractions.current).length,
        });
      }
    };
  }, [formName]);

  const trackFieldInteraction = (fieldName: string) => {
    if (MicroMomentTracker.isOptedOut()) return;

    if (!fieldInteractions.current[fieldName]) {
      fieldInteractions.current[fieldName] = Date.now();
    }
  };

  const trackFormSubmission = (success: boolean, errors?: Record<string, string>) => {
    if (MicroMomentTracker.isOptedOut()) return;
    if (!formStartTime.current) return;

    MicroMomentTracker.track('form_submission', {
      form_name: formName,
      success,
      time_to_submit_ms: Date.now() - formStartTime.current,
      fields_interacted: Object.keys(fieldInteractions.current).length,
      error_count: errors ? Object.keys(errors).length : 0,
      has_errors: !!errors && Object.keys(errors).length > 0,
    });
  };

  return {
    trackFieldInteraction,
    trackFormSubmission,
  };
};
