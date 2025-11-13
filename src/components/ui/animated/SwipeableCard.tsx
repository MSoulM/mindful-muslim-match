import { motion, PanInfo, useMotionValue, useTransform, useAnimation } from 'framer-motion';
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

// Spring physics configuration for natural motion
const springConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
};

// More bouncy spring for snap-back
const snapBackSpring = {
  type: "spring" as const,
  stiffness: 500,
  damping: 35,
  mass: 0.8,
};

export const SwipeableCard = ({
  children,
  onSwipeLeft,
  onSwipeRight,
  className,
  threshold = 150,
}: SwipeableCardProps) => {
  const x = useMotionValue(0);
  const controls = useAnimation();
  
  // Enhanced transforms with velocity-aware scaling
  const rotate = useTransform(x, [-200, 0, 200], [-20, 0, 20]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const scale = useTransform(x, [-150, 0, 150], [0.95, 1, 0.95]);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    const absVelocity = Math.abs(velocity);

    // Velocity-based threshold adjustment for more natural feel
    const velocityThreshold = 500;
    const adjustedThreshold = threshold - (absVelocity / 10);

    // Swipe left with velocity consideration
    if (offset < -adjustedThreshold || velocity < -velocityThreshold) {
      haptics.unlike();
      
      // Animate out with spring physics based on velocity
      await controls.start({
        x: -1000,
        opacity: 0,
        rotate: -45,
        transition: {
          type: "spring",
          stiffness: 200 + absVelocity / 5,
          damping: 20,
          velocity: velocity,
        }
      });
      
      onSwipeLeft?.();
    }
    // Swipe right with velocity consideration
    else if (offset > adjustedThreshold || velocity > velocityThreshold) {
      haptics.like();
      
      // Animate out with spring physics based on velocity
      await controls.start({
        x: 1000,
        opacity: 0,
        rotate: 45,
        transition: {
          type: "spring",
          stiffness: 200 + absVelocity / 5,
          damping: 20,
          velocity: velocity,
        }
      });
      
      onSwipeRight?.();
    }
    // Snap back with bouncy spring
    else {
      // Light haptic for snap-back
      if (Math.abs(offset) > 50) {
        haptics.tap();
      }
      
      await controls.start({
        x: 0,
        rotate: 0,
        scale: 1,
        transition: snapBackSpring,
      });
    }
  };

  return (
    <motion.div
      className={cn('cursor-grab active:cursor-grabbing touch-none', className)}
      style={{
        x,
        rotate,
        opacity,
        scale,
        willChange: 'transform, opacity',
      }}
      animate={controls}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 1.02 }}
      transition={springConfig}
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
