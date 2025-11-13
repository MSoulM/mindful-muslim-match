import { useCallback, useRef, useState } from 'react';
import { triggerHaptic } from '@/utils/haptics';

interface UseLongPressOptions {
  onLongPress: () => void;
  onClick?: () => void;
  delay?: number;
  haptic?: boolean;
}

interface UseLongPressReturn {
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
  onTouchStart: () => void;
  onTouchEnd: () => void;
  isLongPressing: boolean;
}

/**
 * Hook for handling long-press gestures with haptic feedback
 * @param options - Configuration options
 * @returns Event handlers and state
 */
export const useLongPress = ({
  onLongPress,
  onClick,
  delay = 500,
  haptic = true,
}: UseLongPressOptions): UseLongPressReturn => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  const start = useCallback(() => {
    isLongPressRef.current = false;
    
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      setIsLongPressing(true);
      
      if (haptic) {
        triggerHaptic('medium');
      }
      
      onLongPress();
    }, delay);
  }, [onLongPress, delay, haptic]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // If it was a long press, we're done
    if (isLongPressRef.current) {
      setIsLongPressing(false);
      isLongPressRef.current = false;
      return;
    }
    
    // Otherwise, it's a regular click
    if (onClick && !isLongPressRef.current) {
      if (haptic) {
        triggerHaptic('light');
      }
      onClick();
    }
    
    setIsLongPressing(false);
  }, [onClick, haptic]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsLongPressing(false);
    isLongPressRef.current = false;
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: clear,
    isLongPressing,
  };
};
