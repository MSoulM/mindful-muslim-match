import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ExternalLink, Calendar, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ConversationMemory } from '@/types/memory.types';
import { Badge } from '@/components/ui/badge';

interface MemoryReferenceProps {
  memory: ConversationMemory;
  onViewContext?: (conversationId: string) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

export const MemoryReference = ({
  memory,
  onViewContext,
  variant = 'default',
  className,
}: MemoryReferenceProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleViewContext = () => {
    if (onViewContext) {
      onViewContext(memory.conversationId);
    }
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2 p-2 bg-blue-50 rounded-lg text-xs', className)}>
        <Brain className="w-3 h-3 text-blue-600 flex-shrink-0" />
        <span className="text-blue-700 font-medium truncate">
          From {formatDistanceToNow(memory.dateCreated, { addSuffix: true })}
        </span>
        {onViewContext && (
          <button
            onClick={handleViewContext}
            className="text-blue-600 hover:text-blue-700 ml-auto"
          >
            <ExternalLink className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={cn('mb-3', className)}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl overflow-hidden"
      >
        {/* Header - Always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-3 flex items-start gap-3 hover:bg-blue-50/50 transition-colors text-left"
        >
          <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
            <Brain className="w-4 h-4 text-blue-600" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-semibold text-blue-700">
                Remembering from conversation
              </p>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-300 text-blue-700">
                {memory.importance}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-blue-600">
              <Calendar className="w-3 h-3" />
              <span>{formatDistanceToNow(memory.dateCreated, { addSuffix: true })}</span>
              <span className="text-blue-400">•</span>
              <MessageSquare className="w-3 h-3" />
              <span>{memory.metadata.messageCount} messages</span>
            </div>

            {!isExpanded && (
              <p className="text-xs text-blue-700 italic mt-1.5 line-clamp-1">
                "{memory.summary}"
              </p>
            )}
          </div>

          <ChevronDown
            className={cn(
              'w-4 h-4 text-blue-600 transition-transform flex-shrink-0 mt-1',
              isExpanded && 'rotate-180'
            )}
          />
        </button>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-blue-200"
            >
              <div className="p-4 space-y-3">
                {/* Summary */}
                <div>
                  <p className="text-xs font-medium text-blue-900 mb-1">
                    Memory Summary
                  </p>
                  <p className="text-xs text-blue-700 italic leading-relaxed">
                    "{memory.summary}"
                  </p>
                </div>

                {/* Full Context (truncated) */}
                <div>
                  <p className="text-xs font-medium text-blue-900 mb-1">
                    Context
                  </p>
                  <p className="text-xs text-blue-600 leading-relaxed line-clamp-3">
                    {memory.fullText}
                  </p>
                </div>

                {/* Topics */}
                {memory.topics.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-blue-900 mb-1.5">
                      Related Topics
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {memory.topics.map(topic => (
                        <Badge
                          key={topic}
                          variant="secondary"
                          className="text-[10px] bg-blue-100 text-blue-700 border-blue-200"
                        >
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Metadata */}
                {memory.metadata.emotionalTone && (
                  <div className="flex items-center gap-2 text-[11px] text-blue-600">
                    <span className="font-medium">Emotional Tone:</span>
                    <span className="capitalize">{memory.metadata.emotionalTone}</span>
                  </div>
                )}

                {/* View Full Context Button */}
                {onViewContext && (
                  <button
                    onClick={handleViewContext}
                    className="w-full mt-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Full Conversation
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

interface MemoryReferencesListProps {
  memories: ConversationMemory[];
  onViewContext?: (conversationId: string) => void;
  maxVisible?: number;
  className?: string;
}

export const MemoryReferencesList = ({
  memories,
  onViewContext,
  maxVisible = 3,
  className,
}: MemoryReferencesListProps) => {
  const [showAll, setShowAll] = useState(false);

  const displayedMemories = showAll ? memories : memories.slice(0, maxVisible);
  const hasMore = memories.length > maxVisible;

  if (memories.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-4 h-4 text-blue-600" />
        <p className="text-xs font-semibold text-blue-700">
          Using {memories.length} {memories.length === 1 ? 'memory' : 'memories'} from past conversations
        </p>
      </div>

      {displayedMemories.map(memory => (
        <MemoryReference
          key={memory.id}
          memory={memory}
          onViewContext={onViewContext}
          variant="default"
        />
      ))}

      {hasMore && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Show {memories.length - maxVisible} more {memories.length - maxVisible === 1 ? 'memory' : 'memories'}
        </button>
      )}

      {showAll && hasMore && (
        <button
          onClick={() => setShowAll(false)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Show less
        </button>
      )}
    </div>
  );
};
