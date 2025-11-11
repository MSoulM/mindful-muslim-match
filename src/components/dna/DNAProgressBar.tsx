import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DNAProgressBarProps {
  trait: string;
  score: number;
  maxScore?: number;
  trend?: {
    direction: 'up' | 'down';
    value: number;
  };
  description?: string;
  benchmark?: number;
  className?: string;
}

export const DNAProgressBar = ({
  trait,
  score,
  maxScore = 100,
  trend,
  description,
  benchmark,
  className,
}: DNAProgressBarProps) => {
  const percentage = (score / maxScore) * 100;
  const benchmarkPercentage = benchmark ? (benchmark / maxScore) * 100 : null;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-neutral-900">
            {trait}
          </span>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                trend.direction === 'up' ? 'text-semantic-success' : 'text-semantic-error'
              )}
            >
              {trend.direction === 'up' ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}
            </div>
          )}
        </div>
        <span className="text-sm font-bold text-neutral-900">
          {score}/{maxScore}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative h-3 bg-neutral-200 rounded-full overflow-hidden">
        {/* Benchmark Indicator */}
        {benchmarkPercentage !== null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-neutral-400 z-10"
            style={{ left: `${benchmarkPercentage}%` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-xs text-neutral-500">
              ↓
            </div>
          </div>
        )}

        {/* Animated Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
          className="h-full bg-gradient-to-r from-primary-forest to-primary-gold rounded-full"
        />
      </div>

      {/* Description */}
      {description && (
        <p className="text-xs text-neutral-600 leading-relaxed">
          {description}
        </p>
      )}

      {/* Benchmark Label */}
      {benchmark !== undefined && (
        <p className="text-xs text-neutral-500">
          Average: {benchmark}/{maxScore}
        </p>
      )}
    </div>
  );
};
