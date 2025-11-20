import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, TrendingUp, Sparkles, Plus, Bell, AlertCircle, Info, 
  ChevronRight, Target, ChevronUp, ChevronDown, X, Trophy,
  Lightbulb, Heart, Flame, Book, Users, Home
} from 'lucide-react';
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
  onRemindLater?: (topicId: string) => void;
  onDismiss?: (topicId: string) => void;
  variant?: 'full' | 'compact';
  loading?: boolean;
}

// Category icon mapping
const categoryIcons = {
  values_beliefs: Heart,
  relationship_goals: Flame,
  family_cultural: Home,
  interests_hobbies: Book,
  lifestyle_personality: Users,
} as const;

// Category colors
const categoryColors = {
  values_beliefs: 'text-teal-600 bg-teal-50',
  relationship_goals: 'text-red-600 bg-red-50',
  family_cultural: 'text-orange-600 bg-orange-50',
  interests_hobbies: 'text-purple-600 bg-purple-50',
  lifestyle_personality: 'text-blue-600 bg-blue-50',
} as const;

export const TopicSuggestionsPanel = ({
  userContext,
  maxSuggestions = 3,
  showOnlyHighPriority = false,
  onAddContent,
  onRemindLater,
  onDismiss,
  variant = 'full',
  loading = false
}: TopicSuggestionsPanelProps) => {
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Load collapsed state from sessionStorage
  useEffect(() => {
    const collapsed = sessionStorage.getItem('suggestions_panel_collapsed');
    if (collapsed === 'true') setIsCollapsed(true);
  }, []);

  // Save collapsed state
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    sessionStorage.setItem('suggestions_panel_collapsed', String(newState));
  };

  // Load dismissed suggestions from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('dismissed_suggestions');
    if (dismissed) {
      try {
        setDismissedSuggestions(new Set(JSON.parse(dismissed)));
      } catch {}
    }
  }, []);

  // Generate suggestions
  const allSuggestions = generateTopicSuggestions(userContext);
  
  // Filter and limit suggestions
  const filteredSuggestions = showOnlyHighPriority
    ? allSuggestions.filter(s => s.priority === 'high')
    : allSuggestions;

  const availableSuggestions = filteredSuggestions.filter(
    s => !dismissedSuggestions.has(s.topicId)
  );

  const displaySuggestions = showAll 
    ? availableSuggestions 
    : availableSuggestions.slice(0, maxSuggestions);

  const hasMore = availableSuggestions.length > maxSuggestions;

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
    
    if (onRemindLater) onRemindLater(topicId);
    
    toast({
      title: "Reminder Set",
      description: `We'll remind you about "${topicName}" tomorrow`,
    });
  };

  // Handle dismiss
  const handleDismiss = (topicId: string) => {
    const newDismissed = new Set([...dismissedSuggestions, topicId]);
    setDismissedSuggestions(newDismissed);
    localStorage.setItem('dismissed_suggestions', JSON.stringify([...newDismissed]));
    
    if (onDismiss) onDismiss(topicId);
    
    toast({
      title: "Suggestion Dismissed",
      description: "You won't see this suggestion again",
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 shadow-lg mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
          <p className="text-sm text-muted-foreground">Analyzing your profile...</p>
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg border-2 border-border p-4 animate-pulse">
              <div className="h-6 bg-muted rounded mb-3" />
              <div className="h-4 bg-muted rounded mb-2" />
              <div className="h-3 bg-muted rounded w-3/4" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state - all topics covered
  if (availableSuggestions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-8 shadow-lg mb-6 text-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 1
          }}
        >
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
        </motion.div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          🎉 All Topics Covered!
        </h3>
        <p className="text-base text-muted-foreground mb-4">
          Amazing work! You've covered all required topics across all categories.
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Keep sharing content to strengthen your profile even more!
        </p>
        <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3">
          View My Complete Profile
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-6 shadow-lg mb-6"
    >
      {/* Panel Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Target className="w-8 h-8 text-purple-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              Suggested Topics for You
            </h3>
            <p className="text-sm text-muted-foreground">
              Complete these to improve your profile
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className="hover:bg-muted/50"
        >
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronUp className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Streak Message */}
      {!isCollapsed && streakMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-3 mb-4"
        >
          <p className="text-sm font-semibold text-orange-900 text-center">
            {streakMessage}
          </p>
        </motion.div>
      )}

      {/* Collapsible Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Suggestion Cards */}
            <div className={cn(
              'grid gap-4 mb-4',
              variant === 'compact' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            )}>
              {displaySuggestions.map((suggestion, index) => (
                <SuggestionCard
                  key={suggestion.topicId}
                  suggestion={suggestion}
                  index={index}
                  variant={variant}
                  onAddContent={handleAddContent}
                  onRemindLater={handleRemindLater}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>

            {/* Show More Button */}
            {hasMore && !showAll && (
              <div className="text-center mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(true)}
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                >
                  Show All Suggestions ({availableSuggestions.length - maxSuggestions} more)
                </Button>
              </div>
            )}

            {/* Help Text */}
            {variant === 'full' && (
              <p className="text-xs text-center text-muted-foreground">
                Topics are prioritized based on your profile completion and ChaiChat eligibility
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ==================== SUGGESTION CARD ====================

interface SuggestionCardProps {
  suggestion: TopicSuggestion;
  index: number;
  variant: 'full' | 'compact';
  onAddContent: (suggestion: TopicSuggestion) => void;
  onRemindLater: (topicId: string, topicName: string) => void;
  onDismiss: (topicId: string) => void;
}

const SuggestionCard = ({
  suggestion,
  index,
  variant,
  onAddContent,
  onRemindLater,
  onDismiss
}: SuggestionCardProps) => {
  const [expandedPrompts, setExpandedPrompts] = useState(false);
  const priorityConfig = getPriorityConfig(suggestion.priority);
  const PriorityIcon = priorityConfig.icon;
  const CategoryIcon = categoryIcons[suggestion.category as keyof typeof categoryIcons] || Heart;
  const categoryColorClass = categoryColors[suggestion.category as keyof typeof categoryColors] || 'text-gray-600 bg-gray-50';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'bg-white rounded-lg border-2 p-4 shadow-md hover:shadow-lg transition-all relative',
        priorityConfig.border
      )}
    >
      {/* Priority Badge */}
      <motion.div
        animate={suggestion.priority === 'high' ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1
        }}
        className="absolute top-2 right-2"
      >
        <Badge className={cn('px-2 py-1 text-xs font-bold uppercase', priorityConfig.bg, priorityConfig.text, priorityConfig.border)}>
          {suggestion.priority}
        </Badge>
      </motion.div>

      {/* Dismiss Button */}
      <button
        onClick={() => onDismiss(suggestion.topicId)}
        className="absolute top-2 left-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Dismiss suggestion"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Category Icon */}
      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center mb-3 mt-6', categoryColorClass)}>
        <CategoryIcon className="w-6 h-6" />
      </div>

      {/* Topic Name */}
      <h4 className="text-lg font-bold text-foreground mb-1 line-clamp-2">
        {suggestion.topicName}
      </h4>

      {/* Category Label */}
      <p className="text-xs text-muted-foreground uppercase mb-3">
        {suggestion.categoryName}
      </p>

      {/* Reason Section */}
      <div className={cn(
        'border-l-4 rounded-md p-3 mb-3',
        priorityConfig.reasonBg,
        priorityConfig.reasonBorder
      )}>
        <div className="flex items-start gap-2">
          <Lightbulb className={cn('w-5 h-5 flex-shrink-0', priorityConfig.reasonIcon)} />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {suggestion.reason}
          </p>
        </div>
      </div>

      {/* Impact Indicators */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-md">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="text-sm font-semibold text-green-700">
            +{suggestion.impactOnCompletion.toFixed(1)}%
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded-md">
          <Clock className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-blue-700">
            ~{suggestion.estimatedTime} min
          </span>
        </div>
      </div>

      {/* Prompts Section */}
      {variant === 'full' && suggestion.prompts.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            Try these prompts:
          </p>
          <ul className="space-y-1.5">
            {suggestion.prompts.slice(0, expandedPrompts ? undefined : 2).map((prompt, idx) => (
              <li
                key={idx}
                className="text-sm text-muted-foreground hover:text-purple-700 cursor-pointer flex items-start gap-1 group hover:underline"
                onClick={() => onAddContent(suggestion)}
              >
                <span className="mt-1">•</span>
                <span className="line-clamp-1 group-hover:line-clamp-none">
                  {prompt}
                </span>
              </li>
            ))}
          </ul>
          {suggestion.prompts.length > 2 && (
            <button
              onClick={() => setExpandedPrompts(!expandedPrompts)}
              className="text-xs text-purple-600 hover:underline mt-1"
            >
              {expandedPrompts ? 'Show less' : 'See more prompts'}
            </button>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={() => onAddContent(suggestion)}
          className={cn(
            'w-full min-h-[40px]',
            priorityConfig.buttonClass
          )}
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Content
        </Button>
        
        <div className="flex gap-2">
          <Button
            onClick={() => onRemindLater(suggestion.topicId, suggestion.topicName)}
            variant="outline"
            size="sm"
            className={cn('flex-1 text-xs', priorityConfig.secondaryButton)}
          >
            <Bell className="w-3 h-3 mr-1.5" />
            Remind Later
          </Button>
        </div>
      </div>
    </motion.div>
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

// Helper function for priority configuration
function getPriorityConfig(priority: string) {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-orange-100',
        text: 'text-orange-700',
        border: 'border-orange-400',
        label: 'High Priority',
        icon: AlertCircle,
        buttonClass: 'bg-orange-500 hover:bg-orange-600 text-white',
        secondaryButton: 'border-orange-400 text-orange-700 hover:bg-orange-50',
        reasonBg: 'bg-orange-50',
        reasonBorder: 'border-orange-400',
        reasonIcon: 'text-orange-600'
      };
    case 'medium':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-400',
        label: 'Recommended',
        icon: Info,
        buttonClass: 'bg-blue-500 hover:bg-blue-600 text-white',
        secondaryButton: 'border-blue-400 text-blue-700 hover:bg-blue-50',
        reasonBg: 'bg-blue-50',
        reasonBorder: 'border-blue-400',
        reasonIcon: 'text-blue-600'
      };
    default:
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        label: 'Optional',
        icon: Sparkles,
        buttonClass: 'bg-gray-500 hover:bg-gray-600 text-white',
        secondaryButton: 'border-gray-300 text-gray-700 hover:bg-gray-50',
        reasonBg: 'bg-gray-50',
        reasonBorder: 'border-gray-300',
        reasonIcon: 'text-gray-600'
      };
  }
}
