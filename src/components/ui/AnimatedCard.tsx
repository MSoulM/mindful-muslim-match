import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { 
  cardPress, 
  cardHover, 
  respectMotionPreference, 
  staggerItem,
  optimizeForAnimation 
} from '@/utils/animations';
import { haptics } from '@/utils/haptics';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  delay?: number;
  enableHover?: boolean;
  enablePress?: boolean;
}

export const AnimatedCard = ({ 
  children, 
  className,
  onClick,
  delay = 0,
  enableHover = true,
  enablePress = true,
}: AnimatedCardProps) => {
  const handleClick = () => {
    if (onClick) {
      haptics.tap();
      onClick();
    }
  };

  return (
    <motion.div
      variants={respectMotionPreference(staggerItem)}
      initial="initial"
      animate="animate"
      {...(enableHover && cardHover)}
      {...(enablePress && cardPress)}
      transition={{ delay }}
      style={optimizeForAnimation()}
      className={cn(
        'bg-card rounded-xl border border-border shadow-sm',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={handleClick}
    >
      {children}
    </motion.div>
  );
};
