import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PageTransition } from '@/components/layout/PageTransition';
import { AgentMessage } from '@/components/chat/AgentMessage';
import { MatchCard } from '@/components/match/MatchCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Feedback/Skeleton';
import { Toast } from '@/components/ui/Feedback/Toast';
import { SkipLink } from '@/components/ui/accessibility/SkipLink';
import { ScreenReaderAnnounce } from '@/components/ui/accessibility/ScreenReaderAnnounce';
import { useNotifications } from '@/hooks/useNotifications';

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

interface InProgressChat {
  id: string;
  name: string;
  avatar: string;
  messageCount: number;
}

const sampleMatches: Match[] = [
  {
    id: 'match-1',
    name: 'Sarah',
    age: 28,
    location: 'North London',
    distance: '2.3 miles',
    compatibility: 95,
    bio: 'Family-oriented doctor who loves reading, hiking, and exploring new cuisines. Looking for someone who values both deen and duniya. Early mornings are my meditation time.',
    emoji: '👩‍⚕️',
    insights: 'Sarah shares your commitment to work-life balance and has expressed strong interest in community service. Your conversation revealed deep alignment on family values.',
    chaiChat: {
      topicsCount: 23,
      strength: 'Strong'
    }
  },
  {
    id: 'match-2',
    name: 'Layla',
    age: 26,
    location: 'East London',
    distance: '4.1 miles',
    compatibility: 91,
    bio: 'Creative soul teaching primary school. Passionate about education reform and child development. Weekends find me at museums or trying new recipes. Growth mindset is everything.',
    emoji: '👩‍🏫',
    insights: 'You both value continuous learning and have similar communication styles. The AI conversation showed beautiful intellectual chemistry.',
    chaiChat: {
      topicsCount: 18,
      strength: 'Strong'
    }
  },
  {
    id: 'match-3',
    name: 'Amina',
    age: 27,
    location: 'West London',
    distance: '3.7 miles',
    compatibility: 89,
    bio: 'Software engineer building solutions for social good. Balanced between technical challenges and creative pursuits. Love travel, photography, and deep conversations over chai.',
    emoji: '👩‍💻',
    insights: 'Professional compatibility is exceptional. Both value innovation and making a positive impact. Some lifestyle differences to explore further.',
    chaiChat: {
      topicsCount: 16,
      strength: 'Moderate'
    }
  },
];

const inProgressChats: InProgressChat[] = [
  {
    id: '3',
    name: 'Ahmad R.',
    avatar: '👤',
    messageCount: 8,
  },
  {
    id: '4',
    name: 'Fatima K.',
    avatar: '👩',
    messageCount: 5,
  },
];

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 50 
  },
  visible: { 
    opacity: 1, 
    y: 0
  }
};

export default function DiscoverScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [matches, setMatches] = useState<Match[]>(sampleMatches);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const { unreadCount } = useNotifications();
  const [toast, setToast] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
  }>({
    isOpen: false,
    type: 'info',
    title: ''
  });

  const hapticFeedback = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: 5, medium: 10, heavy: 15 };
      navigator.vibrate(patterns[style]);
    }
  };

  const showToast = (type: 'success' | 'error' | 'warning' | 'info', title: string) => {
    setToast({ isOpen: true, type, title });
  };

  const handleChaiChatClick = (matchId: string) => {
    hapticFeedback('light');
    navigate(`/chaichat/${matchId}`);
  };

  const handleSkip = (matchId: string) => {
    hapticFeedback('medium');
    
    const match = matches.find(m => m.id === matchId);
    
    // Animate card out
    setMatches(prev => prev.filter(m => m.id !== matchId));
    
    // Show toast and announce
    showToast('info', 'Match saved for later');
    setAnnouncement(`Match with ${match?.name} skipped. Showing next match.`);
  };

  const handleNotificationClick = () => {
    hapticFeedback('light');
    navigate('/notifications');
  };

  const handleProfileClick = () => {
    hapticFeedback('light');
    navigate('/profile');
  };

  const handleTabChange = (tabId: string) => {
    hapticFeedback('light');
    setActiveTab(tabId);
    
    // Navigate to different screens based on tab
    switch (tabId) {
      case 'discover':
        navigate('/discover');
        break;
      case 'myagent':
        navigate('/myagent');
        break;
      case 'dna':
        navigate('/dna');
        break;
      case 'chaichat':
        navigate('/chaichat');
        break;
      case 'messages':
        navigate('/messages');
        break;
    }
  };

  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen flex flex-col">
          <TopBar
            variant="logo"
            notificationCount={unreadCount}
            userInitials="AK"
            onNotificationClick={handleNotificationClick}
            onProfileClick={handleProfileClick}
          />
          
          <ScreenContainer
            hasTopBar
            hasBottomNav
            scrollable
            padding
          >
            <EmptyState
              icon="⚠️"
              title="Unable to Load Matches"
              description="Please check your connection and try again"
              action={{
                label: "Retry",
                onClick: () => {
                  setError(null);
                  setLoading(false);
                }
              }}
            />
          </ScreenContainer>

          <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <ScreenReaderAnnounce message={announcement} />
      
      <div className="min-h-screen flex flex-col">
        {/* TopBar */}
        <TopBar
          variant="logo"
          notificationCount={unreadCount}
          userInitials="AK"
          onNotificationClick={handleNotificationClick}
          onProfileClick={handleProfileClick}
        />

        {/* Main Content */}
        <ScreenContainer
          hasTopBar
          hasBottomNav
          scrollable
          padding
        >
          <div className="space-y-6 pb-8">
            {/* Welcome Message */}
            <AgentMessage
              avatar="🤖"
              title="Your MMAgent"
              message="I've carefully curated 3 exceptional matches for you this week. Each conversation has been thoughtfully developed to explore compatibility. Take your time reviewing - quality over quantity always."
              variant="welcome"
              timestamp="Updated 2 hours ago"
            />

            {/* Loading State */}
            {loading && (
              <div className="space-y-4">
                <Skeleton variant="rect" height={600} className="rounded-2xl" />
                <Skeleton variant="rect" height={600} className="rounded-2xl" />
                <Skeleton variant="rect" height={600} className="rounded-2xl" />
              </div>
            )}

            {/* Match Cards */}
            {!loading && matches.length > 0 && (
              <div className="space-y-6">
                {matches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    transition={{
                      delay: index * 0.15,
                      duration: 0.5,
                    }}
                  >
                    <MatchCard
                      match={match}
                      onChaiChatClick={() => handleChaiChatClick(match.id)}
                      onSkip={() => handleSkip(match.id)}
                      variant="full"
                    />
                  </motion.div>
                ))}
              </div>
            )}

            {/* In Progress ChaiChat Section */}
            {inProgressChats.length > 0 && (matches.length > 0 || matches.length === 0) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8"
              >
                <h2 className="text-lg font-bold text-foreground mb-3">
                  💬 ChaiChat In Progress ({inProgressChats.length})
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  AI is analyzing these conversations to determine compatibility
                </p>
                <div className="space-y-3">
                  {inProgressChats.map((chat, index) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.4 + index * 0.05 }}
                      className="bg-card rounded-xl shadow-sm border-l-4 border-warning overflow-hidden animate-pulse"
                    >
                      <div className="p-4 flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-2xl bg-muted">
                          {chat.avatar}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">{chat.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-warning">⏳ In progress</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">{chat.messageCount} messages analyzed</span>
                          </div>
                        </div>

                        {/* Loading Indicator */}
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 border-2 border-warning border-t-transparent rounded-full animate-spin" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty State */}
            {!loading && matches.length === 0 && (
              <EmptyState
                icon="🕊️"
                title="Patience Brings Perfection"
                description="Your agent is carefully curating matches that align with your values. New matches arrive every Sunday."
                action={{
                  label: "Improve My Profile",
                  onClick: () => navigate('/profile/edit')
                }}
              />
            )}

            {/* Footer */}
            {!loading && matches.length > 0 && (
              <div className="text-center py-8">
                <div className="text-sm text-neutral-500 mb-2">
                  ⏳ New matches arrive every Sunday
                </div>
                <div className="text-xs text-neutral-400">
                  Your agent is continuously learning your preferences
                </div>
              </div>
            )}
          </div>
        </ScreenContainer>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        {/* Toast Notifications */}
        <Toast
          type={toast.type}
          title={toast.title}
          isOpen={toast.isOpen}
          onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
          duration={3000}
        />
      </div>
    </PageTransition>
  );
}
