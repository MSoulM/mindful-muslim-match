import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { haptics } from '@/utils/haptics';

interface SwipeableCardProps {
  children: ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
  threshold?: number;
}

export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className,
  threshold = 150,
}: SwipeableCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    // Swipe left
    if (offset < -threshold || velocity < -500) {
      haptics.unlike();
      onSwipeLeft?.();
    }
    // Swipe right
    else if (offset > threshold || velocity > 500) {
      haptics.like();
      onSwipeRight?.();
    }
  };

  return (
    <motion.div
      className={cn('cursor-grab active:cursor-grabbing', className)}
      style={{
        x,
        rotate,
        opacity,
        willChange: 'transform, opacity',
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.05 }}
    >
      {children}

      {/* Swipe indicators */}
      <motion.div
        className="absolute top-4 left-4 bg-semantic-error text-white px-4 py-2 rounded-lg font-bold text-lg rotate-[-20deg]"
        style={{
          opacity: useTransform(x, [-150, -50, 0], [1, 0, 0]),
        }}
      >
        NOPE
      </motion.div>

      <motion.div
        className="absolute top-4 right-4 bg-semantic-success text-white px-4 py-2 rounded-lg font-bold text-lg rotate-[20deg]"
        style={{
          opacity: useTransform(x, [0, 50, 150], [0, 0, 1]),
        }}
      >
        LIKE
      </motion.div>
    </motion.div>
  );
};
