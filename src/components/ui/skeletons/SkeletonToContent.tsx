import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface SkeletonToContentProps {
  isLoading: boolean;
  skeleton: ReactNode;
  children: ReactNode;
  transition?: {
    duration?: number;
    delay?: number;
  };
}

/**
 * Handles smooth transition from skeleton to content
 * Prevents layout shift and provides fade transition
 */
export const SkeletonToContent = ({
  isLoading,
  skeleton,
  children,
  transition = {},
}: SkeletonToContentProps) => {
  const { duration = 0.3, delay = 0 } = transition;

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <motion.div
          key="skeleton"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration * 0.7 }}
        >
          {skeleton}
        </motion.div>
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration,
            delay,
            ease: 'easeOut' 
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
