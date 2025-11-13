import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StaggerListProps {
  children: ReactNode[];
  className?: string;
  staggerDelay?: number;
  animateOnMount?: boolean;
}

export const StaggerList = ({
  children,
  className,
  staggerDelay = 0.05,
  animateOnMount = true,
}: StaggerListProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 500,
        damping: 30,
      },
    },
  };

  return (
    <motion.div
      className={cn(className)}
      variants={containerVariants}
      initial={animateOnMount ? 'hidden' : 'visible'}
      animate="visible"
      style={{ willChange: 'opacity' }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          style={{ willChange: 'transform, opacity' }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
