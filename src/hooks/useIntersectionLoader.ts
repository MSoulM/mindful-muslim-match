import { useEffect, useRef, useState, useCallback } from 'react';

export interface UseIntersectionLoaderOptions {
  threshold?: number;
  rootMargin?: string;
  enabled?: boolean;
  onLoad?: () => void | Promise<void>;
}

/**
 * Intersection Observer hook for lazy loading
 * 
 * Triggers loading when element becomes visible in viewport.
 * Perfect for implementing infinite scroll and lazy-loading images.
 */
export function useIntersectionLoader<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.1,
  rootMargin = '100px',
  enabled = true,
  onLoad,
}: UseIntersectionLoaderOptions = {}) {
  const elementRef = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const load = useCallback(async () => {
    if (hasLoaded || !enabled) return;
    
    setHasLoaded(true);
    await onLoad?.();
  }, [hasLoaded, enabled, onLoad]);

  useEffect(() => {
    if (!enabled) return;

    const element = elementRef.current;
    if (!element) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        
        if (entry.isIntersecting && !hasLoaded) {
          load();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [enabled, threshold, rootMargin, hasLoaded, load]);

  return {
    elementRef,
    isIntersecting,
    hasLoaded,
    reload: () => {
      setHasLoaded(false);
      load();
    },
  };
}

/**
 * Infinite scroll hook using intersection observer
 * 
 * Automatically loads more items when user scrolls near bottom
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore = true,
  isLoading = false,
  threshold = 0.1,
  rootMargin = '200px',
}: {
  onLoadMore: () => void | Promise<void>;
  hasMore?: boolean;
  isLoading?: boolean;
  threshold?: number;
  rootMargin?: string;
}) {
  const loader = useIntersectionLoader({
    threshold,
    rootMargin,
    enabled: hasMore && !isLoading,
    onLoad: onLoadMore,
  });

  return {
    loaderRef: loader.elementRef,
    isLoadingMore: loader.isIntersecting && !loader.hasLoaded,
  };
}
