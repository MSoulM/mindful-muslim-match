import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface SkeletonBaseProps {
  className?: string;
  animated?: boolean;
  variant?: 'default' | 'shimmer' | 'pulse';
}

export const SkeletonBase = ({ 
  className, 
  animated = true,
  variant = 'shimmer' 
}: SkeletonBaseProps) => {
  // Shimmer animation with gradient sweep
  if (variant === 'shimmer' && animated) {
    return (
      <motion.div
        className={cn(
          'relative overflow-hidden',
          'bg-muted',
          className
        )}
        role="status"
        aria-label="Loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-background/40 to-transparent"
          animate={{
            x: ['-100%', '200%'],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{ willChange: 'transform' }}
        />
      </motion.div>
    );
  }

  // Simple pulse animation
  if (variant === 'pulse' && animated) {
    return (
      <motion.div
        className={cn('bg-muted', className)}
        role="status"
        aria-label="Loading"
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    );
  }

  // Static skeleton (no animation)
  return (
    <div
      className={cn('bg-muted', className)}
      role="status"
      aria-label="Loading"
    />
  );
};
