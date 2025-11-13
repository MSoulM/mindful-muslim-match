import { SkeletonBase } from './SkeletonBase';
import { motion } from 'framer-motion';

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const fadeIn = {
  initial: { opacity: 0, x: -10 },
  animate: { 
    opacity: 1, 
    x: 0
  },
};

export const SkeletonMessagesScreen = () => {
  return (
    <motion.div 
      className="space-y-2 pb-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <motion.div 
          key={i} 
          className="flex gap-3 p-4 hover:bg-muted/50 transition-colors"
          variants={fadeIn}
          transition={{ duration: 0.3 }}
        >
          {/* Avatar */}
          <SkeletonBase className="w-14 h-14 rounded-full flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <SkeletonBase className="h-5 w-32 rounded" />
              <SkeletonBase className="h-4 w-16 rounded" />
            </div>
            <SkeletonBase className="h-4 w-full rounded mb-1" />
            <SkeletonBase className="h-4 w-2/3 rounded" />
          </div>

          {/* Badge */}
          {i % 3 === 0 && (
            <SkeletonBase className="w-6 h-6 rounded-full flex-shrink-0" />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
};
