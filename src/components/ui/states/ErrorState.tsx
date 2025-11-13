import { AlertCircle, RefreshCw, Home, HelpCircle } from 'lucide-react';
import { Button } from '../button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void | Promise<void>;
  onGoHome?: () => void;
  showSupport?: boolean;
  fullScreen?: boolean;
  className?: string;
  errorCode?: string;
}

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'We encountered an error. Please try again.',
  onRetry,
  onGoHome,
  showSupport = false,
  fullScreen = false,
  className,
  errorCode
}: ErrorStateProps) => {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center'
    : 'py-12';

  return (
    <div className={cn(containerClass, 'px-8', className)}>
      <motion.div 
        className="text-center max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Error Icon with pulse animation */}
        <motion.div 
          className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6"
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <AlertCircle className="w-10 h-10 text-destructive" />
        </motion.div>
        
        {/* Error Code */}
        {errorCode && (
          <div className="inline-block px-3 py-1 bg-muted rounded-full mb-3">
            <span className="text-xs font-mono text-muted-foreground">{errorCode}</span>
          </div>
        )}
        
        {/* Title */}
        <h3 className="text-xl font-semibold text-foreground mb-3">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {description}
        </p>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {onRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </>
              )}
            </Button>
          )}
          
          {onGoHome && (
            <Button
              onClick={onGoHome}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          )}
          
          {showSupport && (
            <Button
              onClick={() => window.location.href = '/help'}
              variant="ghost"
              className="w-full"
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
