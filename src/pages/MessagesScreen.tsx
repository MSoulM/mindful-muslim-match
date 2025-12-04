import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { MessageCard } from '@/components/message/MessageCard';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { SwipeableCard } from '@/components/ui/SwipeableCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { useChaiChatPending } from '@/hooks/useChaiChatPending';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useConversations } from '@/hooks/useConversations';
import { supabase } from '@/lib/supabase';
import { formatMessageTime } from '@/utils/dateUtils';
import type { ConversationWithProfile } from '@/types/messages';

const MessagesScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('messages');
  const { pendingCount } = useChaiChatPending();
  const { unreadCount: unreadMessagesCount } = useUnreadMessages();
  const { conversations, isLoading, reload } = useConversations();
  const [profiles, setProfiles] = useState<Record<string, { name: string; avatar: string }>>({});

  // Fetch profiles for all other users in conversations
  useEffect(() => {
    if (conversations.length === 0) return;

    const fetchProfiles = async () => {
      const otherUserIds = conversations.map(c => c.otherUserId);
      if (otherUserIds.length === 0 || !supabase) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('clerk_user_id, first_name, last_name, primary_photo_url')
          .in('clerk_user_id', otherUserIds);

        if (error) {
          console.error('Error fetching profiles:', error);
          return;
        }

        const profileMap: Record<string, { name: string; avatar: string }> = {};
        (data || []).forEach(profile => {
          const firstName = profile.first_name || '';
          const lastName = profile.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim() || 'Unknown';
          const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?';
          
          profileMap[profile.clerk_user_id] = {
            name: fullName,
            avatar: profile.primary_photo_url || initials
          };
        });

        setProfiles(profileMap);
      } catch (err) {
        console.error('Error fetching profiles:', err);
      }
    };

    void fetchProfiles();
  }, [conversations]);

  // Map conversations to MessageCard format
  const messagesWithProfiles = useMemo<ConversationWithProfile[]>(() => {
    return conversations.map(conv => {
      const profile = profiles[conv.otherUserId] || { name: 'Unknown', avatar: '?' };
      
      // Format preview based on message type
      let preview = conv.lastMessagePreview || '';
      if (!preview) {
        if (conv.lastMessageType === 'voice') {
          preview = 'Voice message';
        } else if (conv.lastMessageType === 'image') {
          preview = 'Photo';
        } else if (conv.lastMessageType === 'file') {
          preview = 'File';
        } else if (conv.lastMessageType === 'emoji') {
          preview = conv.lastMessagePreview || 'Emoji';
        }
      } else if (preview.length > 50) {
        preview = preview.substring(0, 50) + '...';
      }

      // Format time (short format for message list)
      const time = conv.lastMessageSentAt 
        ? formatMessageTime(conv.lastMessageSentAt)
        : '';

      return {
        conversationId: conv.id,
        otherUserId: conv.otherUserId,
        name: profile.name,
        avatar: profile.avatar,
        preview,
        time,
        unreadCount: conv.unreadCount,
        isFromUser: conv.isLastMessageFromCurrentUser
      };
    });
  }, [conversations, profiles]);

  const hasMessages = messagesWithProfiles.length > 0;

  const handleMessageClick = (otherUserId: string) => {
    navigate(`/chat/${otherUserId}`);
  };

  const handleArchive = (conversationId: string) => {
    console.log('Archive conversation:', conversationId);
    // TODO: Implement archive logic
  };

  const handleRefresh = async () => {
    await reload();
  };

  const handleExploreMatches = () => {
    navigate('/discover');
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/${tabId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar variant="logo" />
      
      <ScreenContainer 
        hasTopBar 
        hasBottomNav
        padding={false}
      >
        {isLoading ? (
          <div className="flex flex-col">
            {[1, 2, 3].map(i => (
              <div key={i} className="px-4 py-3 border-b border-border animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : hasMessages ? (
          <PullToRefresh onRefresh={handleRefresh}>
            {/* Active Conversations */}
            <div className="flex flex-col">
              {messagesWithProfiles.map((message) => (
                <SwipeableCard
                  key={message.conversationId}
                  onSwipeLeft={() => handleArchive(message.conversationId)}
                  leftAction={{
                    label: 'Archive',
                    color: '#ef4444',
                    icon: <Archive className="w-5 h-5 text-white" />
                  }}
                >
                  <MessageCard
                    avatar={message.avatar}
                    name={message.name}
                    preview={message.preview}
                    time={message.time}
                    unreadCount={message.unreadCount}
                    isFromUser={message.isFromUser}
                    onClick={() => handleMessageClick(message.otherUserId)}
                  />
                </SwipeableCard>
              ))}
            </div>

            {/* Archived Link */}
            <div className="p-5">
              <button className="text-sm text-primary hover:underline">
                View archived (2)
              </button>
            </div>
          </PullToRefresh>
        ) : (
          <EmptyState
            icon={<span className="text-6xl">💬</span>}
            title="No Messages Yet"
            description="When you connect with matches, your conversations will appear here"
            action={{
              label: 'Explore Matches',
              onClick: handleExploreMatches,
            }}
          />
        )}
      </ScreenContainer>

      <BottomNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        chaiChatBadge={pendingCount}
        messagesBadge={unreadMessagesCount}
      />
    </div>
  );
};

export default MessagesScreen;
