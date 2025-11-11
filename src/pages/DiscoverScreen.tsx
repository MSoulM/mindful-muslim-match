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

  const fetchNewMatches = async () => {
    setLoading(true);
    setAnnouncement('Refreshing matches...');
    
    // Simulated refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    showToast('success', 'Matches refreshed');
    setAnnouncement('Matches refreshed successfully.');
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
      case 'agent':
        navigate('/agent');
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
            notificationCount={5}
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
                  fetchNewMatches();
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
          notificationCount={5}
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
          onRefresh={fetchNewMatches}
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
