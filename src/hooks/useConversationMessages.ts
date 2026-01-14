import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createSupabaseClient } from '@/lib/supabase';

export type MessageType = 'text' | 'emoji' | 'image' | 'file' | 'voice';
export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

export interface Attachment {
  id: string;
  attachmentType: 'image' | 'file' | 'voice';
  url: string;
  thumbnailUrl?: string | null;
  durationSeconds?: number | null;
  waveform?: any | null;
  width?: number | null;
  height?: number | null;
  fileName?: string | null;
  fileExtension?: string | null;
  mimeType?: string | null;
  fileSizeBytes?: number | null;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  replyToMessageId?: string | null;
  readAt?: string | null;
  isEdited: boolean;
  editedAt?: string | null;
  sentAt: string;
  attachments: Attachment[];
}

interface UseConversationMessagesOptions {
  otherUserClerkId: string | null;
}

interface UseConversationMessagesReturn {
  conversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  sendTextMessage: (content: string, replyToMessageId?: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  reloadMessages: () => Promise<void>;
}

export const useConversationMessages = (
  options: UseConversationMessagesOptions
): UseConversationMessagesReturn => {
  const { otherUserClerkId } = options;
  const { userId, getToken } = useAuth();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureConversation = useCallback(async () => {
    if (!userId || !otherUserClerkId) return null;

    const token = await getToken();
    const supabase = createSupabaseClient(token || undefined);
    if (!supabase) return null;

    const { data, error: rpcError } = await supabase.rpc('get_or_create_conversation', {
      p_user1_clerk_id: userId,
      p_user2_clerk_id: otherUserClerkId
    });

    if (rpcError) {
      console.error('Error getting/creating conversation:', rpcError);
      throw rpcError;
    }

    const id = data as string;
    setConversationId(id);
    return id;
  }, [userId, otherUserClerkId, getToken]);

  const reloadMessages = useCallback(async () => {
    if (!userId) {
      setError('User not authenticated');
      return;
    }
    if (!otherUserClerkId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const token = await getToken();
      const supabase = createSupabaseClient(token || undefined);
      if (!supabase) {
        setError('Supabase client not configured');
        return;
      }

      const convId = conversationId ?? (await ensureConversation());
      if (!convId) return;

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(
          'id, conversation_id, sender_clerk_id, recipient_clerk_id, content, message_type, status, reply_to_message_id, read_at, is_edited, edited_at, sent_at, message_attachments:message_attachments(*)'
        )
        .eq('conversation_id', convId)
        .order('sent_at', { ascending: true });

      if (fetchError) {
        throw fetchError;
      }

      const mapped: ChatMessage[] =
        (data ?? []).map((row: any) => ({
          id: row.id,
          conversationId: row.conversation_id,
          senderId: row.sender_clerk_id,
          recipientId: row.recipient_clerk_id,
          content: row.content ?? '',
          type: row.message_type as MessageType,
          status: (row.status as MessageStatus) ?? 'sent',
          replyToMessageId: row.reply_to_message_id,
          readAt: row.read_at,
          isEdited: row.is_edited ?? false,
          editedAt: row.edited_at,
          sentAt: row.sent_at,
          attachments:
            (row.message_attachments ?? []).map((att: any) => ({
              id: att.id,
              attachmentType: att.attachment_type,
              url: att.url,
              thumbnailUrl: att.thumbnail_url,
              durationSeconds: att.duration_seconds,
              waveform: att.waveform,
              width: att.width,
              height: att.height,
              fileName: att.file_name,
              fileExtension: att.file_extension,
              mimeType: att.mime_type,
              fileSizeBytes: att.file_size_bytes
            })) ?? []
        })) ?? [];

      setMessages(mapped);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to load messages';
      setError(message);
      console.error('Error loading messages:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, otherUserClerkId, conversationId, ensureConversation, getToken]);

  const sendTextMessage = useCallback(
    async (content: string, replyToMessageId?: string) => {
      if (!userId) {
        setError('User not authenticated');
        return;
      }
      if (!otherUserClerkId) {
        setError('Other user not specified');
        return;
      }
      if (!content.trim()) return;

      try {
        setIsSending(true);
        setError(null);

        const token = await getToken();
        const supabase = createSupabaseClient(token || undefined);
        if (!supabase) {
          setError('Supabase client not configured');
          return;
        }

        const convId = conversationId ?? (await ensureConversation());
        if (!convId) return;

        // Optimistic local message
        const tempId = `temp-${Date.now()}`;
        const optimistic: ChatMessage = {
          id: tempId,
          conversationId: convId,
          senderId: userId,
          recipientId: otherUserClerkId,
          content,
          type: 'text',
          status: 'sending',
          replyToMessageId: replyToMessageId ?? null,
          readAt: null,
          isEdited: false,
          editedAt: null,
          sentAt: new Date().toISOString(),
          attachments: []
        };
        setMessages((prev) => [...prev, optimistic]);

        const { data, error: insertError } = await supabase
          .from('messages')
          .insert({
            conversation_id: convId,
            sender_clerk_id: userId,
            recipient_clerk_id: otherUserClerkId,
            content,
            message_type: 'text',
            status: 'sent',
            reply_to_message_id: replyToMessageId ?? null
          })
          .select(
            'id, conversation_id, sender_clerk_id, recipient_clerk_id, content, message_type, status, reply_to_message_id, read_at, is_edited, edited_at, sent_at'
          )
          .single();

        if (insertError) {
          throw insertError;
        }

        const saved: ChatMessage = {
          id: data.id,
          conversationId: data.conversation_id,
          senderId: data.sender_clerk_id,
          recipientId: data.recipient_clerk_id,
          content: data.content ?? '',
          type: data.message_type as MessageType,
          status: (data.status as MessageStatus) ?? 'sent',
          replyToMessageId: data.reply_to_message_id,
          readAt: data.read_at,
          isEdited: data.is_edited ?? false,
          editedAt: data.edited_at,
          sentAt: data.sent_at,
          attachments: []
        };

        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? saved : m))
        );
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to send message';
        setError(message);
        console.error('Error sending message:', err);
      } finally {
        setIsSending(false);
      }
    },
    [userId, otherUserClerkId, conversationId, ensureConversation, getToken]
  );

  const markAllAsRead = useCallback(async () => {
    if (!userId || !conversationId) return;

    try {
      const token = await getToken();
      const supabase = createSupabaseClient(token || undefined);
      if (!supabase) return;

      const { error: updateError } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString(), status: 'read' })
        .eq('conversation_id', conversationId)
        .eq('recipient_clerk_id', userId)
        .is('read_at', null);

      if (updateError) {
        throw updateError;
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.recipientId === userId && !m.readAt
            ? { ...m, readAt: new Date().toISOString(), status: 'read' }
            : m
        )
      );
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [userId, conversationId, getToken]);

  useEffect(() => {
    if (!userId || !otherUserClerkId) return;

    const setupRealtime = async () => {
      const token = await getToken();
      const supabase = createSupabaseClient(token || undefined);
      if (!supabase || !conversationId) return;

      void reloadMessages();

      // Once we know the conversation id, subscribe to realtime changes
      const channel = supabase
      .channel(`messages:conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // For now, keep logic simple and just refetch on any change.
          // Later you can optimize by handling INSERT/UPDATE granularly.
          void reloadMessages();
        }
      )
      .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, [userId, otherUserClerkId, conversationId, reloadMessages, getToken]);

  return {
    conversationId,
    messages,
    isLoading,
    isSending,
    error,
    sendTextMessage,
    markAllAsRead,
    reloadMessages
  };
};


