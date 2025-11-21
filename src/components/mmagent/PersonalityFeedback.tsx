import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ThumbsUp, ThumbsDown, RotateCcw, X } from 'lucide-react';
import { PersonalityAdjustment, AdjustmentType } from '@/types/personality.types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

const adjustmentTypeLabels: Record<AdjustmentType, string> = {
  warmer: 'warm and friendly',
  more_formal: 'formal and professional',
  more_casual: 'casual and relaxed',
  more_empathetic: 'empathetic and understanding',
  more_direct: 'direct and straightforward',
  more_encouraging: 'encouraging and supportive',
  more_analytical: 'analytical and detailed',
};

interface PersonalityFeedbackProps {
  adjustment: PersonalityAdjustment;
  onLike: () => void;
  onDislike: () => void;
  onRevert: () => void;
  onDismiss: () => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-right';
  className?: string;
}

export const PersonalityFeedback = ({
  adjustment,
  onLike,
  onDislike,
  onRevert,
  onDismiss,
  position = 'bottom-right',
  className,
}: PersonalityFeedbackProps) => {
  const positionClasses = {
    'bottom-left': 'bottom-20 left-4 right-4 md:left-4 md:right-auto md:w-96',
    'bottom-right': 'bottom-20 right-4 left-4 md:left-auto md:right-4 md:w-96',
    'top-right': 'top-20 right-4 left-4 md:left-auto md:right-4 md:w-96',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: position.includes('bottom') ? 20 : -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: position.includes('bottom') ? 20 : -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'fixed z-50',
        positionClasses[position],
        className
      )}
    >
      <div className="bg-card rounded-xl shadow-lg border-l-4 border-primary overflow-hidden">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h4 className="font-semibold text-sm text-foreground">
                  MMAgent Evolved!
                </h4>
                <button
                  onClick={onDismiss}
                  className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                Based on your interactions, I've adjusted to be{' '}
                <span className="font-medium text-primary">
                  {adjustmentTypeLabels[adjustment.adjustmentType]}
                </span>
                . {adjustment.reason}
              </p>

              {/* Feedback Options */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={onLike}
                    className="flex-1 text-xs h-8"
                  >
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Love it!
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onDislike}
                    className="flex-1 text-xs h-8"
                  >
                    <ThumbsDown className="w-3 h-3 mr-1" />
                    Not for me
                  </Button>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onRevert}
                  className="w-full text-xs h-8"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Revert to Previous
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <motion.div
          className="h-1 bg-primary"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 10, ease: 'linear' }}
          onAnimationComplete={onDismiss}
        />
      </div>
    </motion.div>
  );
};

interface PersonalityFeedbackContainerProps {
  adjustment: PersonalityAdjustment | null;
  onLike: () => void;
  onDislike: () => void;
  onRevert: () => void;
  onDismiss: () => void;
  position?: 'bottom-left' | 'bottom-right' | 'top-right';
}

export const PersonalityFeedbackContainer = ({
  adjustment,
  onLike,
  onDislike,
  onRevert,
  onDismiss,
  position = 'bottom-right',
}: PersonalityFeedbackContainerProps) => {
  return (
    <AnimatePresence>
      {adjustment && (
        <PersonalityFeedback
          adjustment={adjustment}
          onLike={onLike}
          onDislike={onDislike}
          onRevert={onRevert}
          onDismiss={onDismiss}
          position={position}
        />
      )}
    </AnimatePresence>
  );
};
