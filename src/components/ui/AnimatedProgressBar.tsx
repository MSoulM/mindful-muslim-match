import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { respectMotionTransition, optimizeForAnimation } from '@/utils/animations';

interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantClasses = {
  default: 'bg-primary',
  success: 'bg-semantic-success',
  warning: 'bg-semantic-warning',
  error: 'bg-semantic-error',
};

export const AnimatedProgressBar = ({
  value,
  max = 100,
  className,
  barClassName,
  showLabel = false,
  label,
  size = 'md',
  variant = 'default',
}: AnimatedProgressBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  // Spring animation for smooth progress
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 20,
    mass: 0.8,
  });

  const scaleX = useTransform(spring, [0, 100], [0, 1]);

  useEffect(() => {
    spring.set(percentage);
  }, [percentage, spring]);

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-2">
          {label && <span className="text-sm font-medium text-foreground">{label}</span>}
          {showLabel && (
            <span className="text-sm text-muted-foreground">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div
        className={cn(
          'w-full bg-secondary rounded-full overflow-hidden',
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <motion.div
          className={cn(
            'h-full origin-left',
            variantClasses[variant],
            barClassName
          )}
          style={{
            scaleX,
            ...optimizeForAnimation(['transform'])
          }}
          transition={respectMotionTransition({
            type: 'spring',
            stiffness: 100,
            damping: 20,
          })}
        />
      </div>
    </div>
  );
};
