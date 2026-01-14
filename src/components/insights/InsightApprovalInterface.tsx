import { useState, useEffect, useMemo, forwardRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo, AnimatePresence } from 'framer-motion';
import { ThumbsUp, ThumbsDown, RotateCcw, Info, Trophy, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { UserInsight } from '@/services/api/insights';
import { useInsights } from '@/hooks/useInsights';
import { LoadingSpinner } from '@/components/utils/LoadingSpinner';

export interface Insight {
  id: string;
  category: string;
  categoryColor: string;
  confidence: number;
  title: string;
  description: string;
  sourceQuote: string;
}

interface InsightApprovalInterfaceProps {
  insights?: UserInsight[];
  onApprove?: (insightId: string) => void;
  onReject?: (insightId: string) => void;
  onComplete?: () => void;
  className?: string;
  useApi?: boolean;
  pendingInsights?: UserInsight[];
  progress?: any;
  loading?: boolean;
  approveInsight?: (insightId: string) => Promise<any>;
  rejectInsight?: (insightId: string) => Promise<any>;
}

const CATEGORY_COLORS: Record<string, string> = {
  values: 'bg-teal-600 text-teal-600',
  personality: 'bg-purple-600 text-purple-600',
  lifestyle: 'bg-blue-600 text-blue-600',
  interests: 'bg-red-600 text-red-600',
  family: 'bg-green-600 text-green-600',
};

function convertUserInsightToInsight(ui: UserInsight): Insight {
  return {
    id: ui.id,
    category: ui.insight_category.charAt(0).toUpperCase() + ui.insight_category.slice(1),
    categoryColor: CATEGORY_COLORS[ui.insight_category] || 'bg-gray-600 text-gray-600',
    confidence: ui.confidence_score,
    title: ui.title,
    description: ui.description,
    sourceQuote: ui.source_quote || '',
  };
}

export const InsightApprovalInterface = ({
  insights: propInsights,
  onApprove: propOnApprove,
  onReject: propOnReject,
  onComplete,
  className,
  useApi = true,
  pendingInsights: propPendingInsights,
  progress: propProgress,
  loading: propLoading,
  approveInsight: propApproveInsight,
  rejectInsight: propRejectInsight,
}: InsightApprovalInterfaceProps) => {
  const apiInsights = useApi && !propPendingInsights ? useInsights() : null;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const pendingInsightsToUse = useApi 
    ? (propPendingInsights || apiInsights?.pendingInsights || [])
    : [];
  const progressToUse = useApi 
    ? (propProgress || apiInsights?.progress)
    : null;
  const loadingToUse = useApi 
    ? (propLoading !== undefined ? propLoading : (apiInsights?.loading || false))
    : false;
  const approveInsightFn = useApi 
    ? (propApproveInsight || apiInsights?.approveInsight)
    : propOnApprove;
  const rejectInsightFn = useApi 
    ? (propRejectInsight || apiInsights?.rejectInsight)
    : propOnReject;

  const insights = useMemo(() => {
    if (useApi && pendingInsightsToUse.length > 0) {
      return pendingInsightsToUse.map(convertUserInsightToInsight);
    }
    if (propInsights) {
      return propInsights.map(convertUserInsightToInsight);
    }
    return [];
  }, [useApi, pendingInsightsToUse, propInsights]);

  useEffect(() => {
    if (insights.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= insights.length) {
      setCurrentIndex(0);
    }
  }, [insights.length, currentIndex]);

  useEffect(() => {
    const insightIds = insights.map(i => i.id);
    if (insightIds.length > 0) {
      const currentInsightId = insights[currentIndex]?.id;
      if (!currentInsightId || !insightIds.includes(currentInsightId)) {
        setCurrentIndex(0);
      }
    }
  }, [insights.map(i => i.id).join(','), currentIndex, insights]);

  const progress = progressToUse;
  const points = progress?.total_points || 0;
  const reviewedCount = progress?.insights_reviewed || 0;
  const totalInsights = insights.length;
  const progressPercentage = totalInsights > 0 ? ((reviewedCount / (reviewedCount + totalInsights)) * 100) : 0;
  const remaining = Math.max(0, totalInsights - currentIndex - 1);

  const currentInsight = insights[currentIndex];
  const isLoading = loadingToUse;

  const handleApprove = async (insightId: string) => {
    try {
      if (useApi && approveInsightFn) {
        await approveInsightFn(insightId);
      } else {
        propOnApprove?.(insightId);
      }
      
      if ('vibrate' in navigator) navigator.vibrate(10);
      
      const updatedProgress = useApi ? (propProgress || apiInsights?.progress) : progress;
      const newProgress = updatedProgress ? ((updatedProgress.insights_reviewed + 1) / (updatedProgress.insights_reviewed + totalInsights)) * 100 : 0;
      if (newProgress >= 25 && !updatedProgress?.milestone_25 ||
          newProgress >= 50 && !updatedProgress?.milestone_50 ||
          newProgress >= 75 && !updatedProgress?.milestone_75 ||
          newProgress >= 100 && !updatedProgress?.milestone_100) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
      }

      setCurrentIndex(0);
    } catch (error) {
      console.error('Error approving insight:', error);
    }
  };

  const handleReject = async (insightId: string) => {
    try {
      if (useApi && rejectInsightFn) {
        await rejectInsightFn(insightId);
      } else {
        propOnReject?.(insightId);
      }
      
      if ('vibrate' in navigator) navigator.vibrate([10, 5, 10]);

      setCurrentIndex(0);
    } catch (error) {
      console.error('Error rejecting insight:', error);
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  console.log('currentInsight', currentInsight);
  console.log('insights', insights);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center h-[500px] bg-white rounded-xl", className)}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!currentInsight && insights.length === 0) {
    return (
      <div className={cn("bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 text-center", className)}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          <Trophy className="w-20 h-20 mx-auto mb-4 text-yellow-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-foreground mb-2">All Done!</h3>
        <p className="text-muted-foreground mb-4">
          You've reviewed all {insights.length} insights
        </p>
        <div className="text-4xl font-bold text-green-600 mb-2">
          {points || 0} Points
        </div>
        <p className="text-sm text-muted-foreground">Total earned</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Header Stats */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            <span className="text-lg font-bold text-foreground">{points} Points</span>
          </div>
          <div className="text-sm text-muted-foreground">
            {reviewedCount} / {reviewedCount + totalInsights} reviewed
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>{remaining} remaining</span>
          <span>{Math.round(progressPercentage)}% complete</span>
        </div>
      </div>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm rounded-xl"
          >
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-full p-8 shadow-2xl"
            >
              <Star className="w-16 h-16 text-yellow-500" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Stack */}
      <div className="relative h-[500px]">
        <AnimatePresence mode="wait">
          {currentInsight && (
            <SwipeableInsightCard
              key={`${currentInsight.id}-${currentIndex}`}
              insight={currentInsight}
              onApprove={() => handleApprove(currentInsight.id)}
              onReject={() => handleReject(currentInsight.id)}
              stackPosition={0}
            />
          )}
          
          {/* Preview next card */}
          {insights[currentIndex + 1] && (
            <motion.div
              key={`preview-${insights[currentIndex + 1].id}`}
              initial={{ scale: 0.95, y: 10, opacity: 0.5 }}
              animate={{ scale: 0.95, y: 10, opacity: 0.5 }}
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: -1 }}
            >
              <InsightCardContent insight={insights[currentIndex + 1]} isPreview />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="lg"
          onClick={handleUndo}
          disabled={currentIndex === 0}
          className="min-h-[56px] min-w-[56px] rounded-full border-2"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => currentInsight && handleReject(currentInsight.id)}
          disabled={!currentInsight}
          className="min-h-[72px] min-w-[72px] rounded-full border-4 border-red-300 hover:bg-red-50 hover:border-red-400"
        >
          <ThumbsDown className="w-8 h-8 text-red-600" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          onClick={() => currentInsight && handleApprove(currentInsight.id)}
          disabled={!currentInsight}
          className="min-h-[72px] min-w-[72px] rounded-full border-4 border-green-300 hover:bg-green-50 hover:border-green-400"
        >
          <ThumbsUp className="w-8 h-8 text-green-600" />
        </Button>

        <Button
          variant="outline"
          size="lg"
          className="min-h-[56px] min-w-[56px] rounded-full border-2"
        >
          <Info className="w-5 h-5" />
        </Button>
      </div>

      {/* Help Text */}
      <p className="text-center text-sm text-muted-foreground mt-4">
        Swipe right or tap <ThumbsUp className="inline w-4 h-4" /> to approve •
        Swipe left or tap <ThumbsDown className="inline w-4 h-4" /> to reject
      </p>
    </div>
  );
};

// ==================== SWIPEABLE CARD ====================

interface SwipeableInsightCardProps {
  insight: Insight;
  onApprove: () => void;
  onReject: () => void;
  stackPosition: number;
}

const SwipeableInsightCard = forwardRef<HTMLDivElement, SwipeableInsightCardProps>(({
  insight,
  onApprove,
  onReject,
  stackPosition
}, ref) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 120;
    
    if (info.offset.x > swipeThreshold) {
      onApprove();
    } else if (info.offset.x < -swipeThreshold) {
      onReject();
    } else {
      x.set(0);
    }
  };

  return (
    <motion.div
      ref={ref}
      drag="x"
      dragConstraints={{ left: -300, right: 300 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      style={{ x, rotate, opacity }}
      initial={{ scale: 1, y: 0, opacity: 1 }}
      animate={{ scale: 1 - stackPosition * 0.05, y: stackPosition * 10, opacity: 1 }}
      exit={{ 
        x: x.get() > 0 ? 500 : -500,
        opacity: 0,
        scale: 0.8,
        transition: { duration: 0.3 }
      }}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
    >
      <InsightCardContent insight={insight} swipeX={x} />
    </motion.div>
  );
});

SwipeableInsightCard.displayName = 'SwipeableInsightCard';

// ==================== CARD CONTENT ====================

interface InsightCardContentProps {
  insight: Insight;
  swipeX?: any;
  isPreview?: boolean;
}

const InsightCardContent = ({ insight, swipeX, isPreview = false }: InsightCardContentProps) => {
  const approveOpacity = swipeX ? useTransform(swipeX, [0, 100], [0, 1]) : undefined;
  const rejectOpacity = swipeX ? useTransform(swipeX, [-100, 0], [1, 0]) : undefined;

  return (
    <div className={cn(
      "relative bg-white rounded-xl shadow-xl border-2 border-border overflow-hidden h-full",
      isPreview && "opacity-50"
    )}>
      {/* Swipe Indicators */}
      {swipeX && (
        <>
          <motion.div
            style={{ opacity: approveOpacity }}
            className="absolute top-8 right-8 z-10 bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-lg rotate-12 shadow-lg"
          >
            APPROVE
          </motion.div>
          <motion.div
            style={{ opacity: rejectOpacity }}
            className="absolute top-8 left-8 z-10 bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-lg -rotate-12 shadow-lg"
          >
            REJECT
          </motion.div>
        </>
      )}

      {/* Card Content */}
      <div className="p-6 h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <Badge
            variant="secondary"
            className={cn('font-semibold', insight.categoryColor.split(' ')[1])}
          >
            {insight.category}
          </Badge>
          <span className="text-lg font-bold text-primary">
            {insight.confidence}% confidence
          </span>
        </div>

        <h3 className="text-2xl font-bold text-foreground mb-3">
          {insight.title}
        </h3>

        <p className="text-base text-muted-foreground mb-6 leading-relaxed">
          {insight.description}
        </p>

        <div className="bg-muted/50 rounded-lg p-4 border-l-4 border-primary">
          <div className="text-xs font-semibold text-muted-foreground mb-2">
            Based on your content:
          </div>
          <p className="text-sm text-foreground italic">
            "{insight.sourceQuote}"
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            This insight will help match you with compatible profiles
          </p>
        </div>
      </div>
    </div>
  );
};
