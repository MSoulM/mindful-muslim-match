/**
 * GrowthChart Component
 * Line/Area chart for growth tracking
 */

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DataPoint {
  date: string;
  value: number;
  [key: string]: any;
}

interface GrowthChartProps {
  data: DataPoint[];
  title?: string;
  dataKeys?: string[];
  chartType?: 'line' | 'area';
  showLegend?: boolean;
  showGrid?: boolean;
  height?: number;
  colors?: string[];
  onExport?: () => void;
  className?: string;
}

export const GrowthChart = ({
  data,
  title,
  dataKeys = ['value'],
  chartType = 'line',
  showLegend = false,
  showGrid = true,
  height = 300,
  colors = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'],
  onExport,
  className,
}: GrowthChartProps) => {
  const Chart = chartType === 'area' ? AreaChart : LineChart;

  return (
    <Card className={cn('p-4', className)}>
      {(title || onExport) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">{title}</h3>
            </div>
          )}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              Export
            </Button>
          )}
        </div>
      )}

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <Chart data={data}>
            {showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            )}
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
            />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            {showLegend && <Legend />}

            {dataKeys.map((key, index) => {
              const color = colors[index % colors.length];
              
              if (chartType === 'area') {
                return (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={color}
                    fill={color}
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                );
              }

              return (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              );
            })}
          </Chart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
