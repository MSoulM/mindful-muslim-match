import { ReactNode } from 'react';
import { BaseCard } from './BaseCard';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down';
    value: string;
  };
  icon?: ReactNode;
  loading?: boolean;
  className?: string;
}

export const StatCard = ({
  label,
  value,
  trend,
  icon,
  loading = false,
  className,
}: StatCardProps) => {
  if (loading) {
    return (
      <BaseCard padding="md" shadow="sm" className={className}>
        <div className="animate-pulse space-y-3">
          <div className="w-10 h-10 bg-neutral-200 rounded-lg" />
          <div className="space-y-2">
            <div className="h-6 w-20 bg-neutral-200 rounded" />
            <div className="h-4 w-24 bg-neutral-200 rounded" />
          </div>
        </div>
      </BaseCard>
    );
  }

  return (
    <BaseCard padding="md" shadow="sm" className={className}>
      <div className="space-y-3">
        {/* Icon */}
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
            {icon}
          </div>
        )}

        {/* Stats */}
        <div>
          <div className="text-2xl font-bold text-neutral-900 mb-1">
            {value}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-600">{label}</span>
            
            {/* Trend */}
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 text-xs font-medium',
                  trend.direction === 'up' ? 'text-semantic-success' : 'text-semantic-error'
                )}
              >
                {trend.direction === 'up' ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {trend.value}
              </div>
            )}
          </div>
        </div>
      </div>
    </BaseCard>
  );
};
