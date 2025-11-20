import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, MessageSquare, BarChart, ChevronRight, Target, TrendingUp, MessageCircle } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AgentMessage } from '@/components/chat/AgentMessage';
import { FeatureCard } from '@/components/ui/Cards/FeatureCard';
import { InfoCard } from '@/components/ui/Cards/InfoCard';
import { Button } from '@/components/ui/button';
import { useChaiChatPending } from '@/hooks/useChaiChatPending';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { cn } from '@/lib/utils';

const MyAgentScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('myagent');
  const [showQuickActions, setShowQuickActions] = useState(false);
  const { pendingCount } = useChaiChatPending();
  const { unreadCount: unreadMessagesCount } = useUnreadMessages();

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    setShowQuickActions(target.scrollTop > 200);
  };

  const agentMessage = "Hi there! 👋 I've been learning so much about you. Based on your recent activity, I've gained 8 new insights about your personality and values. Ready to explore them together?";

  const activityItems = [
    {
      icon: Target,
      iconBg: 'bg-primary-gold/10',
      iconColor: 'text-primary-gold',
      title: 'New Match Available',
      description: 'Sarah M. - 95% compatible',
      time: '3h ago',
    },
    {
      icon: TrendingUp,
      iconBg: 'bg-semantic-success/10',
      iconColor: 'text-semantic-success',
      title: 'DNA Profile Updated',
      description: 'Values & Beliefs improved by 3%',
      time: '5h ago',
    },
    {
      icon: MessageCircle,
      iconBg: 'bg-primary-forest/10',
      iconColor: 'text-primary-forest',
      title: 'ChaiChat Complete',
      description: 'Review your conversation with Layla',
      time: '1d ago',
    },
  ];

  return (
    <div className="relative min-h-screen bg-neutral-50">
      <TopBar variant="logo" />
      
      <ScreenContainer
        hasTopBar
        hasBottomNav
        padding
        scrollable
      >
        {/* Agent Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <AgentMessage
            avatar="🤖"
            title="Your MMAgent"
            message={agentMessage}
            variant="welcome"
            className="shadow-md"
          />
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="space-y-3 mb-8"
        >
          {/* My Insights About You */}
          <div className="relative">
            <FeatureCard
              icon={<Zap className="w-6 h-6" />}
              title="My Insights About You"
              description="8 pending • 142 confirmed"
              rightElement={<ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />}
              onClick={() => navigate('/insights')}
              className="min-h-[90px]"
            />
            {/* Notification Badge */}
            <div className="absolute top-3 right-3 bg-semantic-error text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
              8
            </div>
          </div>

          {/* Talk to Me */}
          <FeatureCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="Talk to Me"
            description="Chat about anything"
            rightElement={<ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />}
            onClick={() => navigate('/agent-chat')}
            className="min-h-[90px]"
          />

          {/* Your Journey Stats */}
          <FeatureCard
            icon={<BarChart className="w-6 h-6" />}
            title="Your Journey Stats"
            description="Track your progress"
            rightElement={<ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />}
            onClick={() => navigate('/stats')}
            className="min-h-[90px]"
          />
        </motion.div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="mt-8"
        >
          <h2 className="text-lg font-bold text-neutral-900 mb-4">Recent Activity</h2>
          
          <div className="space-y-3">
            {activityItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 + index * 0.05 }}
                >
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
                    <div className="flex items-center gap-3">
                      {/* Icon */}
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                        item.iconBg
                      )}>
                        <Icon className={cn('w-4 h-4', item.iconColor)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-neutral-900 truncate">
                          {item.title}
                        </h3>
                        <p className="text-sm text-neutral-600 truncate">
                          {item.description}
                        </p>
                      </div>

                      {/* Time */}
                      <span className="text-xs text-neutral-500 flex-shrink-0">
                        {item.time}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Bottom padding for nav */}
        <div className="h-20" />
      </ScreenContainer>

      {/* Quick Actions Footer (sticky when scrolled) */}
      {showQuickActions && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-neutral-50 via-neutral-50 to-transparent pointer-events-none"
          style={{ paddingBottom: 'calc(60px + env(safe-area-inset-bottom))' }}
        >
          <div className="flex gap-2 max-w-md mx-auto pointer-events-auto">
            <Button
              variant="secondary"
              size="default"
              onClick={() => navigate('/agent-chat')}
              className="flex-1"
            >
              Ask Question
            </Button>
            <Button
              variant="default"
              size="default"
              onClick={() => navigate('/insights')}
              className="flex-1"
            >
              View Insights
            </Button>
          </div>
        </motion.div>
      )}

      <BottomNav 
        activeTab={activeTab} 
        chaiChatBadge={pendingCount}
        messagesBadge={unreadMessagesCount}
        onTabChange={(tabId) => {
          setActiveTab(tabId);
        if (tabId === 'discover') navigate('/discover');
        else if (tabId === 'myagent') navigate('/myagent');
        else if (tabId === 'dna') navigate('/dna');
        else if (tabId === 'chaichat') navigate('/chaichat');
        else if (tabId === 'messages') navigate('/messages');
      }} />
    </div>
  );
};

export default MyAgentScreen;
