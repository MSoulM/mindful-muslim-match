import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PageTransitionProps {
  children: ReactNode;
  direction?: 'forward' | 'back';
  className?: string;
}

const variants = {
  initial: (direction: 'forward' | 'back') => ({
    opacity: 0,
    x: direction === 'forward' ? 20 : -20,
  }),
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: 'forward' | 'back') => ({
    opacity: 0,
    x: direction === 'forward' ? -20 : 20,
  }),
};

export const PageTransition = ({ 
  children, 
  direction = 'forward',
  className 
}: PageTransitionProps) => {
  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={direction}
        custom={direction}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
          duration: 0.2,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
