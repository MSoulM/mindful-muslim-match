import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { MessageCard } from '@/components/message/MessageCard';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { SwipeableCard } from '@/components/ui/SwipeableCard';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { ErrorState } from '@/components/ui/states/ErrorState';
import { SkeletonMessagesScreen } from '@/components/ui/skeletons';
import { useChaiChatPending } from '@/hooks/useChaiChatPending';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useLoadingState } from '@/hooks/useLoadingState';
import { useToast } from '@/hooks/use-toast';

const MessagesScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('messages');
  const { pendingCount } = useChaiChatPending();
  const { unreadCount: unreadMessagesCount } = useUnreadMessages();
  const { toast } = useToast();
  
  // Loading state management
  const {
    isLoading,
    loadingType,
    error,
    setLoading,
    setIdle,
    setError,
    withLoading,
  } = useLoadingState('initial');

  const [messages, setMessages] = useState<any[]>([]);

  // Simulate initial data fetch
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading('initial');
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1200));
        // Mock data - replace with real data later
        setMessages([
          {
            id: '1',
            avatar: '👩‍🦰',
            name: 'Sarah M.',
            preview: 'That sounds wonderful! When...',
            time: '5m',
            unreadCount: 3,
            isFromUser: false,
          },
          {
            id: '2',
            avatar: '👩',
            name: 'Zainab A.',
            preview: "I'd love to! Let me...",
            time: '2h',
            unreadCount: 0,
            isFromUser: true,
          },
          {
            id: '3',
            avatar: '👩‍🦱',
            name: 'Noor M.',
            preview: 'Thank you for the lovely...',
            time: '1d',
            unreadCount: 1,
            isFromUser: false,
          },
        ]);
        setIdle();
      } catch (err) {
        setError(err as Error);
      }
    };

    fetchMessages();
  }, []);

  const hasMessages = messages.length > 0;

  const handleMessageClick = (id: string) => {
    navigate(`/chat/${id}`);
  };

  const handleArchive = (id: string) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    toast({
      title: 'Message Archived',
      description: 'You can view archived messages anytime.',
    });
  };

  const handleRefresh = async () => {
    await withLoading(async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: 'Messages Updated',
      });
    }, 'refresh');
  };

  const handleExploreMatches = () => {
    navigate('/discover');
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/${tabId}`);
  };

  const handleRetry = async () => {
    try {
      setLoading('initial');
      await new Promise(resolve => setTimeout(resolve, 1200));
      setMessages([
        {
          id: '1',
          avatar: '👩‍🦰',
          name: 'Sarah M.',
          preview: 'That sounds wonderful! When...',
          time: '5m',
          unreadCount: 3,
          isFromUser: false,
        },
      ]);
      setIdle();
    } catch (err) {
      setError(err as Error);
    }
  };

  // Initial loading skeleton
  if (loadingType === 'initial') {
    return (
      <div className="min-h-screen bg-background">
        <TopBar variant="logo" />
        <ScreenContainer hasTopBar hasBottomNav padding={false}>
          <SkeletonMessagesScreen />
        </ScreenContainer>
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          chaiChatBadge={pendingCount}
          messagesBadge={unreadMessagesCount}
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar variant="logo" />
        <ScreenContainer hasTopBar hasBottomNav>
          <ErrorState
            title="Failed to Load Messages"
            description="We couldn't load your messages. Please check your connection and try again."
            onRetry={handleRetry}
            errorCode="MSG_FETCH_ERROR"
          />
        </ScreenContainer>
        <BottomNav 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          chaiChatBadge={pendingCount}
          messagesBadge={unreadMessagesCount}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar variant="logo" />
      
      <ScreenContainer 
        hasTopBar 
        hasBottomNav
        padding={false}
      >
        {hasMessages ? (
          <PullToRefresh onRefresh={handleRefresh}>
            {/* Active Conversations */}
            <div className="flex flex-col">
              {messages.map((message) => (
                <SwipeableCard
                  key={message.id}
                  onSwipeLeft={() => handleArchive(message.id)}
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
                    onClick={() => handleMessageClick(message.id)}
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
          <EmptyState variant="messages" />
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
