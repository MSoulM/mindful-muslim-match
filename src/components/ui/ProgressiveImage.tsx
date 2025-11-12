import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  thumbnailSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
  aspectRatio?: string;
}

/**
 * Progressive image component with blur-up placeholder effect
 * Displays a low-quality thumbnail while loading the full image
 */
export function ProgressiveImage({
  src,
  alt,
  className,
  thumbnailSrc,
  onLoad,
  onError,
  aspectRatio
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(thumbnailSrc || src);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
    setCurrentSrc(thumbnailSrc || src);

    // Preload the full image
    const img = new Image();
    img.src = src;

    img.onload = () => {
      setCurrentSrc(src);
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
  }, [src, thumbnailSrc, onLoad, onError]);

  if (hasError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-muted",
        className
      )}>
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground">Failed to load image</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn("relative overflow-hidden", className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-all duration-500",
          !isLoaded && thumbnailSrc && "blur-md scale-105",
          isLoaded && "blur-0 scale-100"
        )}
      />
      
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-background/10 animate-pulse" />
      )}
    </div>
  );
}
