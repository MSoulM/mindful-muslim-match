import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { NotificationState, NotificationActions, Notification } from '@/types/store.types';

interface NotificationStore extends NotificationState, NotificationActions {}

const defaultPreferences = {
  enablePush: true,
  enableEmail: true,
  enableSMS: false,
  newMatches: true,
  newMessages: true,
  profileViews: true,
  quietHoursStart: undefined,
  quietHoursEnd: undefined,
};

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set) => ({
      // Initial state
      items: [],
      unreadCount: 0,
      preferences: defaultPreferences,

      // Actions
      addNotification: (notification) =>
        set((state) => ({
          items: [notification, ...state.items],
          unreadCount: notification.read ? state.unreadCount : state.unreadCount + 1,
        })),

      markAsRead: (id) =>
        set((state) => {
          const items = state.items.map((item) =>
            item.id === id ? { ...item, read: true } : item
          );
          const unreadCount = items.filter((item) => !item.read).length;
          return { items, unreadCount };
        }),

      markAllAsRead: () =>
        set((state) => ({
          items: state.items.map((item) => ({ ...item, read: true })),
          unreadCount: 0,
        })),

      removeNotification: (id) =>
        set((state) => {
          const items = state.items.filter((item) => item.id !== id);
          const unreadCount = items.filter((item) => !item.read).length;
          return { items, unreadCount };
        }),

      clearNotifications: () =>
        set({
          items: [],
          unreadCount: 0,
        }),

      updatePreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        })),
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        preferences: state.preferences,
        // Don't persist actual notifications - load fresh on app start
      }),
    }
  )
);

// Selectors
export const selectNotifications = (state: NotificationStore) => state.items;
export const selectUnreadNotifications = (state: NotificationStore) =>
  state.items.filter((n) => !n.read);
export const selectUnreadCount = (state: NotificationStore) => state.unreadCount;
export const selectPreferences = (state: NotificationStore) => state.preferences;

export const selectNotificationsByType = (type: Notification['type']) => (
  state: NotificationStore
) => state.items.filter((n) => n.type === type);
