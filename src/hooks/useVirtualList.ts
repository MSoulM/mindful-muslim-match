import { useState, useEffect, useRef, useMemo } from 'react';

export interface UseVirtualListOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  enabled?: boolean;
}

export interface VirtualItem {
  index: number;
  offsetTop: number;
}

/**
 * Virtual list hook for efficient rendering of large lists
 * 
 * Only renders items visible in viewport plus overscan buffer.
 * Dramatically improves performance for lists with 100+ items.
 */
export function useVirtualList<T>(
  items: T[],
  {
    itemHeight,
    containerHeight,
    overscan = 3,
    enabled = true,
  }: UseVirtualListOptions
) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const { virtualItems, totalHeight, startIndex, endIndex } = useMemo(() => {
    if (!enabled) {
      return {
        virtualItems: items.map((_, index) => ({
          index,
          offsetTop: index * itemHeight,
        })),
        totalHeight: items.length * itemHeight,
        startIndex: 0,
        endIndex: items.length - 1,
      };
    }

    const rangeStart = Math.floor(scrollTop / itemHeight);
    const rangeEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);

    const startIdx = Math.max(0, rangeStart - overscan);
    const endIdx = Math.min(items.length - 1, rangeEnd + overscan);

    const virtualItems: VirtualItem[] = [];
    for (let i = startIdx; i <= endIdx; i++) {
      virtualItems.push({
        index: i,
        offsetTop: i * itemHeight,
      });
    }

    return {
      virtualItems,
      totalHeight: items.length * itemHeight,
      startIndex: startIdx,
      endIndex: endIdx,
    };
  }, [items, itemHeight, containerHeight, scrollTop, overscan, enabled]);

  // Handle scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !enabled) return;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [enabled]);

  return {
    containerRef,
    virtualItems,
    totalHeight,
    startIndex,
    endIndex,
    scrollTop,
    // Helper to get item by index
    getItem: (index: number) => items[index],
    // Scroll to specific item
    scrollToIndex: (index: number) => {
      if (containerRef.current) {
        containerRef.current.scrollTop = index * itemHeight;
      }
    },
  };
}

/**
 * Simpler hook for dynamic height items (experimental)
 * Measures items as they render
 */
export function useVirtualListDynamic<T>(
  items: T[],
  {
    estimatedItemHeight = 100,
    containerHeight,
    overscan = 3,
  }: {
    estimatedItemHeight?: number;
    containerHeight: number;
    overscan?: number;
  }
) {
  const [scrollTop, setScrollTop] = useState(0);
  const [measuredHeights, setMeasuredHeights] = useState<Map<number, number>>(
    new Map()
  );
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate positions based on measured heights
  const { positions, totalHeight } = useMemo(() => {
    const positions: number[] = [];
    let currentOffset = 0;

    for (let i = 0; i < items.length; i++) {
      positions.push(currentOffset);
      const height = measuredHeights.get(i) || estimatedItemHeight;
      currentOffset += height;
    }

    return {
      positions,
      totalHeight: currentOffset,
    };
  }, [items.length, measuredHeights, estimatedItemHeight]);

  // Find visible range
  const { startIndex, endIndex } = useMemo(() => {
    let start = 0;
    let end = items.length - 1;

    for (let i = 0; i < positions.length; i++) {
      if (positions[i] < scrollTop) {
        start = i;
      }
      if (positions[i] < scrollTop + containerHeight) {
        end = i;
      }
    }

    return {
      startIndex: Math.max(0, start - overscan),
      endIndex: Math.min(items.length - 1, end + overscan),
    };
  }, [positions, scrollTop, containerHeight, items.length, overscan]);

  const measureItem = (index: number, height: number) => {
    setMeasuredHeights(prev => {
      const next = new Map(prev);
      next.set(index, height);
      return next;
    });
  };

  return {
    containerRef,
    startIndex,
    endIndex,
    totalHeight,
    getItemOffset: (index: number) => positions[index] || 0,
    measureItem,
  };
}
