/**
 * Journey Progress Component
 * Displays 5 journey stages with Islamic Garden theme
 */

import { motion } from 'framer-motion';
import { Sprout, Leaf, TreeDeciduous, TreePine, Sparkles, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJourney, STAGE_INFO } from '@/hooks/useJourney';
import { JourneyStage } from '@/types/journey.types';

const STAGE_ICONS = {
  seed: Sprout,
  sprout: Leaf,
  growth: TreeDeciduous,
  rooted: TreePine,
  transcendent: Sparkles,
};

const STAGE_ORDER: JourneyStage[] = ['seed', 'sprout', 'growth', 'rooted', 'transcendent'];

export const JourneyProgress = () => {
  const { journeyStatus, loading, getProgressPercentage, getTimeToNextStage } = useJourney();

  if (loading || !journeyStatus) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-muted rounded w-48" />
        <div className="h-32 bg-muted rounded" />
      </div>
    );
  }

  const currentStageIndex = STAGE_ORDER.indexOf(journeyStatus.current_stage);
  const progressPercentage = getProgressPercentage();
  const timeToNext = getTimeToNextStage();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Your Journey</h2>
        <p className="text-sm text-muted-foreground">
          Growing through authentic connection and self-discovery
        </p>
      </div>

      {/* Timeline - Horizontal on desktop, responsive */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-12 left-0 right-0 h-0.5 bg-border hidden md:block" />
        
        {/* Progress Line */}
        <motion.div
          className="absolute top-12 left-0 h-0.5 bg-gradient-to-r from-[#86efac] via-[#34d399] to-[#fbbf24] hidden md:block"
          initial={{ width: 0 }}
          animate={{ 
            width: `${(currentStageIndex / (STAGE_ORDER.length - 1)) * 100}%` 
          }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />

        {/* Stages */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 relative">
          {STAGE_ORDER.map((stageId, index) => {
            const stage = STAGE_INFO[stageId];
            const Icon = STAGE_ICONS[stageId];
            const isActive = stageId === journeyStatus.current_stage;
            const isCompleted = index < currentStageIndex;
            const isLocked = index > currentStageIndex;

            return (
              <motion.div
                key={stageId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  'relative flex flex-col items-center text-center space-y-3',
                  isLocked && 'opacity-50'
                )}
              >
                {/* Stage Icon with Progress Ring */}
                <div className="relative">
                  {/* Progress Ring (only for active stage) */}
                  {isActive && (
                    <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="hsl(var(--border))"
                        strokeWidth="4"
                      />
                      {/* Progress circle */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={stage.color}
                        strokeWidth="4"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progressPercentage / 100 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                        style={{
                          pathLength: progressPercentage / 100,
                          strokeDasharray: '283', // 2 * π * 45
                        }}
                      />
                    </svg>
                  )}

                  {/* Icon Container */}
                  <motion.div
                    className={cn(
                      'relative w-20 h-20 rounded-full flex items-center justify-center',
                      'transition-all duration-300',
                      isActive && 'bg-card shadow-lg',
                      isCompleted && 'bg-card/50',
                      isLocked && 'bg-muted'
                    )}
                    style={{
                      boxShadow: isActive ? `0 0 30px ${stage.glowColor}` : undefined,
                    }}
                    whileHover={{ scale: 1.05 }}
                  >
                    {isLocked ? (
                      <Lock className="w-8 h-8 text-muted-foreground" />
                    ) : (
                      <Icon
                        className="w-8 h-8"
                        style={{ color: stage.color }}
                      />
                    )}
                  </motion.div>

                  {/* DNA Percentage Badge (active stage only) */}
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-card border border-border rounded-full px-2 py-0.5 text-xs font-bold shadow-sm"
                      style={{ color: stage.color }}
                    >
                      {journeyStatus.dna_confidence.overall}%
                    </motion.div>
                  )}
                </div>

                {/* Stage Info */}
                <div className="space-y-1">
                  <h3
                    className={cn(
                      'font-semibold text-base md:text-lg',
                      isActive && 'text-foreground',
                      !isActive && 'text-muted-foreground'
                    )}
                  >
                    {stage.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {stage.timeEstimate}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    DNA: {stage.dnaRange.min}-{stage.dnaRange.max}%
                  </p>
                </div>

                {/* Description (active stage only) */}
                {isActive && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground max-w-[200px] hidden md:block"
                  >
                    {stage.description}
                  </motion.p>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Time to Next Stage */}
      {timeToNext && currentStageIndex < STAGE_ORDER.length - 1 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground">
            Estimated time to{' '}
            <span className="font-semibold text-foreground">
              {STAGE_INFO[STAGE_ORDER[currentStageIndex + 1]].name}
            </span>
            : <span className="font-semibold">{timeToNext}</span>
          </p>
        </motion.div>
      )}

      {/* Islamic Encouragement */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-center py-4 px-6 bg-card/50 rounded-lg border border-border"
      >
        <p className="text-sm text-muted-foreground italic">
          "Sabr (patience) brings rewards. Every step on this journey brings you closer to meaningful connection."
        </p>
      </motion.div>
    </div>
  );
};
