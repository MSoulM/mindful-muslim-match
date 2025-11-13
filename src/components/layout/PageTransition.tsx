import { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface PageTransitionProps {
  children: ReactNode;
  direction?: 'forward' | 'back';
  className?: string;
  type?: 'slide' | 'fade' | 'scale';
}

const slideVariants = {
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

const fadeVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const scaleVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 },
};

export const PageTransition = ({ 
  children, 
  direction = 'forward',
  className,
  type = 'slide'
}: PageTransitionProps) => {
  const location = useLocation();

  const variants = type === 'slide' 
    ? slideVariants 
    : type === 'fade' 
    ? fadeVariants 
    : scaleVariants;

  return (
    <AnimatePresence mode="wait" custom={direction}>
      <motion.div
        key={location.pathname}
        custom={direction}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 35,
          duration: 0.25,
        }}
        className={className}
        style={{ willChange: 'transform, opacity' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
