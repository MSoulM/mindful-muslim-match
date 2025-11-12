import { useState, useEffect } from 'react';

interface UseProgressiveImageOptions {
  thumbnailSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

interface UseProgressiveImageReturn {
  src: string;
  isLoading: boolean;
  hasError: boolean;
}

/**
 * Hook for progressive image loading with blur-up effect
 */
export function useProgressiveImage(
  fullSrc: string,
  options: UseProgressiveImageOptions = {}
): UseProgressiveImageReturn {
  const { thumbnailSrc, onLoad, onError } = options;
  const [src, setSrc] = useState(thumbnailSrc || fullSrc);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setSrc(thumbnailSrc || fullSrc);

    // Preload the full image
    const img = new Image();
    img.src = fullSrc;

    img.onload = () => {
      setSrc(fullSrc);
      setIsLoading(false);
      onLoad?.();
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
      onError?.();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [fullSrc, thumbnailSrc, onLoad, onError]);

  return { src, isLoading, hasError };
}
