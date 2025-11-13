/**
 * SystemHealthCard Component
 * Displays system health metric with status indicator
 */

import { Activity, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'offline';

interface SystemHealthCardProps {
  metric: {
    name: string;
    value: string | number;
    unit?: string;
    status: HealthStatus;
    threshold?: {
      warning: number;
      critical: number;
    };
    change?: number;
    lastUpdated?: string;
  };
  icon?: React.ReactNode;
  onViewDetails?: () => void;
  compact?: boolean;
  className?: string;
}

export const SystemHealthCard = ({
  metric,
  icon,
  onViewDetails,
  compact = false,
  className,
}: SystemHealthCardProps) => {
  const getStatusConfig = (): {
    color: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  } => {
    switch (metric.status) {
      case 'healthy':
        return {
          color: 'text-green-600 bg-green-50',
          icon: CheckCircle,
          label: 'Healthy',
        };
      case 'warning':
        return {
          color: 'text-orange-600 bg-orange-50',
          icon: AlertCircle,
          label: 'Warning',
        };
      case 'critical':
        return {
          color: 'text-red-600 bg-red-50',
          icon: AlertCircle,
          label: 'Critical',
        };
      case 'offline':
        return {
          color: 'text-gray-600 bg-gray-50',
          icon: XCircle,
          label: 'Offline',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const isInteractive = !!onViewDetails;

  return (
    <Card
      className={cn(
        'overflow-hidden',
        isInteractive && 'cursor-pointer hover:border-primary transition-colors',
        className
      )}
      onClick={onViewDetails}
    >
      <div className={cn('p-4', compact && 'p-3')}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {icon && (
              <div className={cn('p-2 rounded-lg', statusConfig.color)}>
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className={cn('font-medium truncate', compact ? 'text-sm' : 'text-base')}>
                {metric.name}
              </p>
            </div>
          </div>

          <Badge
            variant="outline"
            className={cn('flex items-center gap-1', statusConfig.color)}
          >
            <StatusIcon className="h-3 w-3" />
            <span className="text-xs">{statusConfig.label}</span>
          </Badge>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-2 mb-2">
          <p className={cn('font-bold', compact ? 'text-xl' : 'text-2xl')}>
            {metric.value}
          </p>
          {metric.unit && (
            <span className="text-sm text-muted-foreground">{metric.unit}</span>
          )}
          {metric.change !== undefined && (
            <span
              className={cn(
                'text-sm font-medium',
                metric.change > 0 ? 'text-red-600' : 'text-green-600'
              )}
            >
              {metric.change > 0 ? '+' : ''}{metric.change}%
            </span>
          )}
        </div>

        {/* Threshold Info */}
        {metric.threshold && !compact && (
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Warning: {metric.threshold.warning}{metric.unit}</p>
            <p>Critical: {metric.threshold.critical}{metric.unit}</p>
          </div>
        )}

        {/* Last Updated */}
        {metric.lastUpdated && (
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Activity className="h-3 w-3" />
            <span>Updated {new Date(metric.lastUpdated).toLocaleTimeString()}</span>
          </div>
        )}
      </div>
    </Card>
  );
};
