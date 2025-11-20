import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export type PersonalityType = 'amina' | 'zara' | 'amir' | 'noor';

export interface ToneSettings {
  warmth: number; // 1-10
  formality: number; // 1-10
  energy: number; // 1-10
  empathy: number; // 1-10
}

export type ThreadType = 'onboarding' | 'match_discussion' | 'support' | 'profile_guidance' | 'custom';

export interface Thread {
  id: string;
  type: ThreadType;
  topic: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  isArchived: boolean;
  unreadCount: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isImportant?: boolean;
}

export type ConnectionStatus = 'connected' | 'reconnecting' | 'offline';

interface ChatState {
  // Threads & Messages
  threads: Thread[];
  activeThreadId: string | null;
  
  // Personality & Tone
  personality: PersonalityType;
  toneSettings: ToneSettings;
  
  // UI State
  quickReplies: string[];
  isTyping: boolean;
  draftMessages: Record<string, string>;
  connectionStatus: ConnectionStatus;
  
  // Unread tracking
  unreadCounts: Record<string, number>;
}

interface ChatActions {
  // Thread Management
  addThread: (thread: Thread) => void;
  updateThread: (id: string, updates: Partial<Thread>) => void;
  removeThread: (id: string) => void;
  archiveThread: (id: string) => void;
  setActiveThread: (id: string | null) => void;
  
  // Message Management
  addMessage: (threadId: string, message: Message) => void;
  updateMessage: (threadId: string, messageId: string, updates: Partial<Message>) => void;
  removeMessage: (threadId: string, messageId: string) => void;
  markThreadAsRead: (threadId: string) => void;
  
  // Personality & Tone
  setPersonality: (personality: PersonalityType) => void;
  updateToneSettings: (settings: Partial<ToneSettings>) => void;
  
  // UI State
  setQuickReplies: (replies: string[]) => void;
  setIsTyping: (isTyping: boolean) => void;
  setDraftMessage: (threadId: string, message: string) => void;
  getDraftMessage: (threadId: string) => string;
  clearDraftMessage: (threadId: string) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  
  // Utility
  clearAllChats: () => void;
  getThread: (id: string) => Thread | undefined;
  getActiveThread: () => Thread | null;
  getTotalUnreadCount: () => number;
}

type ChatStore = ChatState & ChatActions;

// Default tone settings
const DEFAULT_TONE: ToneSettings = {
  warmth: 7,
  formality: 5,
  energy: 6,
  empathy: 8
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial State
      threads: [],
      activeThreadId: null,
      personality: 'amina',
      toneSettings: DEFAULT_TONE,
      quickReplies: [],
      isTyping: false,
      draftMessages: {},
      connectionStatus: 'offline',
      unreadCounts: {},

      // Thread Management
      addThread: (thread) =>
        set((state) => ({
          threads: [thread, ...state.threads],
          unreadCounts: { ...state.unreadCounts, [thread.id]: 0 }
        })),

      updateThread: (id, updates) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
          )
        })),

      removeThread: (id) =>
        set((state) => {
          const { [id]: _, ...remainingUnread } = state.unreadCounts;
          const { [id]: __, ...remainingDrafts } = state.draftMessages;
          return {
            threads: state.threads.filter((t) => t.id !== id),
            activeThreadId: state.activeThreadId === id ? null : state.activeThreadId,
            unreadCounts: remainingUnread,
            draftMessages: remainingDrafts
          };
        }),

      archiveThread: (id) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === id ? { ...t, isArchived: true, updatedAt: new Date() } : t
          )
        })),

      setActiveThread: (id) =>
        set({ activeThreadId: id }),

      // Message Management
      addMessage: (threadId, message) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: [...t.messages, message],
                  updatedAt: new Date()
                }
              : t
          )
        })),

      updateMessage: (threadId, messageId, updates) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: t.messages.map((m) =>
                    m.id === messageId ? { ...m, ...updates } : m
                  ),
                  updatedAt: new Date()
                }
              : t
          )
        })),

      removeMessage: (threadId, messageId) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  messages: t.messages.filter((m) => m.id !== messageId),
                  updatedAt: new Date()
                }
              : t
          )
        })),

      markThreadAsRead: (threadId) =>
        set((state) => ({
          threads: state.threads.map((t) =>
            t.id === threadId
              ? {
                  ...t,
                  unreadCount: 0,
                  messages: t.messages.map((m) => ({ ...m, status: 'read' as const }))
                }
              : t
          ),
          unreadCounts: { ...state.unreadCounts, [threadId]: 0 }
        })),

      // Personality & Tone
      setPersonality: (personality) =>
        set({ personality }),

      updateToneSettings: (settings) =>
        set((state) => ({
          toneSettings: { ...state.toneSettings, ...settings }
        })),

      // UI State
      setQuickReplies: (replies) =>
        set({ quickReplies: replies }),

      setIsTyping: (isTyping) =>
        set({ isTyping }),

      setDraftMessage: (threadId, message) =>
        set((state) => ({
          draftMessages: { ...state.draftMessages, [threadId]: message }
        })),

      getDraftMessage: (threadId) =>
        get().draftMessages[threadId] || '',

      clearDraftMessage: (threadId) =>
        set((state) => {
          const { [threadId]: _, ...remaining } = state.draftMessages;
          return { draftMessages: remaining };
        }),

      setConnectionStatus: (status) =>
        set({ connectionStatus: status }),

      // Utility
      clearAllChats: () =>
        set({
          threads: [],
          activeThreadId: null,
          draftMessages: {},
          unreadCounts: {},
          quickReplies: [],
          isTyping: false
        }),

      getThread: (id) =>
        get().threads.find((t) => t.id === id),

      getActiveThread: () => {
        const state = get();
        return state.activeThreadId
          ? state.threads.find((t) => t.id === state.activeThreadId) || null
          : null;
      },

      getTotalUnreadCount: () =>
        Object.values(get().unreadCounts).reduce((sum, count) => sum + count, 0)
    }),
    {
      name: 'mmagent-chat-storage',
      partialize: (state) => ({
        threads: state.threads,
        personality: state.personality,
        toneSettings: state.toneSettings,
        draftMessages: state.draftMessages
      })
    }
  )
);

// Selectors
export const selectThreads = (state: ChatStore) => state.threads;
export const selectActiveThread = (state: ChatStore) => state.getActiveThread();
export const selectThread = (id: string) => (state: ChatStore) => state.getThread(id);
export const selectMessages = (threadId: string) => (state: ChatStore) =>
  state.getThread(threadId)?.messages || [];
export const selectIsTyping = (state: ChatStore) => state.isTyping;
export const selectQuickReplies = (state: ChatStore) => state.quickReplies;
export const selectPersonality = (state: ChatStore) => state.personality;
export const selectToneSettings = (state: ChatStore) => state.toneSettings;
export const selectConnectionStatus = (state: ChatStore) => state.connectionStatus;
export const selectDraftMessage = (threadId: string) => (state: ChatStore) =>
  state.getDraftMessage(threadId);
export const selectTotalUnreadCount = (state: ChatStore) => state.getTotalUnreadCount();
export const selectUnreadCount = (threadId: string) => (state: ChatStore) =>
  state.unreadCounts[threadId] || 0;
