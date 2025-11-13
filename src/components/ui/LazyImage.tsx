import { useState, useEffect } from 'react';
import { useIntersectionLoader } from '@/hooks/useIntersectionLoader';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  aspectRatio?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Lazy-loaded image with intersection observer
 * 
 * Only loads image when it enters viewport.
 * Shows placeholder blur until loaded.
 */
export const LazyImage = ({
  src,
  alt,
  className,
  placeholderSrc,
  aspectRatio,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '200px',
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(placeholderSrc || null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { elementRef, hasLoaded } = useIntersectionLoader<HTMLDivElement>({
    threshold,
    rootMargin,
    enabled: true,
    onLoad: async () => {
      // Image will be loaded once intersection occurs
    },
  });

  useEffect(() => {
    if (!hasLoaded) return;

    const img = new Image();
    img.src = src;

    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };

    img.onerror = () => {
      setHasError(true);
      onError?.();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, hasLoaded, onLoad, onError]);

  if (hasError) {
    return (
      <div
        ref={elementRef}
        className={cn(
          'flex items-center justify-center bg-muted',
          className
        )}
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={elementRef}
      className={cn('relative overflow-hidden', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {imageSrc ? (
        <motion.img
          src={imageSrc}
          alt={alt}
          className={cn(
            'w-full h-full object-cover',
            !isLoaded && placeholderSrc && 'blur-md scale-105'
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      ) : (
        <div className="w-full h-full bg-muted animate-pulse" />
      )}

      {/* Loading overlay */}
      {!isLoaded && hasLoaded && (
        <div className="absolute inset-0 bg-background/10 animate-pulse" />
      )}
    </div>
  );
};
