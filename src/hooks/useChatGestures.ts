import { useCallback, useRef } from 'react';
import { useSwipeable, SwipeableHandlers } from 'react-swipeable';

interface ChatGestureOptions {
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  onLongPress?: (messageId: string) => void;
  onDoubleTap?: (messageId: string) => void;
}

export const useChatGestures = (options: ChatGestureOptions) => {
  const { onSwipeRight, onSwipeLeft, onLongPress, onDoubleTap } = options;

  // Swipe gesture handlers for navigation
  const swipeHandlers = useSwipeable({
    onSwipedRight: () => {
      if (onSwipeRight) {
        onSwipeRight();
      }
    },
    onSwipedLeft: () => {
      if (onSwipeLeft) {
        onSwipeLeft();
      }
    },
    trackMouse: false,
    trackTouch: true,
    delta: 50, // Minimum distance for swipe
    preventScrollOnSwipe: false,
    swipeDuration: 500
  });

  // Long press handler
  const longPressTimer = useRef<NodeJS.Timeout>();
  const tapTimer = useRef<NodeJS.Timeout>();
  const tapCount = useRef(0);

  const handleTouchStart = useCallback((messageId: string) => {
    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress(messageId);
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    }, 500);
  }, [onLongPress]);

  const handleTouchEnd = useCallback((messageId: string) => {
    // Cancel long press
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    // Handle double tap
    tapCount.current += 1;

    if (tapCount.current === 1) {
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
      }, 300);
    } else if (tapCount.current === 2) {
      if (tapTimer.current) {
        clearTimeout(tapTimer.current);
      }
      tapCount.current = 0;
      
      if (onDoubleTap) {
        onDoubleTap(messageId);
        // Haptic feedback
        if ('vibrate' in navigator) {
          navigator.vibrate([30, 30, 30]);
        }
      }
    }
  }, [onDoubleTap]);

  const handleTouchCancel = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  }, []);

  return {
    swipeHandlers,
    messageGestures: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchCancel
    }
  };
};
