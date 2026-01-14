import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { AgentMessage } from '@/components/chat/AgentMessage';
import { InfoCard } from '@/components/ui/Cards/InfoCard';
import { FeatureCard } from '@/components/ui/Cards/FeatureCard';
import { Button } from '@/components/ui/CustomButton';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { InsightApprovalInterface } from '@/components/insights/InsightApprovalInterface';
import { useInsights } from '@/hooks/useInsights';
import { LoadingSpinner } from '@/components/utils/LoadingSpinner';

interface Insight {
  id: string;
  category: string;
  categoryColor: string;
  confidence: number;
  title: string;
  description: string;
  sourceQuote: string;
}

const InsightsScreen = () => {
  const navigate = useNavigate();
  const [showAllInsights, setShowAllInsights] = useState(false);
  const [expandedExplanation, setExpandedExplanation] = useState(false);
  const [useSwipeInterface, setUseSwipeInterface] = useState(true);
  const { 
    pendingInsights, 
    approvedInsights, 
    progress, 
    loading, 
    approveInsight, 
    rejectInsight, 
    refetchPending, 
    refetchApproved 
  } = useInsights();

  const mockInsights: Insight[] = [
    {
      id: '1',
      category: 'Values',
      categoryColor: 'bg-primary-gold text-primary-gold',
      confidence: 92,
      title: 'Spiritual Modernist',
      description: 'You blend traditional faith with contemporary perspectives',
      sourceQuote: 'I believe in the wisdom of tradition while embracing modern understanding...',
    },
    {
      id: '2',
      category: 'Interests',
      categoryColor: 'bg-primary-pink text-primary-pink',
      confidence: 88,
      title: 'Creative Technologist',
      description: 'You enjoy both artistic expression and technical innovation',
      sourceQuote: 'Working on my digital art project that combines coding and design...',
    },
    {
      id: '3',
      category: 'Personality',
      categoryColor: 'bg-primary-forest text-primary-forest',
      confidence: 85,
      title: 'Empathetic Leader',
      description: 'You guide others with understanding and patience',
      sourceQuote: 'In my team meetings, I always ensure everyone feels heard and valued...',
    },
    {
      id: '4',
      category: 'Lifestyle',
      categoryColor: 'bg-semantic-info text-semantic-info',
      confidence: 90,
      title: 'Balanced Achiever',
      description: 'You maintain harmony between ambition and wellbeing',
      sourceQuote: 'I make sure to schedule workout time even during busy weeks...',
    },
    {
      id: '5',
      category: 'Goals',
      categoryColor: 'bg-semantic-success text-semantic-success',
      confidence: 87,
      title: 'Community Builder',
      description: 'You envision creating positive impact in your community',
      sourceQuote: 'My dream is to start a mentorship program for young professionals...',
    },
  ];

  const displayedInsights = showAllInsights ? mockInsights : mockInsights.slice(0, 3);
  
  const pendingCount = pendingInsights.length;
  const approvedCount = approvedInsights.length > 0 ? approvedInsights.length : (progress?.insights_approved || 0);

  const handleAgree = async (insightId: string) => {
    try {
      await approveInsight(insightId);
      await refetchPending();
      await refetchApproved();
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    } catch (error) {
      console.error('Error approving insight:', error);
    }
  };

  const handleDisagree = async (insightId: string) => {
    try {
      await rejectInsight(insightId);
      await refetchPending();
      if ('vibrate' in navigator) {
        navigator.vibrate([10, 5, 10]);
      }
    } catch (error) {
      console.error('Error rejecting insight:', error);
    }
  };

  return (
    <div className="relative min-h-screen bg-neutral-50">
      <TopBar
        variant="back"
        title="My Insights"
        onBackClick={() => navigate('/myagent')}
      />
      
      <ScreenContainer
        hasTopBar
        padding
        scrollable
      >
        {/* Explanation Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-5"
        >
          <AgentMessage
            avatar="🧠"
            title="How I Learn About You"
            message="I analyze your posts, messages, and interactions to understand you better. Review and confirm these insights to improve your matching accuracy."
            variant="default"
            className={cn(
              'shadow-sm transition-all',
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
              <>Read more <ChevronDown className="w-4 h-4" /></>
            )}
          </button>
        </motion.div>

        {/* Stats Overview Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-white rounded-xl p-5 shadow-sm border-2 border-primary-gold/20">
            <div className="grid grid-cols-2 divide-x divide-neutral-200">
              {/* Pending */}
              <div className="pr-4">
                <div className="text-3xl font-bold text-semantic-warning">{pendingCount}</div>
                <div className="text-sm text-neutral-600 mt-1">Pending Review</div>
              </div>
              
              {/* Confirmed */}
              <div className="pl-4">
                <div className="text-3xl font-bold text-semantic-success">{approvedCount}</div>
                <div className="text-sm text-neutral-600 mt-1">Confirmed</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pending Review Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-neutral-900">
              Pending Your Review ({pendingCount})
            </h2>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setUseSwipeInterface(!useSwipeInterface)}
            >
              {useSwipeInterface ? 'List View' : 'Swipe View'}
            </Button>
          </div>

          {loading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {!loading && (useSwipeInterface || pendingInsights.length === 0) && (
            <div className="mb-6">
              <InsightApprovalInterface 
                useApi={true}
                pendingInsights={pendingInsights}
                progress={progress}
                loading={loading}
                approveInsight={approveInsight}
                rejectInsight={rejectInsight}
              />
            </div>
          )}

          {!loading && !useSwipeInterface && (

          <div className="space-y-4">
            <AnimatePresence>
              {pendingInsights.map((insight, index) => {
                const categoryColor = {
                  values: 'bg-teal-600 text-teal-600',
                  personality: 'bg-purple-600 text-purple-600',
                  lifestyle: 'bg-blue-600 text-blue-600',
                  interests: 'bg-red-600 text-red-600',
                  family: 'bg-green-600 text-green-600',
                }[insight.insight_category] || 'bg-gray-600 text-gray-600';
                
                return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm border-l-4 border-semantic-warning overflow-hidden"
                >
                  <div className="p-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        variant="secondary"
                        className={cn('font-semibold', categoryColor.split(' ')[1])}
                      >
                        {insight.insight_category.charAt(0).toUpperCase() + insight.insight_category.slice(1)}
                      </Badge>
                      <span className="text-sm font-bold text-primary-forest">
                        {insight.confidence_score}%
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-base font-bold text-neutral-900 mb-2">
                      {insight.title}
                    </h3>
                    <p className="text-sm text-neutral-600 mb-3 leading-relaxed">
                      {insight.description}
                    </p>

                    {/* Source Quote */}
                    {insight.source_quote && (
                      <div className="bg-neutral-100 rounded-lg p-3 mb-4">
                        <div className="text-xs font-semibold text-neutral-500 mb-1">
                          Based on:
                        </div>
                        <p className="text-sm text-neutral-700 italic line-clamp-2">
                          "{insight.source_quote}"
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="md"
                        onClick={() => handleDisagree(insight.id)}
                        className="flex-1 min-h-[44px] border-2 border-semantic-error text-semantic-error hover:bg-semantic-error/10"
                      >
                        ❌ Disagree
                      </Button>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => handleAgree(insight.id)}
                        className="flex-1 min-h-[44px] bg-semantic-success hover:bg-semantic-success/90"
                      >
                        ✓ Agree
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
              })}
            </AnimatePresence>
          </div>
          )}

          {/* Show More/Less Button */}
          {!useSwipeInterface && pendingInsights.length > 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4"
            >
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowAllInsights(!showAllInsights)}
                className="w-full min-h-[44px]"
              >
                {showAllInsights
                  ? 'Show less'
                  : `Show ${pendingInsights.length - 3} more insights`}
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Confirmed Insights Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="mt-8 mb-6"
        >
          <FeatureCard
            icon={<span className="text-2xl">✓</span>}
            title="View Confirmed Insights"
            description={`${approvedCount} insights help match you accurately`}
            onClick={() => navigate('/confirmed-insights')}
            className="bg-gradient-to-br from-semantic-success/5 to-semantic-success/10 border-2 border-semantic-success/20"
          />
        </motion.div>

        {/* Bottom padding */}
        <div className="h-8" />
      </ScreenContainer>
    </div>
  );
};

export default InsightsScreen;
