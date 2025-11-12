import { useState, useEffect } from 'react';
import { 
  NotificationState, 
  NotificationCategory,
  QuietHours,
  NotificationFrequency,
  DEFAULT_NOTIFICATION_CATEGORIES 
} from '@/types/notification.types';

const DEFAULT_QUIET_HOURS: QuietHours = {
  enabled: false,
  start: '22:00',
  end: '07:00',
  includePrayerTimes: false,
};

const DEFAULT_NOTIFICATION_STATE: NotificationState = {
  pushEnabled: true,
  categories: DEFAULT_NOTIFICATION_CATEGORIES,
  emailEnabled: true,
  emailFrequency: 'daily',
  quietHours: DEFAULT_QUIET_HOURS,
  inAppSounds: true,
  vibration: true,
};

export const useNotificationPreferences = () => {
  const [notificationState, setNotificationState] = useState<NotificationState>(() => {
    const stored = localStorage.getItem('notification-preferences');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_NOTIFICATION_STATE;
      }
    }
    return DEFAULT_NOTIFICATION_STATE;
  });

  // Persist to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('notification-preferences', JSON.stringify(notificationState));
  }, [notificationState]);

  const togglePush = (enabled: boolean) => {
    setNotificationState(prev => ({ ...prev, pushEnabled: enabled }));
  };

  const toggleCategory = (categoryId: string, enabled: boolean) => {
    setNotificationState(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId ? { ...cat, enabled } : cat
      ),
    }));
  };

  const toggleCategoryOption = (categoryId: string, optionId: string, enabled: boolean) => {
    setNotificationState(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              options: cat.options?.map(opt =>
                opt.id === optionId ? { ...opt, enabled } : opt
              ),
            }
          : cat
      ),
    }));
  };

  const toggleEmail = (enabled: boolean) => {
    setNotificationState(prev => ({ ...prev, emailEnabled: enabled }));
  };

  const setEmailFrequency = (frequency: NotificationFrequency) => {
    setNotificationState(prev => ({ ...prev, emailFrequency: frequency }));
  };

  const updateQuietHours = (updates: Partial<QuietHours>) => {
    setNotificationState(prev => ({
      ...prev,
      quietHours: { ...prev.quietHours, ...updates },
    }));
  };

  const toggleSounds = (enabled: boolean) => {
    setNotificationState(prev => ({ ...prev, inAppSounds: enabled }));
  };

  const toggleVibration = (enabled: boolean) => {
    setNotificationState(prev => ({ ...prev, vibration: enabled }));
  };

  const resetNotifications = () => {
    setNotificationState(DEFAULT_NOTIFICATION_STATE);
  };

  const getCategoryById = (categoryId: string): NotificationCategory | undefined => {
    return notificationState.categories.find(cat => cat.id === categoryId);
  };

  const getEnabledCategories = (): NotificationCategory[] => {
    return notificationState.categories.filter(cat => cat.enabled);
  };

  return {
    notificationState,
    togglePush,
    toggleCategory,
    toggleCategoryOption,
    toggleEmail,
    setEmailFrequency,
    updateQuietHours,
    toggleSounds,
    toggleVibration,
    resetNotifications,
    getCategoryById,
    getEnabledCategories,
  };
};
