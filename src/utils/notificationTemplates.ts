/**
 * Notification templates with {agent} placeholder for personalization
 * 
 * The {agent} placeholder will be replaced with:
 * - Custom agent name if set (e.g., "Auntie Fatima")
 * - Personality type if no custom name (e.g., "your Wise Aunty")
 * - Generic fallback (e.g., "your MMAgent")
 * 
 * Usage:
 * ```
 * import { notificationTemplates } from '@/utils/notificationTemplates';
 * 
 * const notification = {
 *   title: notificationTemplates.newInsight.title,
 *   body: notificationTemplates.newInsight.body,
 *   type: 'dna'
 * };
 * ```
 */

export const notificationTemplates = {
  // Insight notifications
  newInsight: {
    title: "New Insight Available",
    body: "{agent} has discovered something interesting about you",
    type: 'dna' as const
  },
  
  insightConfirmed: {
    title: "Profile Updated",
    body: "{agent} has updated your profile with your confirmed insights",
    type: 'dna' as const
  },
  
  // Match notifications
  matchReady: {
    title: "New Match Available",
    body: "{agent} found a potential match for you",
    type: 'match' as const
  },
  
  matchRecommendation: {
    title: "Match Recommendation",
    body: "{agent} suggests reviewing this match - high compatibility detected",
    type: 'match' as const
  },
  
  // Profile notifications
  profileTip: {
    title: "Profile Suggestion",
    body: "{agent} has a suggestion to improve your profile",
    type: 'system' as const
  },
  
  profileStrengthImproved: {
    title: "Profile Strength Increased",
    body: "{agent} noticed your profile is getting stronger! Keep it up.",
    type: 'achievement' as const
  },
  
  // ChaiChat notifications
  chaiChatReady: {
    title: "ChaiChat Analysis Complete",
    body: "{agent} has finished analyzing your compatibility - check the results",
    type: 'chaichat' as const
  },
  
  chaiChatRecommendation: {
    title: "High Compatibility Found",
    body: "{agent} recommends taking a closer look at this ChaiChat result",
    type: 'chaichat' as const
  },
  
  // Check-in notifications
  weeklyCheckIn: {
    title: "Weekly Check-In",
    body: "Time for your weekly check-in with {agent}",
    type: 'system' as const
  },
  
  monthlyReview: {
    title: "Monthly Progress Review",
    body: "{agent} has prepared your monthly progress summary",
    type: 'system' as const
  },
  
  // Milestone notifications
  profileComplete: {
    title: "Profile Milestone Reached",
    body: "{agent} congratulates you on completing your profile!",
    type: 'achievement' as const
  },
  
  firstConnection: {
    title: "First Connection Made",
    body: "{agent} is excited to see you making connections!",
    type: 'achievement' as const
  },
  
  // Message notifications
  messageReceived: {
    title: "New Message",
    body: "{agent} noticed you have a new message from a match",
    type: 'message' as const
  },
  
  // DNA notifications
  dnaUnlocked: {
    title: "MySoulDNA Updated",
    body: "{agent} has unlocked new insights about your personality",
    type: 'dna' as const
  },
  
  dnaBalanceImproved: {
    title: "DNA Balance Improved",
    body: "{agent} noticed your profile balance has improved significantly",
    type: 'achievement' as const
  }
};

/**
 * Helper function to create a notification with personalized text
 * 
 * @param templateKey - Key from notificationTemplates
 * @param customData - Optional custom data to override template values
 * @returns Notification object ready for display
 */
export const createNotification = (
  templateKey: keyof typeof notificationTemplates,
  customData?: {
    title?: string;
    body?: string;
    badge?: string;
    progress?: number;
    action?: string;
    image?: string;
  }
) => {
  const template = notificationTemplates[templateKey];
  
  return {
    id: `notif-${Date.now()}`,
    type: template.type,
    title: customData?.title || template.title,
    body: customData?.body || template.body,
    timestamp: new Date(),
    read: false,
    data: {
      badge: customData?.badge,
      progress: customData?.progress,
      action: customData?.action
    },
    image: customData?.image
  };
};

/**
 * Example usage:
 * 
 * ```typescript
 * import { createNotification, notificationTemplates } from '@/utils/notificationTemplates';
 * 
 * // Simple usage with template
 * const notification1 = createNotification('newInsight');
 * 
 * // With custom data
 * const notification2 = createNotification('matchReady', {
 *   badge: 'NEW',
 *   action: 'View Match'
 * });
 * 
 * // Render with NotificationItem (will auto-personalize)
 * <NotificationItem 
 *   notification={notification1}
 *   personalityType="wise_aunty"
 *   onPress={() => {}}
 *   onDelete={() => {}}
 *   onToggleRead={() => {}}
 * />
 * ```
 */
