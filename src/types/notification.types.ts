export type NotificationFrequency = 'instant' | 'daily' | 'weekly' | 'never';

export interface QuietHours {
  enabled: boolean;
  start: string; // HH:MM format
  end: string; // HH:MM format
  includePrayerTimes: boolean;
  days?: number[]; // 0-6, where 0 is Sunday
}

export interface NotificationCategory {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon?: string;
  options?: NotificationOption[];
}

export interface NotificationOption {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
}

export interface NotificationState {
  pushEnabled: boolean;
  categories: NotificationCategory[];
  emailEnabled: boolean;
  emailFrequency: NotificationFrequency;
  quietHours: QuietHours;
  inAppSounds: boolean;
  vibration: boolean;
}

export interface NotificationPreferences extends NotificationState {
  lastUpdated: string;
}

// Predefined notification categories
export const DEFAULT_NOTIFICATION_CATEGORIES: NotificationCategory[] = [
  {
    id: 'matches',
    label: 'New Matches',
    description: 'When we find someone special for you',
    enabled: true,
    options: [
      {
        id: 'instant',
        label: 'Instant notifications',
        enabled: true,
      },
      {
        id: 'daily_digest',
        label: 'Daily digest',
        description: 'Get a summary once per day',
        enabled: false,
      },
    ],
  },
  {
    id: 'messages',
    label: 'Messages',
    description: 'When someone sends you a message',
    enabled: true,
    options: [
      {
        id: 'all_messages',
        label: 'All messages',
        enabled: true,
      },
      {
        id: 'matches_only',
        label: 'Matches only',
        description: 'Only from confirmed matches',
        enabled: false,
      },
    ],
  },
  {
    id: 'chaichat',
    label: 'ChaiChat Updates',
    description: 'When AI analysis is complete',
    enabled: true,
  },
  {
    id: 'insights',
    label: 'Weekly Insights',
    description: 'Your weekly match updates',
    enabled: true,
  },
  {
    id: 'achievements',
    label: 'Achievements',
    description: 'DNA milestones and badges',
    enabled: true,
  },
  {
    id: 'promotions',
    label: 'Promotions & Tips',
    description: 'Feature updates and tips',
    enabled: false,
  },
];

// Notification action types for state management
export type NotificationAction =
  | { type: 'TOGGLE_PUSH'; payload: boolean }
  | { type: 'TOGGLE_CATEGORY'; payload: { categoryId: string; enabled: boolean } }
  | { type: 'TOGGLE_OPTION'; payload: { categoryId: string; optionId: string; enabled: boolean } }
  | { type: 'TOGGLE_EMAIL'; payload: boolean }
  | { type: 'SET_EMAIL_FREQUENCY'; payload: NotificationFrequency }
  | { type: 'UPDATE_QUIET_HOURS'; payload: Partial<QuietHours> }
  | { type: 'TOGGLE_SOUNDS'; payload: boolean }
  | { type: 'TOGGLE_VIBRATION'; payload: boolean }
  | { type: 'RESET_NOTIFICATIONS'; payload: NotificationState };
