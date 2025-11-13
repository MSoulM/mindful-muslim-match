/**
 * MetricCard Component
 * Displays a key metric with change indicator and sparkline
 */

import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  label: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  sparklineData?: number[];
  trend?: 'up' | 'down' | 'neutral';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const MetricCard = ({
  label,
  value,
  change,
  changeLabel,
  icon,
  sparklineData,
  trend,
  variant = 'default',
  className,
}: MetricCardProps) => {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-muted-foreground';
  };

  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-orange-50 border-orange-200';
      case 'danger':
        return 'bg-red-50 border-red-200';
      default:
        return '';
    }
  };

  return (
    <Card className={cn('p-4', getVariantColor(), className)}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-2">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold">{value}</p>
        {change !== undefined && (
          <span className={cn('text-sm font-medium flex items-center gap-0.5', getTrendColor())}>
            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend === 'down' && <TrendingDown className="h-3 w-3" />}
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>

      {changeLabel && (
        <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>
      )}

      {sparklineData && sparklineData.length > 0 && (
        <div className="h-8 mt-3 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData.map((value, index) => ({ index, value }))}>
              <Line
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};
