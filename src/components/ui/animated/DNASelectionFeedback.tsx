import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { haptics } from '@/utils/haptics';

interface DNASelectionFeedbackProps {
  children: ReactNode;
  isSelected: boolean;
  onSelect?: () => void;
  className?: string;
  categoryColor?: string;
}

export const DNASelectionFeedback = ({
  children,
  isSelected,
  onSelect,
  className,
  categoryColor = 'hsl(var(--primary))',
}: DNASelectionFeedbackProps) => {
  const handleClick = () => {
    haptics.tap();
    onSelect?.();
  };

  return (
    <motion.div
      onClick={handleClick}
      className={cn(
        'relative cursor-pointer rounded-xl transition-colors',
        isSelected ? 'bg-primary/10' : 'bg-background',
        className
      )}
      whileTap={{ scale: 0.98 }}
      animate={{
        borderColor: isSelected ? categoryColor : 'transparent',
      }}
      style={{
        borderWidth: 2,
        borderStyle: 'solid',
      }}
    >
      {children}

      {/* Selection indicator */}
      <motion.div
        className="absolute top-2 right-2"
        initial={false}
        animate={{
          scale: isSelected ? 1 : 0,
          opacity: isSelected ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: categoryColor }}
        >
          <motion.svg
            width="12"
            height="10"
            viewBox="0 0 12 10"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: isSelected ? 1 : 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <motion.path
              d="M1 5L4.5 8.5L11 1.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        </div>
      </motion.div>

      {/* Ripple effect on selection */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          initial={{ opacity: 0.5, scale: 0.8 }}
          animate={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            background: `radial-gradient(circle, ${categoryColor}40 0%, transparent 70%)`,
          }}
        />
      )}
    </motion.div>
  );
};
