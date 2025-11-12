import { create } from 'zustand';
import { ChatState, ChatActions, Conversation, Message } from '@/types/store.types';

interface ChatStore extends ChatState, ChatActions {}

export const useChatStore = create<ChatStore>((set, get) => ({
  // Initial state
  conversations: new Map(),
  messages: new Map(),
  typingStatus: new Map(),
  activeConversationId: null,

  // Actions
  addConversation: (conversation) =>
    set((state) => {
      const conversations = new Map(state.conversations);
      conversations.set(conversation.id, conversation);
      return { conversations };
    }),

  updateConversation: (id, updates) =>
    set((state) => {
      const conversations = new Map(state.conversations);
      const existing = conversations.get(id);
      if (existing) {
        conversations.set(id, { ...existing, ...updates });
      }
      return { conversations };
    }),

  removeConversation: (id) =>
    set((state) => {
      const conversations = new Map(state.conversations);
      const messages = new Map(state.messages);
      conversations.delete(id);
      messages.delete(id);
      return {
        conversations,
        messages,
        activeConversationId:
          state.activeConversationId === id ? null : state.activeConversationId,
      };
    }),

  addMessage: (conversationId, message) =>
    set((state) => {
      const messages = new Map(state.messages);
      const conversationMessages = messages.get(conversationId) || [];
      messages.set(conversationId, [...conversationMessages, message]);

      // Update conversation's last message
      const conversations = new Map(state.conversations);
      const conversation = conversations.get(conversationId);
      if (conversation) {
        conversations.set(conversationId, {
          ...conversation,
          lastMessage: message,
          updatedAt: message.timestamp,
        });
      }

      return { messages, conversations };
    }),

  updateMessage: (conversationId, messageId, updates) =>
    set((state) => {
      const messages = new Map(state.messages);
      const conversationMessages = messages.get(conversationId) || [];
      const updatedMessages = conversationMessages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updates } : msg
      );
      messages.set(conversationId, updatedMessages);
      return { messages };
    }),

  removeMessage: (conversationId, messageId) =>
    set((state) => {
      const messages = new Map(state.messages);
      const conversationMessages = messages.get(conversationId) || [];
      messages.set(
        conversationId,
        conversationMessages.filter((msg) => msg.id !== messageId)
      );
      return { messages };
    }),

  setTypingStatus: (conversationId, isTyping) =>
    set((state) => {
      const typingStatus = new Map(state.typingStatus);
      typingStatus.set(conversationId, isTyping);
      return { typingStatus };
    }),

  setActiveConversation: (id) =>
    set({ activeConversationId: id }),

  markConversationAsRead: (id) =>
    set((state) => {
      const conversations = new Map(state.conversations);
      const conversation = conversations.get(id);
      if (conversation) {
        conversations.set(id, { ...conversation, unreadCount: 0 });
      }

      // Update all messages in conversation to 'read'
      const messages = new Map(state.messages);
      const conversationMessages = messages.get(id) || [];
      const updatedMessages = conversationMessages.map((msg) => ({
        ...msg,
        status: 'read' as const,
      }));
      messages.set(id, updatedMessages);

      return { conversations, messages };
    }),

  clearChat: () =>
    set({
      conversations: new Map(),
      messages: new Map(),
      typingStatus: new Map(),
      activeConversationId: null,
    }),
}));

// Selectors
export const selectConversations = (state: ChatStore) =>
  Array.from(state.conversations.values());

export const selectConversation = (id: string) => (state: ChatStore) =>
  state.conversations.get(id);

export const selectMessages = (conversationId: string) => (state: ChatStore) =>
  state.messages.get(conversationId) || [];

export const selectTypingStatus = (conversationId: string) => (state: ChatStore) =>
  state.typingStatus.get(conversationId) || false;

export const selectActiveConversation = (state: ChatStore) =>
  state.activeConversationId
    ? state.conversations.get(state.activeConversationId)
    : null;

export const selectUnreadCount = (state: ChatStore) =>
  Array.from(state.conversations.values()).reduce(
    (sum, conv) => sum + conv.unreadCount,
    0
  );
