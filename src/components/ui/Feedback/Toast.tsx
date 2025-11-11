import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  onClose?: () => void;
  isOpen: boolean;
}

export const Toast = ({
  type = 'info',
  title,
  description,
  duration = 5000,
  onClose,
  isOpen,
}: ToastProps) => {
  // Auto-dismiss timer
  useEffect(() => {
    if (!isOpen || !onClose || duration <= 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isOpen, onClose, duration]);

  // Type configurations
  const typeConfig = {
    success: {
      icon: CheckCircle,
      iconColor: 'text-semantic-success',
      bgColor: 'bg-semantic-success/10',
      borderColor: 'border-semantic-success/20',
    },
    error: {
      icon: XCircle,
      iconColor: 'text-semantic-error',
      bgColor: 'bg-semantic-error/10',
      borderColor: 'border-semantic-error/20',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-semantic-warning',
      bgColor: 'bg-semantic-warning/10',
      borderColor: 'border-semantic-warning/20',
    },
    info: {
      icon: Info,
      iconColor: 'text-semantic-info',
      bgColor: 'bg-semantic-info/10',
      borderColor: 'border-semantic-info/20',
    },
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-0 left-0 right-0 z-[200] flex justify-center px-4"
          style={{ paddingTop: 'calc(env(safe-area-inset-top) + 16px)' }}
        >
          <div
            className={cn(
              'w-full max-w-md p-4 rounded-xl border shadow-lg',
              'backdrop-blur-sm bg-white/95',
              config.bgColor,
              config.borderColor
            )}
          >
            <div className="flex gap-3">
              {/* Icon */}
              <div className={cn('flex-shrink-0 w-5 h-5', config.iconColor)}>
                <Icon className="w-full h-full" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-md font-semibold text-neutral-900 mb-1">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    {description}
                  </p>
                )}
              </div>

              {/* Close button */}
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex-shrink-0 w-5 h-5 text-neutral-500 hover:text-neutral-700 transition-colors"
                  aria-label="Close notification"
                >
                  <X className="w-full h-full" />
                </button>
              )}
            </div>

            {/* Progress bar */}
            {duration > 0 && (
              <motion.div
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className={cn('h-1 mt-3 rounded-full origin-left', config.iconColor)}
                style={{ backgroundColor: 'currentColor', opacity: 0.3 }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
