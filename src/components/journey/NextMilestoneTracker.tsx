/**
 * Next Milestone Tracker
 * Shows checklist for advancing to next stage
 */

import { motion } from 'framer-motion';
import { CheckCircle2, Circle, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJourney, STAGE_INFO } from '@/hooks/useJourney';
import { Progress } from '@/components/ui/progress';

const STAGE_ORDER = ['seed', 'sprout', 'growth', 'rooted', 'transcendent'];

export const NextMilestoneTracker = () => {
  const { journeyStatus, loading, getTimeToNextStage } = useJourney();

  if (loading || !journeyStatus) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-6 bg-muted rounded w-48" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded" />
          ))}
        </div>
      </div>
    );
  }

  const currentStageIndex = STAGE_ORDER.indexOf(journeyStatus.current_stage);
  
  // Check if at final stage
  if (currentStageIndex >= STAGE_ORDER.length - 1) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-xl p-6 text-center space-y-3 border border-amber-400/30"
      >
        <Sparkles className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-xl font-bold text-foreground">Journey Complete! 🎉</h3>
        <p className="text-sm text-muted-foreground">
          You've reached the Transcendent Stage. Continue growing and helping others on their journey.
        </p>
      </motion.div>
    );
  }

  const nextStage = STAGE_INFO[STAGE_ORDER[currentStageIndex + 1]];
  const progress = journeyStatus.progress_to_next;
  const timeToNext = getTimeToNextStage();

  // Calculate checklist items
  const checklistItems = [
    {
      label: 'Meaningful shares',
      completed: progress.meaningful_shares,
      required: progress.required_shares,
      isComplete: progress.meaningful_shares >= progress.required_shares,
    },
    {
      label: 'MMAgent conversations',
      completed: progress.mmagent_chats,
      required: progress.required_chats,
      isComplete: progress.mmagent_chats >= progress.required_chats,
    },
  ];

  // Add optional items if they exist
  if (progress.required_conversations && progress.required_conversations > 0) {
    checklistItems.push({
      label: 'Match conversations',
      completed: progress.match_conversations || 0,
      required: progress.required_conversations,
      isComplete: (progress.match_conversations || 0) >= progress.required_conversations,
    });
  }

  const allComplete = checklistItems.every((item) => item.isComplete);
  const totalCompleted = checklistItems.filter((item) => item.isComplete).length;
  const overallProgress = (totalCompleted / checklistItems.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-foreground">Next Milestone</h3>
          <p className="text-sm text-muted-foreground">
            Progress to <span className="font-semibold text-foreground">{nextStage.name}</span>
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-foreground">
            {totalCompleted}/{checklistItems.length}
          </div>
          <div className="text-xs text-muted-foreground">completed</div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="space-y-2">
        <Progress value={overallProgress} className="h-3" />
        <p className="text-xs text-muted-foreground text-center">
          Estimated time: <span className="font-semibold text-foreground">{timeToNext}</span>
        </p>
      </div>

      {/* Checklist */}
      <div className="bg-card rounded-xl border border-border divide-y divide-border">
        {checklistItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4"
          >
            <div className="flex items-center gap-3">
              {/* Checkbox Icon */}
              <div className="flex-shrink-0">
                {item.isComplete ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-success" />
                  </motion.div>
                ) : (
                  <Circle className="w-6 h-6 text-muted-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={cn(
                      'text-sm font-medium',
                      item.isComplete ? 'text-success line-through' : 'text-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      item.isComplete ? 'text-success' : 'text-muted-foreground'
                    )}
                  >
                    {item.completed}/{item.required}
                  </span>
                </div>

                {/* Progress bar for incomplete items */}
                {!item.isComplete && (
                  <Progress
                    value={(item.completed / item.required) * 100}
                    className="h-1.5"
                  />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Celebration or Encouragement */}
      {allComplete ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-lg p-4 border border-emerald-500/20"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-emerald-500 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-foreground">Ready to Advance! 🎉</h4>
              <p className="text-sm text-muted-foreground">
                You've completed all requirements. Your DNA will update shortly to reflect your new stage.
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
          <TrendingUp className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground text-sm">Keep Going!</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Every authentic interaction brings you closer to unlocking more features and deeper connections.
            </p>
          </div>
        </div>
      )}

      {/* Islamic Encouragement */}
      <p className="text-xs text-center text-muted-foreground italic">
        "Indeed, with hardship comes ease" - Quran 94:6
      </p>
    </motion.div>
  );
};
