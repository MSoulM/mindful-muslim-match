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
  selectConversations,
  selectConversation,
  selectMessages,
  selectTypingStatus,
  selectActiveConversation,
  selectUnreadCount,
} from './chatStore';

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

// Types
export type * from '@/types/store.types';
