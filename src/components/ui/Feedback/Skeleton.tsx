import { cn } from '@/lib/utils';

interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rect';
  width?: string | number;
  height?: string | number;
  count?: number;
  animation?: 'pulse' | 'wave';
  className?: string;
}

export const Skeleton = ({
  variant = 'rect',
  width,
  height,
  count = 1,
  animation = 'pulse',
  className,
}: SkeletonProps) => {
  // Variant default dimensions
  const variantDefaults = {
    text: { height: '1rem', width: '100%' },
    circle: { height: '3rem', width: '3rem' },
    rect: { height: '6rem', width: '100%' },
  };

  const finalWidth = width ?? variantDefaults[variant].width;
  const finalHeight = height ?? variantDefaults[variant].height;

  // Animation classes
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-[shimmer_2s_ease-in-out_infinite]',
  };

  // Create multiple skeleton items if count > 1
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((item) => (
        <div
          key={item}
          className={cn(
            'bg-neutral-200',
            animationClasses[animation],
            variant === 'circle' && 'rounded-full',
            variant === 'text' && 'rounded',
            variant === 'rect' && 'rounded-lg',
            className
          )}
          style={{
            width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth,
            height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight,
          }}
        />
      ))}
    </>
  );
};

// Shimmer animation for wave effect
const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;

// Inject shimmer animation if wave is used
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = shimmerKeyframes;
  document.head.appendChild(styleElement);
}
