/**
 * Centralized Store Exports
 * 
 * Re-export all stores and their selectors for easy import
 */

// Auth Store
export {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectToken,
  selectIsLoading,
} from './authStore';

// Chat Store
export {
  useChatStore,
  selectThreads,
  selectActiveThread,
  selectThread,
  selectMessages,
  selectIsTyping,
  selectQuickReplies,
  selectPersonality,
  selectToneSettings,
  selectConnectionStatus,
  selectDraftMessage,
  selectTotalUnreadCount,
  selectUnreadCount,
} from './chatStore';

export type { PersonalityType, ToneSettings, Thread, ThreadType, Message, ConnectionStatus } from './chatStore';

// Notification Store
export {
  useNotificationStore,
  selectNotifications,
  selectUnreadNotifications,
  selectUnreadCount as selectNotificationUnreadCount,
  selectPreferences,
  selectNotificationsByType,
} from './notificationStore';

// Search Store
export {
  useSearchStore,
  selectFilters,
  selectResults,
  selectSavedSearches,
  selectIsSearching,
  selectFilteredResults,
} from './searchStore';

// Profile Store
export {
  useProfileStore,
  selectOverallCompletion,
  selectCategory,
  selectAllCategories,
  selectBalanceScore,
  selectChaiChatEligible,
  selectRecentlyUpdatedCategory,
  selectNewlyCoveredTopics,
} from './profileStore';

export type { ProfileState, CategoryCompletion } from './profileStore';

// Types
export type * from '@/types/store.types';

// ChaiChat Hooks
export { useChaiChatPending } from '@/hooks/useChaiChatPending';
export { useChaiChatNotifications } from '@/hooks/useChaiChatNotifications';

// Messages Hooks
export { useUnreadMessages } from '@/hooks/useUnreadMessages';
