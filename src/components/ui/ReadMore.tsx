import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadMoreProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export const ReadMore = ({ text, maxLength = 150, className }: ReadMoreProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate && !isExpanded 
    ? text.slice(0, maxLength) + '...' 
    : text;

  if (!shouldTruncate) {
    return <p className={cn('text-sm text-muted-foreground leading-relaxed', className)}>{text}</p>;
  }

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        <motion.p
          key={isExpanded ? 'expanded' : 'collapsed'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="text-sm text-muted-foreground leading-relaxed"
        >
          {displayText}
        </motion.p>
      </AnimatePresence>
      
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-2 flex items-center gap-1 text-sm font-medium text-primary hover:underline focus:outline-none"
      >
        {isExpanded ? (
          <>
            Show less
            <ChevronUp className="w-4 h-4" />
          </>
        ) : (
          <>
            Read more
            <ChevronDown className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};
