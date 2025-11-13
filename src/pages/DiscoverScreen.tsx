import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AgentMessage } from '@/components/chat/AgentMessage';
import { MatchCard } from '@/components/match/MatchCard';
import { EmptyState } from '@/components/ui/states/EmptyState';
import { ErrorState } from '@/components/ui/states/ErrorState';
import { SkeletonDiscoverScreen } from '@/components/ui/skeletons';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { useChaiChatPending } from '@/hooks/useChaiChatPending';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useLoadingState } from '@/hooks/useLoadingState';
import { listStagger, listItem, respectMotionPreference } from '@/utils/animations';
import { haptics } from '@/utils/haptics';
import { toast } from 'sonner';

interface Match {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: string;
  compatibility: number;
  bio: string;
  emoji: string;
  insights?: string;
  chaiChat?: {
    topicsCount: number;
    strength: 'Strong' | 'Moderate' | 'Building';
  };
}

const sampleMatches: Match[] = [
  {
    id: 'match-1',
    name: 'Sarah',
    age: 28,
    location: 'North London',
    distance: '2.3 miles',
    compatibility: 95,
    bio: 'Family-oriented doctor who loves reading, hiking, and exploring new cuisines.',
    emoji: '👩‍⚕️',
    insights: 'Sarah shares your commitment to work-life balance.',
    chaiChat: { topicsCount: 23, strength: 'Strong' }
  },
];

export default function DiscoverScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const { pendingCount } = useChaiChatPending();
  const { unreadCount: unreadMessagesCount } = useUnreadMessages();
  
  const {
    isLoading,
    loadingType,
    error,
    setLoading,
    setIdle,
    setError,
    withLoading,
  } = useLoadingState('initial');

  const [matches, setMatches] = useState<Match[]>([]);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading('initial');
        await new Promise(resolve => setTimeout(resolve, 1500));
        setMatches(sampleMatches);
        setIdle();
      } catch (err) {
        setError(err as Error);
      }
    };
    fetchMatches();
  }, []);

  const handleRefresh = async () => {
    await withLoading(async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMatches([...sampleMatches]);
      toast.success('Matches refreshed');
    }, 'refresh');
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/${tabId}`);
  };

  const handleRetry = async () => {
    try {
      setLoading('initial');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMatches(sampleMatches);
      setIdle();
    } catch (err) {
      setError(err as Error);
    }
  };

  if (loadingType === 'initial') {
    return (
      <div className="min-h-screen bg-background">
        <TopBar variant="logo" />
        <ScreenContainer hasTopBar hasBottomNav padding={false}>
          <SkeletonDiscoverScreen />
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

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar variant="logo" />
        <ScreenContainer hasTopBar hasBottomNav>
          <ErrorState
            title="Failed to Load Matches"
            description="We couldn't load your matches. Please check your connection and try again."
            onRetry={handleRetry}
            errorCode="MATCH_FETCH_ERROR"
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

  if (!isLoading && matches.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar variant="logo" />
        <ScreenContainer hasTopBar hasBottomNav>
          <EmptyState variant="matches" />
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
        onRefresh={handleRefresh}
        padding={false}
      >
        <PullToRefresh onRefresh={handleRefresh}>
          <div className="space-y-6 px-4 py-6">
            <AgentMessage
              message="Here are your weekly matches! I've analyzed compatibility based on your DNA profile. Review the ChaiChat conversations for deeper insights."
              variant="welcome"
            />

            <motion.div
              variants={respectMotionPreference(listStagger)}
              initial="initial"
              animate="animate"
            >
              {matches.map((match) => (
                <motion.div key={match.id} variants={respectMotionPreference(listItem)}>
                  <MatchCard
                    match={match}
                    onChaiChatClick={() => {
                      haptics.tap();
                      navigate(`/chaichat/${match.id}`);
                    }}
                    onSkip={() => {
                      haptics.swipe();
                      setMatches(prev => prev.filter(m => m.id !== match.id));
                      toast.info(`Skipped ${match.name}`);
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </PullToRefresh>
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
