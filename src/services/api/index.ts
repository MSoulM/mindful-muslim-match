/**
 * API Service Layer
 * 
 * Organized API calls by feature domain
 */

import { api } from '@/services/ApiClient';
import {
  SearchUser,
  SearchFilters,
  Conversation,
  Message,
  Notification,
} from '@/types/store.types';

// ============= Auth API =============

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: any; session: any }>('/auth/login', { email, password }),

  signup: (email: string, password: string, metadata?: Record<string, any>) =>
    api.post<{ user: any; session: any }>('/auth/signup', { 
      email, 
      password, 
      metadata 
    }),

  logout: () =>
    api.post('/auth/logout', undefined, ['user:*', 'session:*']),

  refreshToken: (refreshToken: string) =>
    api.post<{ access_token: string; refresh_token: string }>(
      '/auth/refresh',
      { refresh_token: refreshToken }
    ),

  resetPassword: (email: string) =>
    api.post('/auth/reset-password', { email }),

  updatePassword: (token: string, newPassword: string) =>
    api.post('/auth/update-password', { token, password: newPassword }),
};

// ============= User Profile API =============

export const userApi = {
  getProfile: (userId: string) =>
    api.get<any>(`/users/${userId}`, undefined, {
      key: `user:${userId}`,
      ttl: 5 * 60 * 1000, // 5 minutes
    }),

  updateProfile: (userId: string, data: any) =>
    api.put(`/users/${userId}`, data, [`user:${userId}`, 'user:*']),

  uploadPhoto: (userId: string, photo: File) => {
    const formData = new FormData();
    formData.append('photo', photo);
    return api.post(`/users/${userId}/photos`, formData, [`user:${userId}`]);
  },

  deletePhoto: (userId: string, photoId: string) =>
    api.delete(`/users/${userId}/photos/${photoId}`, [`user:${userId}`]),

  getDNAProfile: (userId: string) =>
    api.get(`/users/${userId}/dna`, undefined, {
      key: `dna:${userId}`,
      ttl: 10 * 60 * 1000,
    }),

  updateDNAProfile: (userId: string, data: any) =>
    api.put(`/users/${userId}/dna`, data, [`dna:${userId}`]),
};

// ============= Matches API =============

export const matchesApi = {
  getMatches: (filters?: SearchFilters) =>
    api.get<SearchUser[]>('/matches', filters, {
      key: `matches:${JSON.stringify(filters || {})}`,
      ttl: 2 * 60 * 1000,
    }),

  likeMatch: (matchId: string) =>
    api.post(`/matches/${matchId}/like`, undefined, ['matches:*']),

  passMatch: (matchId: string) =>
    api.post(`/matches/${matchId}/pass`, undefined, ['matches:*']),

  undoAction: () =>
    api.post('/matches/undo', undefined, ['matches:*']),

  getMutualMatches: () =>
    api.get<SearchUser[]>('/matches/mutual', undefined, {
      key: 'matches:mutual',
      ttl: 1 * 60 * 1000,
    }),
};

// ============= Chat API =============

export const chatApi = {
  getConversations: () =>
    api.get<Conversation[]>('/conversations', undefined, {
      key: 'conversations:list',
      ttl: 30 * 1000,
    }),

  getConversation: (conversationId: string) =>
    api.get<Conversation>(`/conversations/${conversationId}`, undefined, {
      key: `conversation:${conversationId}`,
      ttl: 30 * 1000,
    }),

  getMessages: (conversationId: string, limit = 50, before?: string) =>
    api.get<Message[]>(`/conversations/${conversationId}/messages`, {
      limit,
      before,
    }),

  sendMessage: (conversationId: string, content: string, type = 'text') =>
    api.post<Message>(
      `/conversations/${conversationId}/messages`,
      { content, type },
      [`conversation:${conversationId}`, 'conversations:*']
    ),

  markAsRead: (conversationId: string, messageIds: string[]) =>
    api.post(
      `/conversations/${conversationId}/read`,
      { message_ids: messageIds },
      [`conversation:${conversationId}`]
    ),

  deleteMessage: (conversationId: string, messageId: string) =>
    api.delete(
      `/conversations/${conversationId}/messages/${messageId}`,
      [`conversation:${conversationId}`]
    ),
};

// ============= Notifications API =============

export const notificationsApi = {
  getNotifications: (limit = 50, offset = 0) =>
    api.get<Notification[]>('/notifications', { limit, offset }, {
      key: `notifications:${limit}:${offset}`,
      ttl: 30 * 1000,
    }),

  markAsRead: (notificationId: string) =>
    api.post(`/notifications/${notificationId}/read`, undefined, ['notifications:*']),

  markAllAsRead: () =>
    api.post('/notifications/read-all', undefined, ['notifications:*']),

  deleteNotification: (notificationId: string) =>
    api.delete(`/notifications/${notificationId}`, ['notifications:*']),

  getPreferences: () =>
    api.get('/notifications/preferences', undefined, {
      key: 'notifications:preferences',
      ttl: 5 * 60 * 1000,
    }),

  updatePreferences: (preferences: any) =>
    api.put('/notifications/preferences', preferences, ['notifications:preferences']),
};

// ============= Search API =============

export const searchApi = {
  search: (filters: SearchFilters) =>
    api.post<SearchUser[]>('/search', filters),

  saveSearch: (name: string, filters: SearchFilters) =>
    api.post('/search/saved', { name, filters }, ['search:saved']),

  getSavedSearches: () =>
    api.get('/search/saved', undefined, {
      key: 'search:saved',
      ttl: 5 * 60 * 1000,
    }),

  deleteSavedSearch: (searchId: string) =>
    api.delete(`/search/saved/${searchId}`, ['search:saved']),
};

// ============= Analytics API =============

export const analyticsApi = {
  trackEvent: (event: string, properties?: Record<string, any>) =>
    api.post('/analytics/events', { event, properties }),

  getInsights: (userId: string) =>
    api.get(`/analytics/insights/${userId}`, undefined, {
      key: `insights:${userId}`,
      ttl: 10 * 60 * 1000,
    }),
};

// Export all APIs
export default {
  auth: authApi,
  user: userApi,
  matches: matchesApi,
  chat: chatApi,
  notifications: notificationsApi,
  search: searchApi,
  analytics: analyticsApi,
};
