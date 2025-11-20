import { motion } from 'framer-motion';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Badge } from '@/components/ui/badge';
import { Heart, Home, User, Sparkles, Clock, DollarSign, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  age: number;
  avatar?: string;
}

interface DimensionData {
  score: number;
  weight: number;
  insights: string[];
}

interface UnifiedAnalysisProps {
  matchId: string;
  userA: User;
  userB: User;
  analysis: {
    overallScore: number;
    dimensions: {
      coreValues: DimensionData;
      lifestyle: DimensionData;
      personality: DimensionData;
      interests: DimensionData;
    };
    keyInsights: string[];
    conversationStarters: string[];
    potentialChallenges: string[];
    processingInfo: {
      model: string;
      costCents: number;
      timeMs: number;
      cached: boolean;
    };
  };
}

const dimensionConfig = {
  coreValues: {
    icon: Heart,
    label: 'Core Values & Beliefs',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  lifestyle: {
    icon: Home,
    label: 'Lifestyle & Habits',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
  },
  personality: {
    icon: User,
    label: 'Personality Traits',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  interests: {
    icon: Sparkles,
    label: 'Interests & Hobbies',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
};

export const UnifiedAnalysis = ({ userA, userB, analysis }: UnifiedAnalysisProps) => {
  const { overallScore, dimensions, keyInsights, conversationStarters, potentialChallenges, processingInfo } = analysis;

  return (
    <div className="space-y-4 pb-6">
      {/* Header with Overall Score */}
      <BaseCard className="text-center">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-foreground">
            {userA.name} & {userB.name}
          </h2>
          <div className="flex items-center justify-center gap-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="text-5xl font-bold text-primary"
            >
              {overallScore}%
            </motion.div>
          </div>
          <p className="text-sm text-muted-foreground">Overall Compatibility</p>
        </div>
      </BaseCard>

      {/* Cost Savings Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <Badge variant="secondary" className="gap-2 py-2 px-4">
          <Zap className="w-4 h-4 text-green-600" />
          <span className="text-sm">
            93% more efficient •{' '}
            <span className="font-semibold text-green-600">${(processingInfo.costCents / 100).toFixed(3)}</span>
            {' vs '}
            <span className="line-through text-muted-foreground">$0.14</span>
          </span>
        </Badge>
      </motion.div>

      {/* Four Dimension Cards - 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(dimensions).map(([key, data], index) => {
          const config = dimensionConfig[key as keyof typeof dimensionConfig];
          const Icon = config.icon;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <BaseCard className={cn('border-2', config.borderColor)}>
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn('p-2 rounded-lg', config.bgColor)}>
                        <Icon className={cn('w-5 h-5', config.color)} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{config.label}</h3>
                        <p className="text-xs text-muted-foreground">Weight: {data.weight}%</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn('text-2xl font-bold', config.color)}>{data.score}%</div>
                    </div>
                  </div>

                  {/* Insights */}
                  <div className="space-y-1.5">
                    {data.insights.slice(0, 2).map((insight, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-muted-foreground text-xs mt-0.5">•</span>
                        <p className="text-xs text-muted-foreground flex-1">{insight}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </BaseCard>
            </motion.div>
          );
        })}
      </div>

      {/* Key Insights */}
      {keyInsights.length > 0 && (
        <BaseCard>
          <h3 className="text-md font-semibold text-foreground mb-3">Key Insights</h3>
          <div className="space-y-2">
            {keyInsights.map((insight, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                <p className="text-sm text-foreground flex-1">{insight}</p>
              </div>
            ))}
          </div>
        </BaseCard>
      )}

      {/* Conversation Starters */}
      {conversationStarters.length > 0 && (
        <BaseCard className="bg-primary/5">
          <h3 className="text-md font-semibold text-foreground mb-3">Conversation Starters</h3>
          <div className="space-y-2">
            {conversationStarters.map((starter, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="text-primary text-sm mt-0.5">💬</span>
                <p className="text-sm text-foreground flex-1">"{starter}"</p>
              </div>
            ))}
          </div>
        </BaseCard>
      )}

      {/* Potential Challenges */}
      {potentialChallenges.length > 0 && (
        <BaseCard className="border-amber-200 bg-amber-50/50">
          <h3 className="text-md font-semibold text-foreground mb-3">Areas to Explore Together</h3>
          <div className="space-y-2">
            {potentialChallenges.map((challenge, idx) => (
              <div key={idx} className="flex gap-2">
                <span className="text-amber-600 font-bold">•</span>
                <p className="text-sm text-foreground flex-1">{challenge}</p>
              </div>
            ))}
          </div>
        </BaseCard>
      )}

      {/* Processing Info Bar */}
      <BaseCard className="bg-muted/30">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>{processingInfo.model}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{(processingInfo.timeMs / 1000).toFixed(2)}s</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span>${(processingInfo.costCents / 100).toFixed(3)}</span>
            </div>
          </div>
          <Badge 
            variant={processingInfo.cached ? "default" : "secondary"}
            className="text-xs"
          >
            {processingInfo.cached ? '✓ Cached' : '🔵 Fresh Analysis'}
          </Badge>
        </div>
      </BaseCard>
    </div>
  );
};
