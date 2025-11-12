import { useEffect, useRef, useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

export interface ChatMessage {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: 'text' | 'voice' | 'image' | 'emoji';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  metadata?: Record<string, any>;
}

interface UseChatSocketOptions {
  onMessage?: (message: ChatMessage) => void;
  onTyping?: (userId: string, isTyping: boolean) => void;
  onStatusUpdate?: (messageId: string, status: ChatMessage['status']) => void;
  onReaction?: (messageId: string, reaction: string, userId: string) => void;
  autoConnect?: boolean;
}

export const useChatSocket = (chatId: string, options: UseChatSocketOptions = {}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const typingTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const handleTypingIndicator = useCallback((userId: string, isTyping: boolean) => {
    // Clear existing timeout for this user
    const existingTimeout = typingTimeoutRef.current.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    setTypingUsers(prev => {
      const next = new Set(prev);
      if (isTyping) {
        next.add(userId);
        
        // Auto-clear typing after 3 seconds
        const timeout = setTimeout(() => {
          setTypingUsers(curr => {
            const updated = new Set(curr);
            updated.delete(userId);
            return updated;
          });
          typingTimeoutRef.current.delete(userId);
        }, 3000);
        
        typingTimeoutRef.current.set(userId, timeout);
      } else {
        next.delete(userId);
      }
      return next;
    });
  }, []);

  const updateMessageStatus = useCallback((messageId: string, status: ChatMessage['status']) => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      )
    );
  }, []);

  const { send, isConnected, connectionState } = useWebSocket({
    channel: `chat:${chatId}`,
    autoConnect: options.autoConnect ?? true,
    onMessage: useCallback((data: any) => {
      switch (data.type) {
        case 'message':
          const newMessage = data.message as ChatMessage;
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
          options.onMessage?.(newMessage);
          break;

        case 'typing':
          handleTypingIndicator(data.userId, data.isTyping);
          options.onTyping?.(data.userId, data.isTyping);
          break;

        case 'status_update':
          updateMessageStatus(data.messageId, data.status);
          options.onStatusUpdate?.(data.messageId, data.status);
          break;

        case 'reaction':
          options.onReaction?.(data.messageId, data.reaction, data.userId);
          break;

        case 'message_deleted':
          setMessages(prev => prev.filter(m => m.id !== data.messageId));
          break;

        default:
          console.log('[Chat Socket] Unknown message type:', data.type);
      }
    }, [options, handleTypingIndicator, updateMessageStatus])
  });

  const sendMessage = useCallback(async (
    content: string,
    type: ChatMessage['type'] = 'text',
    metadata?: Record<string, any>
  ): Promise<ChatMessage> => {
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      senderId: 'me',
      recipientId: chatId,
      content,
      type,
      timestamp: new Date(),
      status: 'sending',
      metadata
    };

    // Optimistically add message immediately
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      // Send through WebSocket
      send({
        type: 'send_message',
        chatId,
        content,
        messageType: type,
        metadata,
        tempId: optimisticMessage.id
      });

      // Simulate API call for demo
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update with server ID and status
      const serverMessage: ChatMessage = {
        ...optimisticMessage,
        id: `msg-${Date.now()}`,
        status: 'sent'
      };

      setMessages(prev =>
        prev.map(msg =>
          msg.id === optimisticMessage.id ? serverMessage : msg
        )
      );

      return serverMessage;
    } catch (error) {
      // Rollback on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      throw error;
    }
  }, [chatId, send]);

  const sendTyping = useCallback((isTyping: boolean) => {
    send({
      type: 'typing',
      chatId,
      isTyping
    });
  }, [chatId, send]);

  const markAsRead = useCallback((messageIds: string[]) => {
    send({
      type: 'mark_read',
      chatId,
      messageIds
    });

    // Optimistically update local state
    setMessages(prev =>
      prev.map(msg =>
        messageIds.includes(msg.id) ? { ...msg, status: 'read' as const } : msg
      )
    );
  }, [chatId, send]);

  const sendReaction = useCallback((messageId: string, reaction: string) => {
    send({
      type: 'reaction',
      chatId,
      messageId,
      reaction
    });
  }, [chatId, send]);

  const deleteMessage = useCallback((messageId: string) => {
    send({
      type: 'delete_message',
      chatId,
      messageId
    });

    // Optimistically remove
    setMessages(prev => prev.filter(m => m.id !== messageId));
  }, [chatId, send]);

  // Cleanup typing timeouts on unmount
  useEffect(() => {
    return () => {
      typingTimeoutRef.current.forEach(timeout => clearTimeout(timeout));
      typingTimeoutRef.current.clear();
    };
  }, []);

  return {
    messages,
    isConnected,
    connectionState,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    sendTyping,
    markAsRead,
    sendReaction,
    deleteMessage,
    setMessages
  };
};
