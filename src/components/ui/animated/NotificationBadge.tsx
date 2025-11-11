import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
}

export const NotificationBadge = ({ 
  count, 
  className,
  maxCount = 9 
}: NotificationBadgeProps) => {
  const displayCount = count > maxCount ? `${maxCount}+` : count;
  
  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className={cn(
            "absolute -top-1 -right-1 bg-semantic-error text-white",
            "text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5",
            "flex items-center justify-center",
            "shadow-sm",
            className
          )}
        >
          <motion.span
            key={count}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {displayCount}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
