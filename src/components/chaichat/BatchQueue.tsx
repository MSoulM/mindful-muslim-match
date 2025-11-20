import { motion } from 'framer-motion';
import { Clock, Users, TrendingUp, Zap, Crown, Star, DollarSign, ChevronRight } from 'lucide-react';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface PriorityTier {
  tier: 'Immediate' | 'Priority' | 'Standard';
  userType: 'VIP' | 'Premium' | 'Free';
  count: number;
  eta: string;
  color: 'gold' | 'purple' | 'blue';
}

interface BatchQueueData {
  nextBatch: {
    scheduledTime: string;
    countdown: string;
    totalQueued: number;
    estimatedSavings: string;
  };
  priorityTiers: PriorityTier[];
  userPosition?: number;
  userTier?: 'Immediate' | 'Priority' | 'Standard';
  currentStage?: 'collection' | 'filtering' | 'analysis' | 'delivery';
}

interface BatchQueueProps {
  data?: BatchQueueData;
  className?: string;
}

const defaultData: BatchQueueData = {
  nextBatch: {
    scheduledTime: 'Monday 2:00 AM UTC',
    countdown: '2 days 14 hours 32 minutes',
    totalQueued: 247,
    estimatedSavings: '$82.35',
  },
  priorityTiers: [
    {
      tier: 'Immediate',
      userType: 'VIP',
      count: 3,
      eta: '< 1 minute',
      color: 'gold',
    },
    {
      tier: 'Priority',
      userType: 'Premium',
      count: 44,
      eta: 'Within 24 hours',
      color: 'purple',
    },
    {
      tier: 'Standard',
      userType: 'Free',
      count: 200,
      eta: 'Monday batch',
      color: 'blue',
    },
  ],
  userPosition: 47,
  userTier: 'Priority',
  currentStage: 'collection',
};

const getTierIcon = (tier: string) => {
  switch (tier) {
    case 'Immediate':
      return Crown;
    case 'Priority':
      return Star;
    case 'Standard':
      return Users;
    default:
      return Users;
  }
};

const getTierColors = (color: string) => {
  switch (color) {
    case 'gold':
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-600',
        dot: 'bg-yellow-500',
      };
    case 'purple':
      return {
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        text: 'text-purple-600',
        dot: 'bg-purple-500',
      };
    case 'blue':
      return {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        text: 'text-blue-600',
        dot: 'bg-blue-500',
      };
    default:
      return {
        bg: 'bg-muted',
        border: 'border-border',
        text: 'text-muted-foreground',
        dot: 'bg-muted-foreground',
      };
  }
};

const processingStages = [
  { id: 'collection', label: 'Collection', icon: Users },
  { id: 'filtering', label: 'Filtering', icon: TrendingUp },
  { id: 'analysis', label: 'Analysis', icon: Zap },
  { id: 'delivery', label: 'Delivery', icon: ChevronRight },
];

export const BatchQueue = ({ data = defaultData, className }: BatchQueueProps) => {
  const [countdown, setCountdown] = useState(data.nextBatch.countdown);

  // Simulate countdown (in real app, calculate from scheduledTime)
  useEffect(() => {
    const interval = setInterval(() => {
      // This is a mock - in real app, calculate actual time difference
      setCountdown(data.nextBatch.countdown);
    }, 1000);

    return () => clearInterval(interval);
  }, [data.nextBatch.countdown]);

  // Calculate progress ring percentage (mock - based on day of week)
  const timeProgress = 35; // Mock value

  return (
    <div className={cn('space-y-6', className)}>
      {/* Batch Countdown Hero */}
      <BaseCard className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Next batch processing</span>
          </div>

          {/* Countdown Ring */}
          <motion.div
            className="relative w-48 h-48"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="85"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
                fill="none"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="85"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: '534', strokeDashoffset: '534' }}
                animate={{
                  strokeDashoffset: 534 - (534 * timeProgress) / 100,
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-3xl font-bold text-foreground">{countdown}</div>
              <div className="text-xs text-muted-foreground mt-1">until ready</div>
            </div>
          </motion.div>

          <div className="space-y-1">
            <div className="text-sm font-semibold text-foreground">
              {data.nextBatch.scheduledTime}
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-primary h-auto py-1">
              Convert to my timezone
            </Button>
          </div>

          <div className="flex items-center gap-6 text-sm pt-2">
            <div className="text-center">
              <div className="font-bold text-foreground">{data.nextBatch.totalQueued}</div>
              <div className="text-xs text-muted-foreground">In Queue</div>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="text-center">
              <div className="font-bold text-semantic-success">{data.nextBatch.estimatedSavings}</div>
              <div className="text-xs text-muted-foreground">Batch Savings</div>
            </div>
          </div>
        </div>
      </BaseCard>

      {/* Queue Position Indicator */}
      {data.userPosition && data.userTier && (
        <BaseCard className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Your position</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-foreground">#{data.userPosition}</span>
                <span className="text-sm text-muted-foreground">in {data.userTier} queue</span>
              </div>
              <div className="text-xs text-muted-foreground">
                Estimated: {data.priorityTiers.find(t => t.tier === data.userTier)?.eta}
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Zap className="w-4 h-4" />
              Upgrade
            </Button>
          </div>
        </BaseCard>
      )}

      {/* Priority Lanes Visualization */}
      <BaseCard className="p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Processing Lanes
        </h3>

        <div className="space-y-3">
          {data.priorityTiers.map((tier, index) => {
            const TierIcon = getTierIcon(tier.tier);
            const colors = getTierColors(tier.color);

            return (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <div
                  className={cn(
                    'p-4 rounded-lg border-2 transition-all',
                    colors.bg,
                    colors.border,
                    data.userTier === tier.tier && 'ring-2 ring-primary ring-offset-2'
                  )}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', colors.bg)}>
                        <TierIcon className={cn('w-5 h-5', colors.text)} />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{tier.tier}</div>
                        <div className="text-xs text-muted-foreground">{tier.userType} users</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground">{tier.count}</div>
                      <div className="text-xs text-muted-foreground">queued</div>
                    </div>
                  </div>

                  {/* Lane visualization */}
                  <div className="relative h-8 bg-background/50 rounded-full overflow-hidden">
                    <div className="absolute inset-0 flex items-center px-2">
                      {/* Animated dots moving through lane */}
                      {[...Array(Math.min(tier.count, 5))].map((_, i) => (
                        <motion.div
                          key={i}
                          className={cn('w-2 h-2 rounded-full', colors.dot)}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{
                            x: [0, 200, 400],
                            opacity: [0, 1, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.5,
                            ease: 'linear',
                          }}
                        />
                      ))}
                    </div>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                      {tier.eta}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </BaseCard>

      {/* Savings Calculator */}
      <BaseCard className="p-6 bg-gradient-to-br from-semantic-success/5 to-semantic-success/10 border-semantic-success/20">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-semantic-success">
            <DollarSign className="w-5 h-5" />
            <h3 className="text-sm font-semibold">Batch Processing Saves 30%</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-background rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Immediate</div>
              <div className="text-lg font-bold text-muted-foreground line-through">$0.035</div>
            </div>
            <div className="p-3 bg-semantic-success/10 rounded-lg border border-semantic-success/30">
              <div className="text-xs text-semantic-success mb-1">Batch Price</div>
              <div className="text-lg font-bold text-semantic-success">$0.024</div>
            </div>
          </div>

          <div className="text-center pt-2 border-t border-semantic-success/20">
            <div className="text-xs text-muted-foreground">You save by waiting</div>
            <div className="text-2xl font-bold text-semantic-success">$0.011</div>
            <div className="text-xs text-muted-foreground mt-1">per analysis</div>
          </div>
        </div>
      </BaseCard>

      {/* Processing Timeline */}
      <BaseCard className="p-6">
        <h3 className="text-sm font-semibold text-foreground mb-6">Processing Stages</h3>

        {/* Desktop: Horizontal timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-6 left-0 right-0 h-1 bg-muted">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: '25%' }} // Mock progress
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>

            {/* Stage markers */}
            <div className="relative flex items-start justify-between">
              {processingStages.map((stage, index) => {
                const StageIcon = stage.icon;
                const isActive = data.currentStage === stage.id;
                const isPast = processingStages.findIndex(s => s.id === data.currentStage) > index;

                return (
                  <div key={stage.id} className="flex flex-col items-center space-y-2 flex-1">
                    <motion.div
                      className={cn(
                        'w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all',
                        isActive
                          ? 'bg-primary border-primary text-primary-foreground'
                          : isPast
                          ? 'bg-primary/20 border-primary text-primary'
                          : 'bg-background border-muted text-muted-foreground'
                      )}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <StageIcon className="w-5 h-5" />
                    </motion.div>
                    <div className="text-xs font-medium text-center">{stage.label}</div>
                    {isActive && (
                      <motion.div
                        className="text-xs text-primary font-semibold"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                      >
                        In Progress
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical timeline */}
        <div className="md:hidden space-y-4">
          {processingStages.map((stage, index) => {
            const StageIcon = stage.icon;
            const isActive = data.currentStage === stage.id;
            const isPast = processingStages.findIndex(s => s.id === data.currentStage) > index;

            return (
              <motion.div
                key={stage.id}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 flex-shrink-0',
                    isActive
                      ? 'bg-primary border-primary text-primary-foreground'
                      : isPast
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-background border-muted text-muted-foreground'
                  )}
                >
                  <StageIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 pt-2">
                  <div className="font-medium text-sm text-foreground">{stage.label}</div>
                  {isActive && (
                    <div className="text-xs text-primary font-semibold mt-1">In Progress</div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </BaseCard>
    </div>
  );
};
