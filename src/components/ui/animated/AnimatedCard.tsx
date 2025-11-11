import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { staggerItem } from '@/utils/animations';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedCard = ({ children, className, delay = 0 }: AnimatedCardProps) => {
  return (
    <motion.div
      variants={staggerItem}
      initial="initial"
      animate="animate"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
