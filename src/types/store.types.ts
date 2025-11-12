import { User, Session } from '@supabase/supabase-js';

// ============= Auth Types =============
export interface AuthState {
  user: User | null;
  session: Session | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthActions {
  setAuth: (user: User | null, session: Session | null) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

// ============= Chat Types =============
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'voice' | 'file';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  metadata?: Record<string, any>;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

export interface ChatState {
  conversations: Map<string, Conversation>;
  messages: Map<string, Message[]>;
  typingStatus: Map<string, boolean>;
  activeConversationId: string | null;
}

export interface ChatActions {
  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  removeConversation: (id: string) => void;
  addMessage: (conversationId: string, message: Message) => void;
  updateMessage: (conversationId: string, messageId: string, updates: Partial<Message>) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  setTypingStatus: (conversationId: string, isTyping: boolean) => void;
  setActiveConversation: (id: string | null) => void;
  markConversationAsRead: (id: string) => void;
  clearChat: () => void;
}

// ============= Notification Types =============
export interface Notification {
  id: string;
  type: 'match' | 'message' | 'system' | 'achievement' | 'reminder';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
}

export interface NotificationPreferences {
  enablePush: boolean;
  enableEmail: boolean;
  enableSMS: boolean;
  newMatches: boolean;
  newMessages: boolean;
  profileViews: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface NotificationState {
  items: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
}

export interface NotificationActions {
  addNotification: (notification: Notification) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void;
}

// ============= Search Types =============
export interface SearchUser {
  id: string;
  name: string;
  age: number;
  location: string;
  photos: string[];
  bio?: string;
  compatibility?: number;
  distance?: string;
}

export interface SearchFilters {
  ageRange: [number, number];
  distance: number;
  location?: string;
  interests?: string[];
  education?: string[];
  religion?: string[];
  minCompatibility?: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: Date;
  notifyOnNewMatches: boolean;
}

export interface SearchState {
  filters: SearchFilters;
  results: SearchUser[];
  savedSearches: SavedSearch[];
  isSearching: boolean;
}

export interface SearchActions {
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  setResults: (results: SearchUser[]) => void;
  clearResults: () => void;
  addSavedSearch: (search: SavedSearch) => void;
  removeSavedSearch: (id: string) => void;
  setSearching: (isSearching: boolean) => void;
}

// ============= Root Store Type =============
export interface RootStore {
  auth: AuthState & AuthActions;
  chat: ChatState & ChatActions;
  notifications: NotificationState & NotificationActions;
  search: SearchState & SearchActions;
}
