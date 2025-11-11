import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseCard } from '@/components/ui/Cards/BaseCard';

interface ChaiChatTopicCardProps {
  topic: string;
  alignment: 'aligned' | 'different' | 'exploring';
  yourView: string;
  theirView: string;
  expanded?: boolean;
  onToggle?: () => void;
  className?: string;
}

const alignmentConfig = {
  aligned: {
    icon: '✅',
    color: 'text-semantic-success',
    bg: 'bg-semantic-success/10',
    label: 'Aligned',
  },
  different: {
    icon: '⚡',
    color: 'text-semantic-warning',
    bg: 'bg-semantic-warning/10',
    label: 'Different Views',
  },
  exploring: {
    icon: '🔍',
    color: 'text-semantic-info',
    bg: 'bg-semantic-info/10',
    label: 'Exploring',
  },
};

export const ChaiChatTopicCard = ({
  topic,
  alignment,
  yourView,
  theirView,
  expanded = false,
  onToggle,
  className,
}: ChaiChatTopicCardProps) => {
  const config = alignmentConfig[alignment];

  return (
    <BaseCard
      padding="md"
      shadow="sm"
      interactive={!!onToggle}
      onClick={onToggle}
      className={className}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Alignment Icon */}
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0', config.bg)}>
            <span className="text-xl">{config.icon}</span>
          </div>

          {/* Topic */}
          <div className="flex-1 min-w-0">
            <h3 className="text-md font-semibold text-neutral-900 mb-1">
              {topic}
            </h3>
            <span className={cn('text-xs font-medium', config.color)}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Expand Button */}
        {onToggle && (
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown className="w-5 h-5 text-neutral-400" />
          </motion.div>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3">
              {/* Your View */}
              <div className="bg-primary-forest/5 rounded-lg p-3">
                <p className="text-xs font-semibold text-primary-forest mb-1">
                  Your View
                </p>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {yourView}
                </p>
              </div>

              {/* Their View */}
              <div className="bg-primary-gold/5 rounded-lg p-3">
                <p className="text-xs font-semibold text-primary-gold mb-1">
                  Their View
                </p>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {theirView}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </BaseCard>
  );
};
