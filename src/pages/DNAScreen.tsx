import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Palette, Brain, Home, Target, Upload, Image, Video, FileText, ChevronRight } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { PageTransition } from '@/components/layout/PageTransition';
import { DNAStatsCard } from '@/components/dna/DNAStatsCard';
import { DNACategoryCard } from '@/components/dna/DNACategoryCard';
import { InfoCard } from '@/components/ui/Cards/InfoCard';
import { useNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

const categories = [
  {
    id: 'values',
    category: 'Values & Beliefs',
    icon: Heart,
    completion: 96,
    rarity: 'ultra-rare' as const,
    percentile: 4,
  },
  {
    id: 'interests',
    category: 'Interests & Hobbies',
    icon: Palette,
    completion: 89,
    rarity: 'rare' as const,
    percentile: 15,
  },
  {
    id: 'personality',
    category: 'Personality Traits',
    icon: Brain,
    completion: 94,
    rarity: 'epic' as const,
    percentile: 8,
  },
  {
    id: 'lifestyle',
    category: 'Lifestyle & Habits',
    icon: Home,
    completion: 87,
    rarity: 'rare' as const,
    percentile: 18,
  },
  {
    id: 'goals',
    category: 'Life Goals & Ambitions',
    icon: Target,
    completion: 92,
    rarity: 'epic' as const,
    percentile: 10,
  },
];

const postTypes = [
  { id: 'photos', label: 'Photos', emoji: '📸', icon: Image },
  { id: 'videos', label: 'Videos', emoji: '🎥', icon: Video },
  { id: 'thoughts', label: 'Thoughts', emoji: '💭', icon: FileText },
];

export default function DNAScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dna');
  const { unreadCount } = useNotifications();

  const hapticFeedback = (style: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = { light: 5, medium: 10, heavy: 15 };
      navigator.vibrate(patterns[style]);
    }
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

  const handleCategoryClick = (categoryId: string) => {
    hapticFeedback('light');
    navigate(`/dna/${categoryId}`);
  };

  const handleCreatePost = () => {
    hapticFeedback('medium');
    navigate('/create-post');
  };

  const handlePostTypeClick = (typeId: string) => {
    hapticFeedback('light');
    navigate(`/dna/create/${typeId}`);
  };

  return (
    <PageTransition>
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
          backgroundColor="bg-gradient-to-b from-neutral-50 to-white"
        >
          <div className="space-y-6 pb-24">
            {/* Hero Stats Section */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="pt-4"
            >
              <DNAStatsCard
                mainStat={{
                  value: 95,
                  label: 'Your Compatibility Profile'
                }}
                gradient="default"
                className="min-h-[140px] relative"
              />
            </motion.div>

            {/* Categories Section */}
            <div className="space-y-3">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <DNACategoryCard
                      category={category.category}
                      categoryId={category.id}
                      icon={<Icon className="w-6 h-6" />}
                      completion={category.completion}
                      rarity={category.rarity}
                      percentile={category.percentile}
                      onClick={() => handleCategoryClick(category.id)}
                      className="min-h-[80px]"
                    />
                  </motion.div>
                );
              })}
            </div>

            {/* Build DNA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8 space-y-5"
            >
              {/* Section Header */}
              <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
                <span className="text-2xl">🧬</span>
                Build Your DNA Profile
              </h2>

              {/* Info Card */}
              <InfoCard
                variant="highlight"
                icon={<span className="text-xl">💡</span>}
                title="How to Improve Your Profile"
                description="Share your thoughts, photos, and videos! Our MMEngine AI analyzes your content to understand you better."
                className="border-2 border-primary-gold/30"
              />

              {/* Stats Display */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-sm">
                <div className="grid grid-cols-3 gap-4 divide-x divide-neutral-200">
                  {/* Posts Shared */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.7, type: 'spring' }}
                      className="text-3xl font-bold text-primary-forest mb-1"
                    >
                      23
                    </motion.div>
                    <p className="text-xs text-neutral-600">Posts Shared</p>
                  </div>

                  {/* Insights Gained */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8, type: 'spring' }}
                      className="text-3xl font-bold text-primary-forest mb-1"
                    >
                      142
                    </motion.div>
                    <p className="text-xs text-neutral-600">Insights Gained</p>
                  </div>

                  {/* This Week */}
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.9, type: 'spring' }}
                      className="text-3xl font-bold text-semantic-success mb-1"
                    >
                      +8%
                    </motion.div>
                    <p className="text-xs text-neutral-600">This Week</p>
                  </div>
                </div>
              </div>

              {/* Create Post CTA - Hero Button */}
              <motion.button
                onClick={handleCreatePost}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  'w-full min-h-[80px] rounded-[20px]',
                  'bg-gradient-to-r from-primary-forest to-[#4A8B8C]',
                  'shadow-[0_8px_24px_rgba(10,58,46,0.3)]',
                  'hover:shadow-[0_12px_32px_rgba(10,58,46,0.4)]',
                  'transition-all duration-300',
                  'flex items-center gap-4 px-6',
                  'my-6'
                )}
              >
                {/* Icon Circle */}
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0"
                >
                  <Upload className="w-7 h-7 text-white" />
                </motion.div>

                {/* Content */}
                <div className="flex-1 text-left">
                  <p className="text-lg font-bold text-white mb-0.5">
                    Share Something
                  </p>
                  <p className="text-sm text-white/85">
                    Share to enhance your DNA
                  </p>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-8 h-8 text-white flex-shrink-0" />
              </motion.button>

              {/* Post Types Grid */}
              <div className="grid grid-cols-3 gap-3 xs:gap-3">
                {postTypes.map((type, index) => {
                  const Icon = type.icon;
                  return (
                    <motion.button
                      key={type.id}
                      onClick={() => handlePostTypeClick(type.id)}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className={cn(
                        'min-h-[100px] bg-white rounded-2xl',
                        'border-2 border-neutral-200',
                        'hover:border-primary-forest',
                        'transition-all duration-200',
                        'flex flex-col items-center justify-center gap-2',
                        'p-5',
                        'touch-feedback'
                      )}
                    >
                      <span className="text-4xl">{type.emoji}</span>
                      <p className="text-sm font-semibold text-neutral-900">
                        {type.label}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </ScreenContainer>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    </PageTransition>
  );
}
