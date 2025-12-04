import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { supabase } from '@/lib/supabase';

export type ConversationLastMessageType = 'text' | 'emoji' | 'image' | 'file' | 'voice' | null;

export interface ConversationSummary {
  id: string;
  otherUserId: string;
  lastMessagePreview: string | null;
  lastMessageType: ConversationLastMessageType;
  lastMessageSentAt: string | null;
  lastMessageSenderId: string | null;
  unreadCount: number;
  isLastMessageFromCurrentUser: boolean;
}

interface UseConversationsReturn {
  conversations: ConversationSummary[];
  isLoading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export const useConversations = (): UseConversationsReturn => {
  const { userId } = useAuth();

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }
    if (!supabase) {
      setError('Supabase client not configured');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select(
          'id, user1_clerk_id, user2_clerk_id, last_message_preview, last_message_type, last_message_sent_at, last_message_sender_clerk_id, user1_unread_count, user2_unread_count'
        )
        .or(`user1_clerk_id.eq.${userId},user2_clerk_id.eq.${userId}`)
        .order('last_message_sent_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      const summaries: ConversationSummary[] =
        (data ?? []).map((row: any) => {
          const isUser1 = row.user1_clerk_id === userId;
          const otherUserId = isUser1 ? row.user2_clerk_id : row.user1_clerk_id;
          const unreadCount = isUser1 ? row.user1_unread_count ?? 0 : row.user2_unread_count ?? 0;
          const lastMessageType =
            (row.last_message_type as ConversationLastMessageType | null) ?? null;

          return {
            id: row.id,
            otherUserId,
            lastMessagePreview: row.last_message_preview ?? null,
            lastMessageType,
            lastMessageSentAt: row.last_message_sent_at,
            lastMessageSenderId: row.last_message_sender_clerk_id ?? null,
            unreadCount,
            isLastMessageFromCurrentUser: row.last_message_sender_clerk_id === userId
          };
        }) ?? [];

      setConversations(summaries);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load conversations';
      setError(message);
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || !supabase) return;

    void reload();

    // Realtime subscription: keep conversation list in sync
    const channel = supabase
      .channel(`conversations:user:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `user1_clerk_id=eq.${userId},user2_clerk_id=eq.${userId}`
        },
        () => {
          // For simplicity, just refetch; list is small and this keeps logic centralised
          void reload();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, reload]);

  return {
    conversations,
    isLoading,
    error,
    reload
  };
};


