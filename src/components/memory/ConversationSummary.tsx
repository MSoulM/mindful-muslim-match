import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Pin, 
  Trash2, 
  ChevronDown,
  Calendar,
  Tag
} from 'lucide-react';
import { ConversationMemory } from '@/types/memory.types';
import { ImportanceBadge } from './ImportanceBadge';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ConversationSummaryProps {
  memory: ConversationMemory;
  searchQuery?: string;
  isPinned?: boolean;
  onPin?: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewFull?: (id: string) => void;
  className?: string;
}

const categoryConfig = {
  life_events: { label: 'Life Events', color: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  preferences: { label: 'Preferences', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  emotional_moments: { label: 'Emotional', color: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300' },
  feedback: { label: 'Feedback', color: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300' }
};

function highlightKeywords(text: string, searchQuery?: string): React.ReactNode {
  if (!searchQuery || searchQuery.trim() === '') {
    return text;
  }

  const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
  
  return parts.map((part, index) => {
    if (part.toLowerCase() === searchQuery.toLowerCase()) {
      return (
        <mark 
          key={index} 
          className="bg-amber-200 dark:bg-amber-900 text-foreground font-medium px-0.5 rounded"
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function ConversationSummary({
  memory,
  searchQuery,
  isPinned = false,
  onPin,
  onDelete,
  onViewFull,
  className
}: ConversationSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const categoryInfo = categoryConfig[memory.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      className={cn(
        'bg-card rounded-lg border border-border overflow-hidden transition-shadow',
        isPinned && 'border-primary/50 bg-primary/5',
        className
      )}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <MessageCircle className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 inline mr-1" />
              {format(memory.dateCreated, 'MMM d, yyyy')}
            </span>
            <Badge variant="secondary" className={cn('text-xs', categoryInfo.color)}>
              {categoryInfo.label}
            </Badge>
          </div>
          <ImportanceBadge level={memory.importance} />
        </div>

        {/* Summary Content */}
        <p 
          className={cn(
            'text-sm text-foreground mb-2',
            !isExpanded && 'line-clamp-2'
          )}
        >
          {highlightKeywords(memory.summary, searchQuery)}
        </p>

        {/* Expanded Full Text */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {highlightKeywords(memory.fullText, searchQuery)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Extracted Topics */}
        {memory.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {memory.topics.map((topic, index) => {
              const isHighlighted = searchQuery && 
                topic.toLowerCase().includes(searchQuery.toLowerCase());
              
              return (
                <span
                  key={index}
                  className={cn(
                    'px-2 py-0.5 text-xs rounded-full inline-flex items-center gap-1',
                    isHighlighted
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 font-medium'
                      : 'bg-accent text-accent-foreground'
                  )}
                >
                  <Tag className="w-3 h-3" />
                  {highlightKeywords(topic, searchQuery)}
                </span>
              );
            })}
          </div>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-3 mb-3 text-xs text-muted-foreground">
          <span>{memory.metadata.messageCount} messages</span>
          {memory.metadata.emotionalTone && (
            <>
              <span>•</span>
              <span>{memory.metadata.emotionalTone}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              {isExpanded ? 'Show less' : 'View full conversation'}
              <ChevronDown 
                className={cn(
                  'w-3 h-3 transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            </button>
            {onViewFull && !isExpanded && (
              <button
                onClick={() => onViewFull(memory.id)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Open in detail
              </button>
            )}
          </div>

          <div className="flex gap-1">
            {onPin && (
              <button
                onClick={() => onPin(memory.id)}
                className={cn(
                  'p-1.5 rounded hover:bg-accent transition-colors',
                  isPinned && 'bg-primary/10 text-primary'
                )}
                title={isPinned ? 'Unpin' : 'Pin'}
              >
                <Pin className={cn('w-3.5 h-3.5', isPinned && 'fill-current')} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(memory.id)}
                className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Pinned Indicator */}
        {isPinned && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 pt-2 border-t border-border"
          >
            <div className="flex items-center gap-1.5 text-xs text-primary">
              <Pin className="w-3 h-3 fill-current" />
              <span className="font-medium">Pinned Memory</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
