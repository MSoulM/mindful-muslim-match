import { useState } from 'react';
import { Plus, Minus, ThumbsUp, ThumbsDown } from 'lucide-react';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Button } from '@/components/ui/CustomButton';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItemProps {
  question: string;
  answer: string;
}

export const FAQItem = ({ question, answer }: FAQItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<'yes' | 'no' | null>(null);

  const handleFeedback = (helpful: boolean) => {
    setFeedbackGiven(helpful ? 'yes' : 'no');
    // Track feedback analytics here
  };

  return (
    <BaseCard padding="md" className="mb-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-start justify-between gap-3 text-left"
      >
        <h3 className="font-medium text-foreground flex-1">{question}</h3>
        {isExpanded ? (
          <Minus className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        ) : (
          <Plus className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {answer}
            </div>

            {/* Feedback */}
            {feedbackGiven === null ? (
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2">Was this helpful?</p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFeedback(true);
                    }}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors"
                  >
                    <ThumbsUp className="w-4 h-4 mr-1 inline" />
                    Yes
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFeedback(false);
                    }}
                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:bg-secondary/80 transition-colors"
                  >
                    <ThumbsDown className="w-4 h-4 mr-1 inline" />
                    No
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs text-semantic-success">
                  Thank you for your feedback!
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </BaseCard>
  );
};
