import type { ConversationSummary } from '@/hooks/useConversations';

export interface ConversationWithProfile {
  conversationId: string;
  otherUserId: string;
  name: string;
  avatar: string;
  preview: string;
  time: string;
  unreadCount: number;
  isFromUser: boolean;
}

export const mapConversationToWithProfile = (
  conversation: ConversationSummary,
  profile: { name: string; avatar: string }
): Omit<ConversationWithProfile, 'preview' | 'time'> => {
  return {
    conversationId: conversation.id,
    otherUserId: conversation.otherUserId,
    name: profile.name,
    avatar: profile.avatar,
    unreadCount: conversation.unreadCount,
    isFromUser: conversation.isLastMessageFromCurrentUser
  };
};

