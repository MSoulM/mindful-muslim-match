import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Sparkles, Plus, Bell, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  generateTopicSuggestions,
  scheduleTopicReminder,
  getStreakMessage,
  type TopicSuggestion,
  type UserContext
} from '@/utils/topicSuggestions';
import { toast } from '@/hooks/use-toast';

interface TopicSuggestionsPanelProps {
  userContext: UserContext;
  maxSuggestions?: number;
  showOnlyHighPriority?: boolean;
  onAddContent?: (topicId: string, topicName: string, prompts: string[]) => void;
  variant?: 'full' | 'compact';
}

export const TopicSuggestionsPanel = ({
  userContext,
  maxSuggestions = 3,
  showOnlyHighPriority = false,
  onAddContent,
  variant = 'full'
}: TopicSuggestionsPanelProps) => {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  
  // Generate suggestions
  const allSuggestions = generateTopicSuggestions(userContext);
  
  // Filter and limit suggestions
  const filteredSuggestions = showOnlyHighPriority
    ? allSuggestions.filter(s => s.priority === 'high')
    : allSuggestions;

  const displaySuggestions = filteredSuggestions
    .filter(s => !dismissedSuggestions.has(s.topicId))
    .slice(0, maxSuggestions);

  // Get streak message for motivation
  const streakMessage = getStreakMessage();

  // Handle add content click
  const handleAddContent = (suggestion: TopicSuggestion) => {
    if (onAddContent) {
      onAddContent(suggestion.topicId, suggestion.topicName, suggestion.prompts);
    } else {
      toast({
        title: "Add Content",
        description: `Opening content modal for: ${suggestion.topicName}`,
      });
    }
  };

  // Handle remind later
  const handleRemindLater = (topicId: string, topicName: string) => {
    scheduleTopicReminder(topicId, 'once');
    setDismissedSuggestions(prev => new Set([...prev, topicId]));
    
    toast({
      title: "Reminder Set",
      description: `We'll remind you about "${topicName}" tomorrow`,
    });
  };

  // Priority badge styling
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-orange-100',
          text: 'text-orange-700',
          border: 'border-orange-300',
          label: 'High Priority',
          icon: AlertCircle
        };
      case 'medium':
        return {
          bg: 'bg-blue-100',
          text: 'text-blue-700',
          border: 'border-blue-300',
          label: 'Recommended',
          icon: Info
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-700',
          border: 'border-gray-300',
          label: 'Optional',
          icon: Sparkles
        };
    }
  };

  if (displaySuggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header with Streak Message */}
      {streakMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-3"
        >
          <p className="text-sm font-semibold text-orange-900 text-center">
            {streakMessage}
          </p>
        </motion.div>
      )}

      {/* Suggestions Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">
            {showOnlyHighPriority ? 'Priority Suggestions' : 'Suggested Topics'}
          </h3>
        </div>
        {displaySuggestions.length < allSuggestions.length && (
          <span className="text-xs text-muted-foreground">
            Showing {displaySuggestions.length} of {allSuggestions.length}
          </span>
        )}
      </div>

      {/* Suggestion Cards */}
      <div className={cn(
        'grid gap-4',
        variant === 'compact' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      )}>
        {displaySuggestions.map((suggestion, index) => {
          const priorityConfig = getPriorityConfig(suggestion.priority);
          const PriorityIcon = priorityConfig.icon;

          return (
            <motion.div
              key={suggestion.topicId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                'bg-white rounded-xl border-2 p-4 shadow-sm hover:shadow-md transition-all',
                priorityConfig.border
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <Badge className={cn('px-2.5 py-1 text-xs font-semibold', priorityConfig.bg, priorityConfig.text)}>
                  <PriorityIcon className="w-3 h-3 mr-1" />
                  {priorityConfig.label}
                </Badge>
                <span className="text-xs text-muted-foreground">{suggestion.categoryName}</span>
              </div>

              {/* Topic Name */}
              <h4 className="text-base font-bold text-foreground mb-2 line-clamp-2">
                {suggestion.topicName}
              </h4>

              {/* Reason */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {suggestion.reason}
              </p>

              {/* Metrics */}
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                {/* Impact */}
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-600">
                    +{suggestion.impactOnCompletion.toFixed(1)}%
                  </span>
                </div>

                {/* Time */}
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-muted-foreground">
                    ~{suggestion.estimatedTime} min
                  </span>
                </div>
              </div>

              {/* Prompts Section */}
              {variant === 'full' && suggestion.prompts.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Try these prompts:</p>
                  <ul className="space-y-1.5">
                    {suggestion.prompts.slice(0, 2).map((prompt, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-muted-foreground hover:text-primary cursor-pointer flex items-start gap-1 group"
                        onClick={() => handleAddContent(suggestion)}
                      >
                        <ChevronRight className="w-3 h-3 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                        <span className="line-clamp-2">{prompt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => handleAddContent(suggestion)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 min-h-[40px]"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Content
                </Button>
                
                <Button
                  onClick={() => handleRemindLater(suggestion.topicId, suggestion.topicName)}
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground hover:text-foreground"
                >
                  <Bell className="w-3 h-3 mr-1.5" />
                  Remind Me Later
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Help Text */}
      {variant === 'full' && (
        <p className="text-xs text-center text-muted-foreground mt-4">
          Topics are prioritized based on your profile completion and ChaiChat eligibility
        </p>
      )}
    </div>
  );
};

// ==================== COMPACT VARIANT ====================

interface CompactSuggestionProps {
  suggestion: TopicSuggestion;
  onAddContent: (topicId: string, topicName: string, prompts: string[]) => void;
}

export const CompactTopicSuggestion = ({ suggestion, onAddContent }: CompactSuggestionProps) => {
  const priorityConfig = getPriorityConfig(suggestion.priority);
  const PriorityIcon = priorityConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border-2 bg-white',
        priorityConfig.border
      )}
    >
      {/* Icon */}
      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', priorityConfig.bg)}>
        <PriorityIcon className={cn('w-5 h-5', priorityConfig.text)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">
          {suggestion.topicName}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {suggestion.reason}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-emerald-600 font-semibold">
            +{suggestion.impactOnCompletion.toFixed(1)}%
          </span>
          <span className="text-xs text-muted-foreground">
            ~{suggestion.estimatedTime} min
          </span>
        </div>
      </div>

      {/* Action */}
      <Button
        onClick={() => onAddContent(suggestion.topicId, suggestion.topicName, suggestion.prompts)}
        size="sm"
        className="flex-shrink-0"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </motion.div>
  );
};

// Helper function (shared between components)
function getPriorityConfig(priority: string) {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-300',
        label: 'High Priority',
        icon: AlertCircle
      };
    case 'medium':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-300',
        label: 'Recommended',
        icon: Info
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        label: 'Optional',
        icon: Sparkles
      };
  }
}
