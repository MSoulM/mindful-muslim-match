import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: 'primary' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

export const ProgressBar = ({
  value,
  label,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  animated = true,
  className,
}: ProgressBarProps) => {
  // Clamp value between 0 and 100
  const clampedValue = Math.min(Math.max(value, 0), 100);

  // Size classes
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  // Color classes
  const colorClasses = {
    primary: 'bg-primary-forest',
    success: 'bg-semantic-success',
    warning: 'bg-semantic-warning',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label and Percentage */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-neutral-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-neutral-900">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Container */}
      <div className={cn('w-full bg-neutral-200 rounded-full overflow-hidden', sizeClasses[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{
            duration: animated ? 0.5 : 0,
            ease: 'easeOut',
          }}
          className={cn('h-full rounded-full', colorClasses[color])}
        />
      </div>
    </div>
  );
};
