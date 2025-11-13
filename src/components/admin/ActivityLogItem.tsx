/**
 * ActivityLogItem Component
 * Individual activity log entry with icon and details
 */

import {
  LogIn,
  LogOut,
  FileText,
  MessageSquare,
  Heart,
  Settings,
  AlertTriangle,
  User,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type ActivityType = 'login' | 'logout' | 'post' | 'message' | 'match' | 'report' | 'setting' | 'other';

interface ActivityLogItemProps {
  activity: {
    id: string;
    action: string;
    actionType: ActivityType;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: string;
  };
  showIp?: boolean;
  showDetails?: boolean;
  compact?: boolean;
  className?: string;
}

const activityIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  login: LogIn,
  logout: LogOut,
  post: FileText,
  message: MessageSquare,
  match: Heart,
  report: AlertTriangle,
  setting: Settings,
  other: User,
};

const activityColors: Record<ActivityType, string> = {
  login: 'text-green-600 bg-green-50',
  logout: 'text-gray-600 bg-gray-50',
  post: 'text-blue-600 bg-blue-50',
  message: 'text-purple-600 bg-purple-50',
  match: 'text-pink-600 bg-pink-50',
  report: 'text-orange-600 bg-orange-50',
  setting: 'text-slate-600 bg-slate-50',
  other: 'text-gray-600 bg-gray-50',
};

export const ActivityLogItem = ({
  activity,
  showIp = false,
  showDetails = true,
  compact = false,
  className,
}: ActivityLogItemProps) => {
  const Icon = activityIcons[activity.actionType] || activityIcons.other;
  const colorClass = activityColors[activity.actionType] || activityColors.other;

  return (
    <div className={cn('flex items-start gap-3 py-3', className)}>
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 p-2 rounded-lg',
          colorClass,
          compact && 'p-1.5'
        )}
      >
        <Icon className={cn('h-4 w-4', compact && 'h-3 w-3')} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className={cn('font-medium', compact ? 'text-sm' : 'text-base')}>
              {activity.action}
            </p>
            {showDetails && activity.details && (
              <p className={cn('text-muted-foreground mt-1', compact ? 'text-xs' : 'text-sm')}>
                {activity.details}
              </p>
            )}
          </div>

          <Badge variant="outline" className="text-xs flex-shrink-0">
            {activity.actionType}
          </Badge>
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-xs text-muted-foreground">
            {new Date(activity.timestamp).toLocaleString()}
          </span>

          {showIp && activity.ipAddress && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground font-mono">
                {activity.ipAddress}
              </span>
            </>
          )}

          {!compact && activity.userAgent && (
            <>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {activity.userAgent}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
