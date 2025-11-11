import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { InfoCard } from '@/components/ui/Cards/InfoCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ChaiChatItem {
  id: string;
  name: string;
  avatar: string;
  compatibility: number;
  status: 'pending' | 'in-progress' | 'completed';
  messageCount: number;
  recommendation?: string;
}

const ChaiChatListScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chaichat');
  const [expandedExplanation, setExpandedExplanation] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const pendingChats: ChaiChatItem[] = [
    {
      id: '1',
      name: 'Sarah M.',
      avatar: '👩‍🦰',
      compatibility: 95,
      status: 'pending',
      messageCount: 23,
      recommendation: 'Highly recommended',
    },
    {
      id: '2',
      name: 'Layla H.',
      avatar: '👩',
      compatibility: 91,
      status: 'pending',
      messageCount: 18,
      recommendation: 'Recommended',
    },
  ];

  const inProgressChats: ChaiChatItem[] = [
    {
      id: '3',
      name: 'Ahmad R.',
      avatar: '👤',
      compatibility: 0,
      status: 'in-progress',
      messageCount: 8,
    },
  ];

  const completedChats: ChaiChatItem[] = [
    {
      id: '4',
      name: 'Fatima K.',
      avatar: '👩',
      compatibility: 89,
      status: 'completed',
      messageCount: 21,
      recommendation: 'Reviewed',
    },
    {
      id: '5',
      name: 'Zainab A.',
      avatar: '👩',
      compatibility: 87,
      status: 'completed',
      messageCount: 19,
      recommendation: 'Reviewed',
    },
  ];

  const renderChatCard = (chat: ChaiChatItem) => {
    const isClickable = chat.status === 'pending' || chat.status === 'completed';
    const borderColor = {
      pending: 'border-semantic-success',
      'in-progress': 'border-semantic-warning',
      completed: 'border-neutral-300',
    }[chat.status];

    const statusText = {
      pending: '✓ Completed',
      'in-progress': '⏳ In progress',
      completed: '✓ Reviewed',
    }[chat.status];

    const statusColor = {
      pending: 'text-semantic-success',
      'in-progress': 'text-semantic-warning',
      completed: 'text-neutral-500',
    }[chat.status];

    return (
      <motion.div
        whileTap={isClickable ? { scale: 0.98 } : undefined}
        className={cn(
          'bg-white rounded-xl shadow-sm border-l-4 overflow-hidden',
          borderColor,
          isClickable && 'cursor-pointer hover:shadow-md transition-shadow',
          chat.status === 'completed' && 'opacity-70',
          chat.status === 'in-progress' && 'animate-pulse'
        )}
        onClick={
          isClickable ? () => navigate(`/chaichat/${chat.id}`) : undefined
        }
      >
        <div className="p-4 flex items-center gap-3">
          {/* Avatar */}
          <div
            className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-2xl',
              chat.status === 'in-progress'
                ? 'bg-neutral-200'
                : 'bg-gradient-to-br from-primary-forest to-primary-gold'
            )}
          >
            {chat.avatar}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name and Compatibility */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-neutral-900 truncate">
                {chat.name}
              </h3>
              {chat.compatibility > 0 && (
                <span className="text-sm font-bold text-semantic-success">
                  {chat.compatibility}%
                </span>
              )}
              {chat.status === 'in-progress' && (
                <span className="text-sm font-medium text-neutral-500">
                  Analyzing...
                </span>
              )}
            </div>

            {/* Status */}
            <div className={cn('text-sm font-medium mb-1', statusColor)}>
              {statusText}
            </div>

            {/* Details */}
            <p className="text-sm text-neutral-600">
              {chat.messageCount} messages
              {chat.recommendation && ` • ${chat.recommendation}`}
            </p>
          </div>

          {/* Chevron (only for clickable cards) */}
          {isClickable && (
            <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
          )}
        </div>
      </motion.div>
    );
  };

  const hasAnyChats = pendingChats.length > 0 || inProgressChats.length > 0 || completedChats.length > 0;

  return (
    <div className="relative min-h-screen bg-neutral-50">
      <TopBar variant="logo" />
      
      <ScreenContainer
        hasTopBar
        hasBottomNav
        padding
        scrollable
      >
        {/* How ChaiChat Works Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <InfoCard
            variant="highlight"
            icon={<span className="text-xl">💬</span>}
            title="How ChaiChat Works"
            description="Your AI agents have thoughtful conversations to explore compatibility before you meet."
            className={cn(
              'transition-all',
              !expandedExplanation && 'line-clamp-3'
            )}
          />
          <button
            onClick={() => setExpandedExplanation(!expandedExplanation)}
            className="text-sm text-primary-forest font-medium mt-2 flex items-center gap-1"
          >
            {expandedExplanation ? (
              <>Show less <ChevronUp className="w-4 h-4" /></>
            ) : (
              <>Learn more <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </motion.div>

        {hasAnyChats ? (
          <>
            {/* Pending Review Section */}
            {pendingChats.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mb-6"
              >
                <h2 className="text-lg font-bold text-neutral-900 mb-3">
                  ⏳ Pending Your Review ({pendingChats.length})
                </h2>
                <div className="space-y-3">
                  {pendingChats.map((chat, index) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.15 + index * 0.05 }}
                    >
                      {renderChatCard(chat)}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* In Progress Section */}
            {inProgressChats.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mb-6"
              >
                <h2 className="text-lg font-bold text-neutral-900 mb-3">
                  💬 In Progress ({inProgressChats.length})
                </h2>
                <div className="space-y-3">
                  {inProgressChats.map((chat) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.25 }}
                    >
                      {renderChatCard(chat)}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Completed Section */}
            {completedChats.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-neutral-900">
                    ✓ Reviewed ({completedChats.length})
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCompleted(!showCompleted)}
                  >
                    {showCompleted ? 'Hide' : 'Show'}
                  </Button>
                </div>

                <AnimatePresence>
                  {showCompleted && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3 overflow-hidden"
                    >
                      {completedChats.map((chat, index) => (
                        <motion.div
                          key={chat.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          {renderChatCard(chat)}
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        ) : (
          // Empty State
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="flex flex-col items-center justify-center text-center py-12 px-4"
          >
            <div className="text-6xl mb-4">💬</div>
            <h2 className="text-xl font-bold text-neutral-900 mb-2">
              No ChaiChats Yet
            </h2>
            <p className="text-[15px] text-neutral-600 max-w-sm">
              Your agents will start conversations with compatible matches every Sunday
            </p>
          </motion.div>
        )}

        {/* Bottom padding for nav */}
        <div className="h-20" />
      </ScreenContainer>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default ChaiChatListScreen;
