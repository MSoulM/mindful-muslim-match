import { ReactNode, useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { LoadingSpinner } from '@/components/utils/LoadingSpinner';
import { cn } from '@/lib/utils';

interface ScreenContainerProps {
  children: ReactNode;
  hasTopBar?: boolean;
  hasBottomNav?: boolean;
  backgroundColor?: string;
  padding?: boolean;
  scrollable?: boolean;
  onRefresh?: () => Promise<void>;
  className?: string;
}

export const ScreenContainer = ({
  children,
  hasTopBar = true,
  hasBottomNav = true,
  backgroundColor = '#FAFAFA',
  padding = true,
  scrollable = true,
  onRefresh,
  className,
}: ScreenContainerProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 80], [0, 1]);
  const scale = useTransform(y, [0, 80], [0.8, 1]);

  // Calculate padding for safe areas and nav bars
  const topPadding = hasTopBar ? 'calc(56px + env(safe-area-inset-top))' : 'env(safe-area-inset-top)';
  const bottomPadding = hasBottomNav ? 'calc(60px + env(safe-area-inset-bottom))' : 'env(safe-area-inset-bottom)';

  // Pull to refresh handler
  const handleTouchStart = useRef<number>(0);
  const handleTouchMove = (e: TouchEvent) => {
    if (!onRefresh || !containerRef.current) return;
    
    const scrollTop = containerRef.current.scrollTop;
    if (scrollTop > 0) return; // Only trigger at top

    const touchY = e.touches[0].clientY;
    const diff = touchY - handleTouchStart.current;

    if (diff > 0 && diff < 120) {
      y.set(diff);
    }

    // Haptic feedback at threshold
    if (diff >= 80 && !isRefreshing) {
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!onRefresh) return;

    const currentY = y.get();
    
    if (currentY >= 80 && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }

    // Animate back to 0
    animate(y, 0, {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !onRefresh) return;

    const touchStartHandler = (e: TouchEvent) => {
      handleTouchStart.current = e.touches[0].clientY;
    };

    container.addEventListener('touchstart', touchStartHandler);
    container.addEventListener('touchmove', handleTouchMove);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', touchStartHandler);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onRefresh, isRefreshing]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full scroll-smooth',
        scrollable ? 'overflow-y-auto' : 'overflow-hidden',
        className
      )}
      style={{
        backgroundColor,
        paddingTop: topPadding,
        paddingBottom: bottomPadding,
        minHeight: '100vh',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Pull to refresh indicator */}
      {onRefresh && (
        <motion.div
          className="absolute top-0 left-0 right-0 flex justify-center items-center h-20 pointer-events-none"
          style={{ 
            opacity,
            paddingTop: 'env(safe-area-inset-top)',
          }}
        >
          <motion.div style={{ scale }}>
            <LoadingSpinner 
              size="md" 
              color={isRefreshing ? 'primary' : 'neutral'} 
            />
          </motion.div>
        </motion.div>
      )}

      {/* Content */}
      <motion.div
        style={{ y }}
        className={cn(
          padding && 'px-4 sm:px-5',
          hasBottomNav && padding && 'pb-5'
        )}
      >
        {children}
      </motion.div>
    </div>
  );
};
