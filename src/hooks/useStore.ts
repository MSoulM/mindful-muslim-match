/**
 * Custom hooks for store access with common patterns
 */

import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useSearchStore } from '@/store/searchStore';

// ============= Auth Hooks =============

export const useAuth = () => {
  const { user, session, isAuthenticated, isLoading } = useAuthStore();
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return {
    user,
    session,
    isAuthenticated,
    isLoading,
    setAuth,
    clearAuth,
  };
};

// ============= Chat Hooks =============

export const useConversations = () => {
  const conversations = useChatStore((state) =>
    Array.from(state.conversations.values())
  );
  const addConversation = useChatStore((state) => state.addConversation);
  const updateConversation = useChatStore((state) => state.updateConversation);
  const removeConversation = useChatStore((state) => state.removeConversation);

  return {
    conversations,
    addConversation,
    updateConversation,
    removeConversation,
  };
};

export const useConversation = (conversationId: string) => {
  const conversation = useChatStore(
    (state) => state.conversations.get(conversationId)
  );
  const messages = useChatStore(
    (state) => state.messages.get(conversationId) || []
  );
  const isTyping = useChatStore(
    (state) => state.typingStatus.get(conversationId) || false
  );

  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessage = useChatStore((state) => state.updateMessage);
  const setTypingStatus = useChatStore((state) => state.setTypingStatus);
  const markAsRead = useChatStore((state) => state.markConversationAsRead);

  return {
    conversation,
    messages,
    isTyping,
    addMessage: (message: any) => addMessage(conversationId, message),
    updateMessage: (messageId: string, updates: any) =>
      updateMessage(conversationId, messageId, updates),
    setTyping: (isTyping: boolean) => setTypingStatus(conversationId, isTyping),
    markAsRead: () => markAsRead(conversationId),
  };
};

export const useChatUnreadCount = () => {
  return useChatStore((state) =>
    Array.from(state.conversations.values()).reduce(
      (sum, conv) => sum + conv.unreadCount,
      0
    )
  );
};

// ============= Notification Hooks =============

export const useNotifications = () => {
  const items = useNotificationStore((state) => state.items);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const removeNotification = useNotificationStore(
    (state) => state.removeNotification
  );

  return {
    notifications: items,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
  };
};

export const useNotificationPreferences = () => {
  const preferences = useNotificationStore((state) => state.preferences);
  const updatePreferences = useNotificationStore(
    (state) => state.updatePreferences
  );

  return {
    preferences,
    updatePreferences,
  };
};

// ============= Search Hooks =============

export const useSearch = () => {
  const filters = useSearchStore((state) => state.filters);
  const results = useSearchStore((state) => state.results);
  const isSearching = useSearchStore((state) => state.isSearching);

  const setFilters = useSearchStore((state) => state.setFilters);
  const resetFilters = useSearchStore((state) => state.resetFilters);
  const setResults = useSearchStore((state) => state.setResults);
  const clearResults = useSearchStore((state) => state.clearResults);
  const setSearching = useSearchStore((state) => state.setSearching);

  return {
    filters,
    results,
    isSearching,
    setFilters,
    resetFilters,
    setResults,
    clearResults,
    setSearching,
  };
};

export const useSavedSearches = () => {
  const savedSearches = useSearchStore((state) => state.savedSearches);
  const addSavedSearch = useSearchStore((state) => state.addSavedSearch);
  const removeSavedSearch = useSearchStore((state) => state.removeSavedSearch);

  return {
    savedSearches,
    addSavedSearch,
    removeSavedSearch,
  };
};

// ============= Combined Hooks =============

export const useUnreadCounts = () => {
  const chatUnread = useChatUnreadCount();
  const notificationUnread = useNotificationStore((state) => state.unreadCount);

  return {
    chat: chatUnread,
    notifications: notificationUnread,
    total: chatUnread + notificationUnread,
  };
};
