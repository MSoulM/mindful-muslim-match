import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { InfoCard } from '@/components/ui/Cards/InfoCard';
import { ChaiChatRecommendation } from '@/components/chaichat/ChaiChatRecommendation';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const ChaiChatDetailScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual data fetch
  const chatData = {
    name: 'Sarah',
    age: 28,
    occupation: 'Doctor',
    location: 'London',
    distance: '2.3mi',
    avatar: '👩‍🦰',
    compatibility: 95,
    messageCount: 23,
    topicCount: 4,
    duration: '18 min',
  };

  const topics = [
    {
      id: '1',
      topic: 'Family Values & Structure',
      alignment: 'aligned' as const,
      score: 98,
      yourView: 'Ahmed values close family bonds and wants 2-3 children. He sees family as the foundation of a meaningful life and prioritizes quality time with loved ones.',
      theirView: 'Sarah also prioritizes family and envisions 2-3 children. She believes in maintaining strong family connections while building a career in medicine.',
    },
    {
      id: '2',
      topic: 'Career & Ambitions',
      alignment: 'aligned' as const,
      score: 94,
      yourView: 'Ahmed is ambitious in his tech career but values work-life balance. He wants a partner who understands professional dedication while prioritizing family time.',
      theirView: 'Sarah is dedicated to her medical career but equally committed to family life. She appreciates partners who understand demanding careers while maintaining balance.',
    },
    {
      id: '3',
      topic: 'Communication Style',
      alignment: 'exploring' as const,
      score: 87,
      yourView: 'Ahmed prefers direct, honest communication and believes in addressing issues promptly. He values emotional intelligence and active listening.',
      theirView: 'Sarah values thoughtful communication and sometimes needs time to process before discussing sensitive topics. She appreciates patience and understanding.',
    },
    {
      id: '4',
      topic: 'Lifestyle Preferences',
      alignment: 'aligned' as const,
      score: 96,
      yourView: 'Ahmed enjoys an active lifestyle with hiking and sports, balanced with quiet evenings at home. He values health and wellness as a couple.',
      theirView: 'Sarah maintains an active lifestyle despite her demanding schedule. She loves outdoor activities and values a partner who shares her wellness mindset.',
    },
  ];

  const handleAccept = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      navigate('/messages');
    }, 1000);
  };

  const handleContinueChat = () => {
    // Request more conversation
    console.log('Continue ChaiChat');
  };

  const handleDecline = () => {
    navigate('/chaichat');
  };

  return (
    <div className="relative min-h-screen bg-neutral-50">
      <TopBar
        variant="back"
        title={`ChaiChat with ${chatData.name}`}
        onBackClick={() => navigate('/chaichat')}
      />
      
      <ScreenContainer
        hasTopBar
        hasBottomNav={false}
        padding={false}
        scrollable
      >
        {/* Match Header (Hero Section) */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-gradient-to-br from-[#667eea] to-[#764ba2] rounded-b-3xl px-5 pt-6 pb-20 text-white"
          style={{
            marginTop: 'calc(56px + env(safe-area-inset-top))',
          }}
        >
          {/* Avatar */}
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-18 h-18 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 text-4xl shadow-lg">
              {chatData.avatar}
            </div>
            
            {/* Name */}
            <h1 className="text-3xl font-bold mb-2 drop-shadow-md">
              {chatData.name}, {chatData.age}
            </h1>
            
            {/* Details */}
            <p className="text-[15px] text-white/90 drop-shadow">
              {chatData.occupation} • {chatData.location} • {chatData.distance}
            </p>
          </div>

          {/* Compatibility Score Card (Overlay) */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md rounded-2xl px-8 py-4 shadow-xl border border-white/30 min-w-[160px]"
          >
            <div className="text-center">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl font-bold mb-1"
              >
                {chatData.compatibility}%
              </motion.div>
              <div className="text-sm text-white/90">Compatibility</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Content with Padding */}
        <div className="px-5 pb-32">
          {/* Conversation Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="mt-12 mb-6"
          >
            <InfoCard
              variant="default"
              icon={<span className="text-2xl">💬</span>}
              title="ChaiChat Complete"
              description={`Your agents had a thoughtful ${chatData.messageCount}-message conversation exploring compatibility across ${chatData.topicCount} key topics.`}
              className="shadow-md"
            />
            
            {/* Stats Row */}
            <div className="flex gap-3 mt-3 justify-center">
              <div className="bg-neutral-100 rounded-full px-4 py-2">
                <span className="text-sm font-semibold text-primary-forest">
                  {chatData.messageCount} messages
                </span>
              </div>
              <div className="bg-neutral-100 rounded-full px-4 py-2">
                <span className="text-sm font-semibold text-primary-forest">
                  {chatData.topicCount} topics
                </span>
              </div>
              <div className="bg-neutral-100 rounded-full px-4 py-2">
                <span className="text-sm font-semibold text-primary-forest">
                  {chatData.duration}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Conversation Topics Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <h2 className="text-lg font-bold text-neutral-900 mb-4">
              Conversation Highlights
            </h2>

            <div className="space-y-4">
              {topics.map((topicItem, index) => (
                <motion.div
                  key={topicItem.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.45 + index * 0.05 }}
                >
                  <div className="bg-white rounded-xl p-4 shadow-sm border border-neutral-200">
                    {/* Topic Header */}
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-base font-bold text-neutral-900 flex-1">
                        {topicItem.topic}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'text-xs font-semibold px-2 py-1 rounded-full',
                          topicItem.alignment === 'aligned' 
                            ? 'bg-semantic-success/10 text-semantic-success'
                            : 'bg-semantic-info/10 text-semantic-info'
                        )}>
                          {topicItem.score}% Match
                        </span>
                        <span className="text-xs text-neutral-500">
                          {index + 1} of {topics.length}
                        </span>
                      </div>
                    </div>

                    {/* Your Agent Says */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">🤖</span>
                        <span className="text-xs font-semibold text-neutral-600">
                          Your MMAgent
                        </span>
                      </div>
                      <div className="bg-neutral-50 rounded-lg p-3">
                        <p className="text-sm text-neutral-700 leading-relaxed">
                          {topicItem.yourView}
                        </p>
                      </div>
                    </div>

                    {/* Their Agent Says */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">🤖</span>
                        <span className="text-xs font-semibold text-neutral-600">
                          Sarah's Agent
                        </span>
                      </div>
                      <div className="bg-primary-forest/5 rounded-lg p-3">
                        <p className="text-sm text-neutral-700 leading-relaxed">
                          {topicItem.theirView}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Agent Recommendation */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.65 }}
            className="mt-6"
          >
            <ChaiChatRecommendation
              type="positive"
              title="My Recommendation"
              message="This is an exceptional match! Strong alignment in core values with complementary communication styles. Minor differences in conflict resolution add growth potential. I highly recommend connecting with Sarah."
              confidence={95}
            />
          </motion.div>
        </div>
      </ScreenContainer>

      {/* Decision Buttons (Sticky Bottom) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.7 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-5 py-5 shadow-lg"
        style={{
          paddingBottom: 'calc(20px + env(safe-area-inset-bottom))',
        }}
      >
        <div className="space-y-3 max-w-md mx-auto">
          {/* Primary Action */}
          <Button
            variant="primary"
            size="lg"
            onClick={handleAccept}
            disabled={isLoading}
            className="w-full min-h-[52px] bg-gradient-to-r from-primary-forest to-primary-forest/90 text-white font-bold text-base shadow-md"
          >
            {isLoading ? 'Connecting...' : '✓ Accept & Start Chat'}
          </Button>

          {/* Secondary Action */}
          <Button
            variant="secondary"
            size="lg"
            onClick={handleContinueChat}
            className="w-full min-h-[48px] border-2 border-primary-forest text-primary-forest font-semibold"
          >
            💬 Continue ChaiChat Please
          </Button>

          {/* Defer Action */}
          <Button
            variant="ghost"
            size="lg"
            onClick={handleDecline}
            className="w-full min-h-[48px] border-2 border-neutral-300 text-neutral-600"
          >
            ✗ Not Now
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default ChaiChatDetailScreen;
