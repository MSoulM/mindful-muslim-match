import { motion } from 'framer-motion';
import { Flame, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StreakStatus } from '@/services/api/streaks';

interface StreakCounterProps {
  status: StreakStatus | null;
  className?: string;
  variant?: 'default' | 'compact';
}

export const StreakCounter = ({ status, className, variant = 'default' }: StreakCounterProps) => {
  if (!status || status.currentStreak === 0) {
    return null;
  }

  const isCompact = variant === 'compact';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 px-3 py-2',
        isCompact && 'px-2 py-1 text-sm',
        className
      )}
    >
      <Flame className={cn('text-orange-500', isCompact && 'w-4 h-4')} />
      <span className={cn('font-semibold text-orange-600', isCompact && 'text-sm')}>
        {status.currentStreak}-day streak!
      </span>
      {status.daysUntilNextMilestone !== null && status.daysUntilNextMilestone > 0 && !isCompact && (
        <span className="text-xs text-muted-foreground">
          {status.daysUntilNextMilestone} more {status.daysUntilNextMilestone === 1 ? 'day' : 'days'} until bonus
        </span>
      )}
      {status.gracePeriodUsed && (
        <span className="text-xs text-amber-600 font-medium">
          Grace used
        </span>
      )}
    </motion.div>
  );
};
