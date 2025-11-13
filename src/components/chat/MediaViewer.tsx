import { useState, useRef, useEffect } from 'react';
import { X, Download, Share2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface MediaViewerProps {
  images: { url: string; thumbnailUrl?: string }[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaViewer = ({
  images,
  initialIndex,
  isOpen,
  onClose
}: MediaViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0, distance: 0 });

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = images[currentIndex].url;
    link.download = `image-${currentIndex + 1}.jpg`;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Shared Image',
          url: images[currentIndex].url
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale(prev => Math.min(Math.max(1, prev + delta), 4));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      touchStartRef.current.distance = Math.sqrt(dx * dx + dy * dy);
    } else if (e.touches.length === 1) {
      touchStartRef.current.x = e.touches[0].clientX;
      touchStartRef.current.y = e.touches[0].clientY;
      setStartPos({ x: position.x, y: position.y });
      setIsDragging(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const delta = distance / touchStartRef.current.distance;
      setScale(prev => Math.min(Math.max(1, prev * delta), 4));
      touchStartRef.current.distance = distance;
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      const dx = e.touches[0].clientX - touchStartRef.current.x;
      const dy = e.touches[0].clientY - touchStartRef.current.y;
      setPosition({
        x: startPos.x + dx,
        y: startPos.y + dy
      });
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setStartPos({ x: position.x, y: position.y });
      touchStartRef.current.x = e.clientX;
      touchStartRef.current.y = e.clientY;
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      const dx = e.clientX - touchStartRef.current.x;
      const dy = e.clientY - touchStartRef.current.y;
      setPosition({
        x: startPos.x + dx,
        y: startPos.y + dy
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-full h-full w-full p-0 bg-overlay-dark/95 border-0"
        aria-describedby="media-viewer-description"
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-overlay-dark/30 hover:bg-overlay-dark/50 transition-colors"
              aria-label="Close viewer"
            >
              <X className="h-6 w-6 text-overlay-light" />
            </button>
            
            <span className="text-overlay-light font-medium">
              {currentIndex + 1} / {images.length}
            </span>
            
            <div className="flex gap-2">
              <button
                onClick={handleDownload}
                className="p-2 rounded-full bg-overlay-dark/30 hover:bg-overlay-dark/50 transition-colors"
                aria-label="Download image"
              >
                <Download className="h-5 w-5 text-overlay-light" />
              </button>
              {navigator.share && (
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-overlay-dark/30 hover:bg-overlay-dark/50 transition-colors"
                  aria-label="Share image"
                >
                  <Share2 className="h-5 w-5 text-overlay-light" />
                </button>
              )}
            </div>
          </div>

          {/* Image container */}
          <div
            ref={imageRef}
            className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onDoubleClick={handleDoubleClick}
          >
            <img
              src={images[currentIndex].url}
              alt={`Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform"
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transformOrigin: 'center'
              }}
              draggable={false}
            />
          </div>

          {/* Navigation buttons */}
          {images.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button
                  onClick={handlePrevious}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-overlay-dark/30 hover:bg-overlay-dark/50 transition-colors z-40"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6 text-overlay-light" />
                </button>
              )}
              
              {currentIndex < images.length - 1 && (
                <button
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-overlay-dark/30 hover:bg-overlay-dark/50 transition-colors z-40"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6 text-overlay-light" />
                </button>
              )}
            </>
          )}

          {/* Zoom indicator */}
          {scale > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-overlay-dark/50 text-overlay-light text-sm">
              {Math.round(scale * 100)}%
            </div>
          )}
        </div>
        <span id="media-viewer-description" className="sr-only">
          Full screen image viewer with zoom and navigation controls
        </span>
      </DialogContent>
    </Dialog>
  );
};
