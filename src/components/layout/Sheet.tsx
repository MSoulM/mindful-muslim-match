import { ReactNode, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  snapPoints?: number[];
  className?: string;
}

export const Sheet = ({
  isOpen,
  onClose,
  title,
  children,
  snapPoints = [0.9, 0.5],
  className,
}: SheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0]);

  // Handle drag end - close if dragged down enough
  const handleDragEnd = (_: any, info: PanInfo) => {
    const shouldClose = info.offset.y > 150 || info.velocity.y > 500;
    
    if (shouldClose) {
      // Haptic feedback on dismiss
      if ('vibrate' in navigator) {
        navigator.vibrate(5);
      }
      onClose();
    }
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            style={{ 
              y, 
              opacity,
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-[101]',
              'bg-white rounded-t-3xl shadow-2xl',
              'max-h-[90vh] flex flex-col',
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'sheet-title' : undefined}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-neutral-300 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
                <h2 
                  id="sheet-title" 
                  className="text-lg font-semibold text-neutral-900"
                >
                  {title}
                </h2>
                <motion.button
                  onClick={onClose}
                  className="min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-full touch-feedback"
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close"
                >
                  <X className="w-6 h-6 text-neutral-600" />
                </motion.button>
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 scroll-smooth">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
