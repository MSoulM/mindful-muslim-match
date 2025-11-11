import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedProgressProps {
  value: number;
  className?: string;
  barClassName?: string;
  delay?: number;
}

export const AnimatedProgress = ({ 
  value, 
  className, 
  barClassName,
  delay = 0.2 
}: AnimatedProgressProps) => {
  return (
    <div className={cn("h-2 bg-neutral-200 rounded-full overflow-hidden", className)}>
      <motion.div
        className={cn(
          "h-full bg-gradient-to-r from-primary to-primary-foreground",
          barClassName
        )}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay }}
      />
    </div>
  );
};
