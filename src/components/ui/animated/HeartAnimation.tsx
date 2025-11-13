import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { haptics } from '@/utils/haptics';

interface HeartAnimationProps {
  isLiked?: boolean;
  onToggle?: (liked: boolean) => void;
  size?: number;
  className?: string;
}

export const HeartAnimation = ({ 
  isLiked = false, 
  onToggle,
  size = 24,
  className 
}: HeartAnimationProps) => {
  const [liked, setLiked] = useState(isLiked);

  const handleClick = () => {
    const newLikedState = !liked;
    setLiked(newLikedState);
    
    if (newLikedState) {
      haptics.like();
    } else {
      haptics.unlike();
    }
    
    onToggle?.(newLikedState);
  };

  return (
    <motion.button
      onClick={handleClick}
      className={cn('relative', className)}
      whileTap={{ scale: 0.8 }}
      aria-label={liked ? 'Unlike' : 'Like'}
    >
      {/* Heart Icon */}
      <motion.div
        animate={{
          scale: liked ? [1, 1.3, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={cn(
            'transition-colors duration-200',
            liked ? 'fill-semantic-error text-semantic-error' : 'text-muted-foreground'
          )}
          size={size}
        />
      </motion.div>

      {/* Burst particles */}
      {liked && (
        <motion.div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute top-1/2 left-1/2 w-1 h-1 bg-semantic-error rounded-full"
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: [0, 1, 0],
                x: Math.cos((i * 60 * Math.PI) / 180) * 20,
                y: Math.sin((i * 60 * Math.PI) / 180) * 20,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          ))}
        </motion.div>
      )}
    </motion.button>
  );
};
