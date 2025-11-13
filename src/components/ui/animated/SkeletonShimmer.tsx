import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonShimmerProps {
  className?: string;
  variant?: 'text' | 'circle' | 'rect';
  width?: string | number;
  height?: string | number;
}

export const SkeletonShimmer = ({
  className,
  variant = 'rect',
  width,
  height,
}: SkeletonShimmerProps) => {
  const variantDefaults = {
    text: { height: '1rem', width: '100%' },
    circle: { height: '3rem', width: '3rem' },
    rect: { height: '6rem', width: '100%' },
  };

  const finalWidth = width ?? variantDefaults[variant].width;
  const finalHeight = height ?? variantDefaults[variant].height;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-muted',
        variant === 'circle' && 'rounded-full',
        variant === 'text' && 'rounded',
        variant === 'rect' && 'rounded-lg',
        className
      )}
      style={{
        width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
        height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
        willChange: 'transform',
      }}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-background/50 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          willChange: 'transform',
        }}
      />
    </div>
  );
};
