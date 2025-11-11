import { useState } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface NetworkErrorProps {
  isVisible?: boolean;
  onRetry?: () => Promise<void>;
}

export const NetworkError = ({ isVisible = true, onRetry }: NetworkErrorProps) => {
  const [isRetrying, setIsRetrying] = useState(false);
  
  const handleRetry = async () => {
    setIsRetrying(true);
    
    if (onRetry) {
      await onRetry();
    } else {
      // Default retry behavior - check network
      try {
        await fetch(window.location.origin, { method: 'HEAD' });
        window.location.reload();
      } catch {
        // Network still unavailable
      }
    }
    
    setIsRetrying(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed inset-x-0 bottom-20 z-40 px-4"
        >
          <div className="bg-red-600 text-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium">No Internet Connection</p>
                <p className="text-xs opacity-90">Check your connection and try again</p>
              </div>
              <button
                onClick={handleRetry}
                disabled={isRetrying}
                className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium hover:bg-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRetrying ? 'Retrying...' : 'Retry'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
