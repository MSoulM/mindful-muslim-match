import { useState, useRef, useCallback } from 'react';

export const usePullToRefresh = (onRefresh: () => Promise<void>) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  
  const threshold = 80; // pixels to trigger refresh
  const maxPull = 120; // max pull distance
  
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (window.scrollY === 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!isPulling || isRefreshing) return;
    
    currentY.current = e.touches[0].clientY;
    const distance = Math.min(currentY.current - startY.current, maxPull);
    
    if (distance > 0) {
      setPullDistance(distance);
      // Haptic feedback at threshold
      if (distance > threshold && distance < threshold + 5) {
        window.navigator?.vibrate?.(10);
      }
    }
  }, [isPulling, isRefreshing, threshold, maxPull]);
  
  const handleTouchEnd = useCallback(async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      window.navigator?.vibrate?.([20, 10, 20]); // Success haptic
      
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    setIsPulling(false);
  }, [pullDistance, isRefreshing, onRefresh, threshold]);
  
  return {
    pullDistance,
    isRefreshing,
    isPulling,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    }
  };
};
