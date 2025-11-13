/**
 * RadarChart Component
 * Pentagon/hexagon radar chart for DNA/skill visualization
 */

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RadarDataPoint {
  category: string;
  current: number;
  previous?: number;
  [key: string]: any;
}

interface RadarChartProps {
  data: RadarDataPoint[];
  title?: string;
  dataKeys?: string[];
  colors?: string[];
  showLegend?: boolean;
  maxValue?: number;
  height?: number;
  onExport?: () => void;
  className?: string;
}

export const RadarChart = ({
  data,
  title,
  dataKeys = ['current'],
  colors = ['hsl(var(--primary))', 'hsl(var(--muted-foreground))'],
  showLegend = true,
  maxValue = 100,
  height = 400,
  onExport,
  className,
}: RadarChartProps) => {
  return (
    <Card className={cn('p-4', className)}>
      {(title || onExport) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-semibold">{title}</h3>}
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
        </div>
      )}

      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsRadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, maxValue]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
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
              const name = key.charAt(0).toUpperCase() + key.slice(1);

              return (
                <Radar
                  key={key}
                  name={name}
                  dataKey={key}
                  stroke={color}
                  fill={color}
                  fillOpacity={index === 0 ? 0.6 : 0.3}
                />
              );
            })}
          </RechartsRadarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend for categories */}
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-muted-foreground">{item.category}</span>
            <span className="font-semibold">{item.current}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
