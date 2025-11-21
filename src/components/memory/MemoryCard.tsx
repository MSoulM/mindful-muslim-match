import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  Calendar, 
  Tag, 
  Trash2, 
  Shield,
  MessageSquare 
} from 'lucide-react';
import { ConversationMemory } from '@/types/memory.types';
import { ImportanceBadge } from './ImportanceBadge';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface MemoryCardProps {
  memory: ConversationMemory;
  onDelete?: (id: string) => void;
  onImportanceChange?: (id: string, importance: ConversationMemory['importance']) => void;
  className?: string;
}

const categoryConfig = {
  life_events: { label: 'Life Events', color: 'bg-purple-100 text-purple-700' },
  preferences: { label: 'Preferences', color: 'bg-blue-100 text-blue-700' },
  emotional_moments: { label: 'Emotional', color: 'bg-pink-100 text-pink-700' },
  feedback: { label: 'Feedback', color: 'bg-green-100 text-green-700' }
};

export function MemoryCard({ 
  memory, 
  onDelete, 
  onImportanceChange,
  className 
}: MemoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = () => {
    if (memory.importance === 'high' && !showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    onDelete?.(memory.id);
  };

  const categoryInfo = categoryConfig[memory.category];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'bg-card rounded-lg border border-border overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <ImportanceBadge 
                level={memory.importance}
                editable={!!onImportanceChange}
                onEdit={(newLevel) => {
                  onImportanceChange?.(memory.id, newLevel);
                }}
              />
              <Badge variant="secondary" className={categoryInfo.color}>
                {categoryInfo.label}
              </Badge>
            </div>
            
            <p className="text-sm font-medium text-foreground line-clamp-2">
              {memory.summary}
            </p>
            
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(memory.dateCreated, 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {memory.metadata.messageCount} messages
              </span>
            </div>
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          </motion.div>
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border"
          >
            <div className="p-4 space-y-4">
              {/* Full Text */}
              <div>
                <h4 className="text-xs font-semibold text-foreground mb-2">
                  Full Context
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {memory.fullText}
                </p>
              </div>

              {/* Topics */}
              {memory.topics.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {memory.topics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {memory.metadata.emotionalTone && (
                <div>
                  <h4 className="text-xs font-semibold text-foreground mb-1">
                    Emotional Tone
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {memory.metadata.emotionalTone}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleDelete}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors',
                    showDeleteConfirm
                      ? 'bg-destructive text-destructive-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                  )}
                >
                  <Trash2 className="w-3 h-3 inline mr-1.5" />
                  {showDeleteConfirm ? 'Confirm Delete' : 'Delete Memory'}
                </button>
                
                {showDeleteConfirm && (
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="py-2 px-3 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-accent"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {/* High Priority Warning */}
              {memory.importance === 'high' && !showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg"
                >
                  <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    This is a high-priority memory. You'll need to confirm deletion.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
