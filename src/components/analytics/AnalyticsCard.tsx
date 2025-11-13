/**
 * AnalyticsCard Component
 * General-purpose analytics display card
 */

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsCardProps {
  title: string;
  description?: string;
  value?: string | number;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
  };
  icon?: React.ReactNode;
  children?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  onMore?: () => void;
  variant?: 'default' | 'highlight' | 'muted';
  className?: string;
}

export const AnalyticsCard = ({
  title,
  description,
  value,
  badge,
  icon,
  children,
  action,
  onMore,
  variant = 'default',
  className,
}: AnalyticsCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'highlight':
        return 'border-primary bg-primary/5';
      case 'muted':
        return 'bg-muted/50';
      default:
        return '';
    }
  };

  return (
    <Card className={cn('p-4', getVariantStyles(), className)}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {icon && (
            <div className="flex-shrink-0 mt-1">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold truncate">{title}</h3>
              {badge && (
                <Badge
                  variant={
                    badge.variant === 'success' ? 'default' :
                    badge.variant === 'warning' ? 'secondary' :
                    badge.variant === 'destructive' ? 'destructive' :
                    badge.variant as any
                  }
                  className={cn(
                    badge.variant === 'success' && 'bg-green-100 text-green-800',
                    badge.variant === 'warning' && 'bg-orange-100 text-orange-800'
                  )}
                >
                  {badge.text}
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        {onMore && (
          <Button variant="ghost" size="icon" onClick={onMore}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Value */}
      {value !== undefined && (
        <div className="mb-3">
          <p className="text-3xl font-bold">{value}</p>
        </div>
      )}

      {/* Children Content */}
      {children && <div className="mb-3">{children}</div>}

      {/* Action Button */}
      {action && (
        <Button
          variant="outline"
          size="sm"
          onClick={action.onClick}
          className="w-full group"
        >
          {action.label}
          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      )}
    </Card>
  );
};
