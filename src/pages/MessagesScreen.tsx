import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { MessageCard } from '@/components/message/MessageCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

const MessagesScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('messages');
  // Mock data - replace with real data later
  const messages = [
    {
      id: '1',
      avatar: '👩‍🦰',
      name: 'Sarah M.',
      preview: 'That sounds wonderful! When...',
      time: '5m',
      unreadCount: 3,
      isOnline: true,
      isFromUser: false,
    },
    {
      id: '2',
      avatar: '👩',
      name: 'Zainab A.',
      preview: "I'd love to! Let me...",
      time: '2h',
      unreadCount: 0,
      isOnline: true,
      isFromUser: true,
    },
    {
      id: '3',
      avatar: '👩‍🦱',
      name: 'Noor M.',
      preview: 'Thank you for the lovely...',
      time: '1d',
      unreadCount: 1,
      isOnline: false,
      isFromUser: false,
    },
  ];

  const hasMessages = messages.length > 0;

  const handleMessageClick = (id: string) => {
    // Navigate to conversation detail screen
    console.log('Navigate to message:', id);
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
        {hasMessages ? (
          <>
            {/* Active Conversations */}
            <div className="flex flex-col">
              {messages.map((message) => (
                <MessageCard
                  key={message.id}
                  avatar={message.avatar}
                  name={message.name}
                  preview={message.preview}
                  time={message.time}
                  unreadCount={message.unreadCount}
                  isOnline={message.isOnline}
                  isFromUser={message.isFromUser}
                  onClick={() => handleMessageClick(message.id)}
                />
              ))}
            </div>

            {/* Archived Link */}
            <div className="p-5">
              <button className="text-sm text-primary hover:underline">
                View archived (2)
              </button>
            </div>
          </>
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

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default MessagesScreen;
