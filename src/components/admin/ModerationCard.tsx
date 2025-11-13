/**
 * ModerationCard Component
 * Displays moderation report with swipe actions
 */

import { AlertTriangle, User, FileText, MoreVertical, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export type ReportPriority = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'pending' | 'reviewing' | 'resolved' | 'dismissed';

interface ModerationCardProps {
  report: {
    id: string;
    reportType: string;
    priority: ReportPriority;
    status: ReportStatus;
    reportedUser: {
      name: string;
      photo?: string;
    };
    reporter: {
      name: string;
    };
    reason: string;
    description: string;
    contentPreview?: string;
    createdAt: string;
  };
  onReview?: () => void;
  onResolve?: () => void;
  onDismiss?: () => void;
  onViewDetails?: () => void;
  showActions?: boolean;
  className?: string;
}

export const ModerationCard = ({
  report,
  onReview,
  onResolve,
  onDismiss,
  onViewDetails,
  showActions = true,
  className,
}: ModerationCardProps) => {
  const getPriorityBadge = () => {
    const variants: Record<ReportPriority, { variant: any; label: string }> = {
      low: { variant: 'secondary', label: 'Low' },
      medium: { variant: 'default', label: 'Medium' },
      high: { variant: 'destructive', label: 'High' },
      critical: { variant: 'destructive', label: 'Critical' },
    };

    const config = variants[report.priority];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = () => {
    switch (report.status) {
      case 'reviewing':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'dismissed':
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            {getPriorityBadge()}
            <Badge variant="outline" className="text-xs">
              {report.reportType}
            </Badge>
            <div className="flex items-center gap-1">
              {getStatusIcon()}
              <span className="text-xs text-muted-foreground capitalize">
                {report.status}
              </span>
            </div>
          </div>
          {onViewDetails && (
            <Button variant="ghost" size="icon" onClick={onViewDetails}>
              <MoreVertical className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Reported User */}
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={report.reportedUser.photo} />
            <AvatarFallback>
              <User className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">{report.reportedUser.name}</p>
            <p className="text-xs text-muted-foreground">
              Reported by {report.reporter.name}
            </p>
          </div>
        </div>

        {/* Reason */}
        <div className="mb-3">
          <p className="text-sm font-medium mb-1">{report.reason}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {report.description}
          </p>
        </div>

        {/* Content Preview */}
        {report.contentPreview && (
          <div className="bg-muted rounded-lg p-3 mb-3">
            <p className="text-xs text-muted-foreground mb-1">Content:</p>
            <p className="text-sm line-clamp-2">{report.contentPreview}</p>
          </div>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mb-3">
          {new Date(report.createdAt).toLocaleString()}
        </p>

        {/* Actions */}
        {showActions && report.status === 'pending' && (
          <div className="flex gap-2">
            {onReview && (
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={onReview}
              >
                Review
              </Button>
            )}
            {onResolve && (
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={onResolve}
              >
                Resolve
              </Button>
            )}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={onDismiss}
              >
                Dismiss
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
