import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PageTransition } from '@/components/layout/PageTransition';
import { Sheet } from '@/components/layout/Sheet';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { Heart, Sparkles, Users, MessageCircle } from 'lucide-react';

const LayoutDemo = () => {
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState('discover');
  const [showSheet, setShowSheet] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const handleRefresh = async () => {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('Refreshed!');
        resolve();
      }, 1500);
    });
  };

  const handleTabChange = (tabId: string) => {
    setDirection(tabId > activeTab ? 'forward' : 'back');
    setActiveTab(tabId);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Top Bar */}
      <TopBar
        variant="logo"
        notificationCount={unreadCount}
        userInitials="AZ"
        onNotificationClick={() => navigate('/notifications')}
        onProfileClick={() => navigate('/profile')}
      />

      {/* Screen Content */}
      <ScreenContainer
        hasTopBar={true}
        hasBottomNav={true}
        padding={true}
        scrollable={true}
        onRefresh={handleRefresh}
      >
        <PageTransition direction={direction}>
          <div className="py-6">
            {/* Tab Title */}
            <h1 className="text-3xl font-bold text-primary-forest mb-2">
              {activeTab === 'discover' && 'Discover'}
              {activeTab === 'agent' && 'MyAgent'}
              {activeTab === 'dna' && 'MySoul DNA'}
              {activeTab === 'chaichat' && 'ChaiChat'}
              {activeTab === 'messages' && 'Messages'}
            </h1>
            
            <p className="text-md text-neutral-600 mb-8">
              {activeTab === 'discover' && 'Find compatible matches near you'}
              {activeTab === 'agent' && 'Your AI matchmaking assistant'}
              {activeTab === 'dna' && 'Discover your compatibility profile'}
              {activeTab === 'chaichat' && 'Connect through meaningful conversations'}
              {activeTab === 'messages' && 'Your conversations and connections'}
            </p>

            {/* Demo Cards */}
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-forest to-primary-gold flex items-center justify-center flex-shrink-0">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                        Demo Card {i}
                      </h3>
                      <p className="text-md text-neutral-600 leading-relaxed">
                        This is a demo card showing how content appears in the {activeTab} tab.
                        Pull down to refresh this screen.
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Sheet Demo Button */}
              <Button
                onClick={() => setShowSheet(true)}
                className="w-full min-h-[44px] bg-primary-forest text-white hover:bg-primary-forest/90 touch-feedback"
              >
                Open Bottom Sheet Demo
              </Button>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-gradient-to-br from-primary-pink/10 to-primary-gold/10 rounded-xl p-4 text-center">
                  <Sparkles className="w-8 h-8 text-primary-gold mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-900">Premium</p>
                </div>
                <div className="bg-gradient-to-br from-primary-forest/10 to-primary-gold/10 rounded-xl p-4 text-center">
                  <Users className="w-8 h-8 text-primary-forest mx-auto mb-2" />
                  <p className="text-sm font-medium text-neutral-900">Community</p>
                </div>
              </div>
            </div>
          </div>
        </PageTransition>
      </ScreenContainer>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Demo Sheet */}
      <Sheet
        isOpen={showSheet}
        onClose={() => setShowSheet(false)}
        title="Bottom Sheet Demo"
      >
        <div className="space-y-4">
          <p className="text-md text-neutral-600">
            This is a bottom sheet component with drag-to-dismiss functionality.
            Try dragging it down to close it.
          </p>

          <div className="grid gap-3">
            {['Option 1', 'Option 2', 'Option 3', 'Option 4'].map((option) => (
              <button
                key={option}
                className="w-full min-h-[44px] px-4 py-3 bg-neutral-50 hover:bg-neutral-100 rounded-xl text-left text-md font-medium text-neutral-900 touch-feedback transition-colors"
              >
                {option}
              </button>
            ))}
          </div>

          <Button
            onClick={() => setShowSheet(false)}
            variant="outline"
            className="w-full min-h-[44px] mt-4 border-primary-forest text-primary-forest touch-feedback"
          >
            Close Sheet
          </Button>
        </div>
      </Sheet>
    </div>
  );
};

export default LayoutDemo;
