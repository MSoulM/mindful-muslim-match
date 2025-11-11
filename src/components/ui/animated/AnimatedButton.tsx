import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { scalePress } from '@/utils/animations';

interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: React.ReactNode;
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        {...scalePress}
        whileHover={{ scale: 1.02 }}
        className={className}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

AnimatedButton.displayName = 'AnimatedButton';
