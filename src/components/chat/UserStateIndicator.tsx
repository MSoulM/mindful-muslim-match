import { motion } from 'framer-motion';
import { 
  User, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertCircle, 
  CheckCircle2,
  Activity,
  Heart,
  MessageSquare
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

export type EngagementLevel = 'active' | 'moderate' | 'inactive';
export type ConcernType = 'no_matches' | 'no_responses' | 'profile_incomplete' | 'long_gap' | null;

export interface UserState {
  profileCompletion: number; // 0-100
  lastMatchDate?: Date;
  engagementLevel: EngagementLevel;
  currentConcern?: ConcernType;
  concernMessage?: string;
}

interface UserStateIndicatorProps {
  userState: UserState;
  variant?: 'full' | 'compact' | 'inline';
  className?: string;
}

export const UserStateIndicator = ({
  userState,
  variant = 'full',
  className
}: UserStateIndicatorProps) => {
  const {
    profileCompletion,
    lastMatchDate,
    engagementLevel,
    currentConcern,
    concernMessage
  } = userState;

  const daysSinceMatch = lastMatchDate
    ? Math.floor((Date.now() - lastMatchDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  const showMatchReminder = daysSinceMatch !== null && daysSinceMatch > 7;

  if (variant === 'inline') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {currentConcern && (
          <ConcernPill concern={currentConcern} message={concernMessage} />
        )}
        <EngagementBadge level={engagementLevel} compact />
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <ProfileCompletionCompact completion={profileCompletion} />
        <EngagementBadge level={engagementLevel} />
        {showMatchReminder && <MatchReminder days={daysSinceMatch!} />}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* Profile Completion */}
      <ProfileCompletion completion={profileCompletion} />

      {/* Engagement & Match Status */}
      <div className="flex items-center gap-3">
        <EngagementBadge level={engagementLevel} />
        {showMatchReminder && <MatchReminder days={daysSinceMatch!} />}
      </div>

      {/* Current Concern */}
      {currentConcern && (
        <ConcernPill concern={currentConcern} message={concernMessage} />
      )}
    </div>
  );
};

// Profile Completion Component
interface ProfileCompletionProps {
  completion: number;
}

const ProfileCompletion = ({ completion }: ProfileCompletionProps) => {
  const getColor = () => {
    if (completion >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (completion >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getMessage = () => {
    if (completion >= 80) return 'Great profile! You\'re ready to find matches.';
    if (completion >= 50) return 'Good progress! Complete your profile to improve matches.';
    return 'Complete your profile to start finding compatible matches.';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="space-y-2 cursor-help">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Profile</span>
              </div>
              <span className={cn("font-semibold", getColor())}>
                {completion}%
              </span>
            </div>
            <Progress value={completion} className="h-2" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">{getMessage()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ProfileCompletionCompact = ({ completion }: ProfileCompletionProps) => {
  const getColor = () => {
    if (completion >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (completion >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 cursor-help">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className={cn("text-sm font-semibold", getColor())}>
              {completion}%
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Profile Completion</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Engagement Badge Component
interface EngagementBadgeProps {
  level: EngagementLevel;
  compact?: boolean;
}

const EngagementBadge = ({ level, compact = false }: EngagementBadgeProps) => {
  const getConfig = () => {
    switch (level) {
      case 'active':
        return {
          icon: TrendingUp,
          label: 'Active',
          color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
          tooltip: 'Regularly engaging with matches and conversations'
        };
      case 'moderate':
        return {
          icon: Activity,
          label: 'Moderate',
          color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
          tooltip: 'Occasional engagement - consider being more active'
        };
      case 'inactive':
        return {
          icon: TrendingDown,
          label: 'Inactive',
          color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          tooltip: 'Low engagement - reconnect with your matches!'
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn(config.color, "gap-1.5 cursor-help")}>
            <Icon className={cn("w-3 h-3", compact ? "w-3.5 h-3.5" : "")} />
            {!compact && <span className="text-xs font-medium">{config.label}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Match Reminder Component
interface MatchReminderProps {
  days: number;
}

const MatchReminder = ({ days }: MatchReminderProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full cursor-help"
          >
            <Clock className="w-3 h-3" />
            <span className="text-xs font-medium">{days}d</span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">
            It's been {days} days since your last match. Consider reviewing new profiles!
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Concern Pill Component
interface ConcernPillProps {
  concern: ConcernType;
  message?: string;
}

const ConcernPill = ({ concern, message }: ConcernPillProps) => {
  if (!concern) return null;

  const getConfig = () => {
    switch (concern) {
      case 'no_matches':
        return {
          icon: Heart,
          label: 'No Matches Yet',
          color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          defaultMessage: 'Complete your profile to start finding matches'
        };
      case 'no_responses':
        return {
          icon: MessageSquare,
          label: 'Low Response Rate',
          color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
          defaultMessage: 'Try engaging more actively with your matches'
        };
      case 'profile_incomplete':
        return {
          icon: User,
          label: 'Profile Incomplete',
          color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
          defaultMessage: 'Complete your profile to improve match quality'
        };
      case 'long_gap':
        return {
          icon: Clock,
          label: 'Long Absence',
          color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
          defaultMessage: 'Welcome back! Check out new matches'
        };
      default:
        return null;
    }
  };

  const config = getConfig();
  if (!config) return null;

  const Icon = config.icon;
  const displayMessage = message || config.defaultMessage;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full cursor-help",
              config.color
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{config.label}</span>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-xs">{displayMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
