import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingStateType } from '@/hooks/useLoadingState';

interface LoadingIndicatorProps {
  type: LoadingStateType;
  className?: string;
  message?: string;
  progress?: number;
}

/**
 * Context-aware loading indicator
 * 
 * Shows different UI based on loading type:
 * - initial: Full skeleton (handled by screen components)
 * - refresh: Spinner at top
 * - paginating: Spinner at bottom
 * - action: Inline spinner
 * - background: Subtle indicator
 */
export const LoadingIndicator = ({
  type,
  className,
  message,
  progress,
}: LoadingIndicatorProps) => {
  // Background sync indicator
  if (type === 'background') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={cn(
          'fixed top-20 left-1/2 -translate-x-1/2 z-40',
          'bg-card border border-border rounded-full shadow-sm',
          'px-4 py-2 flex items-center gap-2',
          className
        )}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </motion.div>
          <span className="text-sm text-muted-foreground">
            {message || 'Syncing...'}
          </span>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Pagination loader
  if (type === 'paginating') {
    return (
      <AnimatePresence>
        <div className={cn('py-8 flex justify-center', className)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-3"
          >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-6 h-6 text-primary" />
          </motion.div>
            {message && (
              <span className="text-sm text-muted-foreground">{message}</span>
            )}
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // Action loading (inline)
  if (type === 'action') {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={cn('inline-flex items-center gap-2', className)}
        >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-4 h-4 text-primary" />
        </motion.div>
          {message && (
            <span className="text-sm text-muted-foreground">{message}</span>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Refresh indicator with progress
  if (type === 'refresh') {
    return (
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.2 }}
          className={cn('py-4 flex flex-col items-center gap-2', className)}
        >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="w-6 h-6 text-primary" />
        </motion.div>
          {message && (
            <span className="text-sm text-muted-foreground">{message}</span>
          )}
          {progress !== undefined && (
            <div className="w-32 h-1 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Default loader
  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={cn('flex items-center justify-center p-8', className)}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
