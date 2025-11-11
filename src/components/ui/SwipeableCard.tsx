import { useState, ReactNode } from 'react';
import { useSwipeable } from 'react-swipeable';

interface SwipeAction {
  label: string;
  color: string;
  icon: ReactNode;
}

interface SwipeableCardProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  children: ReactNode;
}

export const SwipeableCard = ({
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  children
}: SwipeableCardProps) => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      setIsDragging(true);
      const newOffset = Math.max(-100, Math.min(100, eventData.deltaX));
      setOffset(newOffset);
      
      // Haptic feedback at thresholds
      if (Math.abs(newOffset) >= 75 && Math.abs(newOffset) < 80) {
        window.navigator?.vibrate?.(10);
      }
    },
    onSwipedLeft: () => {
      if (offset < -75) {
        window.navigator?.vibrate?.(20);
        onSwipeLeft?.();
      }
      setOffset(0);
      setIsDragging(false);
    },
    onSwipedRight: () => {
      if (offset > 75) {
        window.navigator?.vibrate?.(20);
        onSwipeRight?.();
      }
      setOffset(0);
      setIsDragging(false);
    },
    trackMouse: false,
    trackTouch: true,
    delta: 10,
    preventScrollOnSwipe: true,
  });
  
  const showLeftAction = offset < -20 && leftAction;
  const showRightAction = offset > 20 && rightAction;
  
  return (
    <div className="relative overflow-hidden">
      {/* Background Actions */}
      {showLeftAction && (
        <div 
          className="absolute inset-y-0 right-0 flex items-center justify-end px-6 gap-2"
          style={{ 
            backgroundColor: leftAction.color,
            opacity: Math.abs(offset) / 100
          }}
        >
          {leftAction.icon}
          <span className="text-white font-medium text-sm">
            {leftAction.label}
          </span>
        </div>
      )}
      
      {showRightAction && (
        <div 
          className="absolute inset-y-0 left-0 flex items-center justify-start px-6 gap-2"
          style={{ 
            backgroundColor: rightAction.color,
            opacity: Math.abs(offset) / 100
          }}
        >
          {rightAction.icon}
          <span className="text-white font-medium text-sm">
            {rightAction.label}
          </span>
        </div>
      )}
      
      {/* Main Card */}
      <div
        {...handlers}
        className="relative bg-background touch-pan-y"
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};
