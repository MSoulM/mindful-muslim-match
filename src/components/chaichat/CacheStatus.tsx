import { motion } from 'framer-motion';
import { Database, Zap, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { AnimatedCounter } from '@/components/ui/animated/AnimatedCounter';
import { cn } from '@/lib/utils';
import { formatCurrency, formatNumber } from '@/utils/formatters';

interface CacheLayer {
  name: string;
  ttl: string;
  hitRate: number;
  savedToday: string;
  status: 'active' | 'warming' | 'inactive';
}

interface CacheStatusData {
  layers: CacheLayer[];
  totalSaved: string;
  avgResponseTime: {
    cached: number; // in ms
    fresh: number; // in ms
  };
}

interface CacheStatusProps {
  data?: CacheStatusData;
  className?: string;
}

const defaultData: CacheStatusData = {
  layers: [
    {
      name: 'ChaiChat Results',
      ttl: '48 hours',
      hitRate: 40,
      savedToday: '$12.50',
      status: 'active',
    },
    {
      name: 'Profile Embeddings',
      ttl: '7 days',
      hitRate: 65,
      savedToday: '$8.30',
      status: 'active',
    },
    {
      name: 'Pattern Cache',
      ttl: '30 days',
      hitRate: 25,
      savedToday: '$4.20',
      status: 'warming',
    },
  ],
  totalSaved: '$25.00',
  avgResponseTime: {
    cached: 450,
    fresh: 5000,
  },
};

export const CacheStatus = ({ data = defaultData, className }: CacheStatusProps) => {
  const overallHitRate = Math.round(
    data.layers.reduce((sum, layer) => sum + layer.hitRate, 0) / data.layers.length
  );

  const speedImprovement = Math.round(
    (data.avgResponseTime.fresh / data.avgResponseTime.cached) * 10
  ) / 10;

  const getStatusColor = (status: CacheLayer['status']) => {
    switch (status) {
      case 'active':
        return 'text-semantic-success';
      case 'warming':
        return 'text-semantic-warning';
      case 'inactive':
        return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status: CacheLayer['status']) => {
    switch (status) {
      case 'active':
        return 'bg-semantic-success/10';
      case 'warming':
        return 'bg-semantic-warning/10';
      case 'inactive':
        return 'bg-muted/50';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Cache Performance Ring */}
      <BaseCard className="p-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div
            className="relative w-40 h-40"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            {/* Background ring */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
                fill="none"
              />
              <motion.circle
                cx="80"
                cy="80"
                r="70"
                stroke="hsl(var(--primary))"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: '440', strokeDashoffset: '440' }}
                animate={{
                  strokeDashoffset: 440 - (440 * overallHitRate) / 100,
                }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
              />
            </svg>
            
            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                className="text-4xl font-bold text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {overallHitRate}%
              </motion.div>
              <div className="text-sm text-muted-foreground">Instant Results</div>
            </div>
          </motion.div>

          <div className="flex items-center gap-2 text-semantic-success">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Cache Operating Efficiently</span>
          </div>
        </div>
      </BaseCard>

      {/* Layer Status Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Database className="w-4 h-4" />
          Cache Layers
        </h3>
        
        {data.layers.map((layer, index) => (
          <motion.div
            key={layer.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <BaseCard className={cn('p-4', getStatusBg(layer.status))}>
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-foreground">{layer.name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      TTL: {layer.ttl}
                    </div>
                  </div>
                  <div className={cn('text-xs font-medium px-2 py-1 rounded-full', getStatusColor(layer.status), getStatusBg(layer.status))}>
                    {layer.status.toUpperCase()}
                  </div>
                </div>

                {/* Hit Rate Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Hit Rate</span>
                    <span className="font-semibold text-foreground">{layer.hitRate}%</span>
                  </div>
                  <Progress value={layer.hitRate} className="h-2" />
                </div>

                {/* Savings */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">Saved Today</span>
                  <div className="flex items-center gap-1 text-semantic-success font-semibold">
                    <DollarSign className="w-3 h-3" />
                    <span>{layer.savedToday.replace('$', '')}</span>
                  </div>
                </div>
              </div>
            </BaseCard>
          </motion.div>
        ))}
      </div>

      {/* Speed Comparison */}
      <BaseCard className="p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Performance Impact
        </h3>

        <div className="space-y-4">
          {/* Cached */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Cached Response</span>
              <span className="font-semibold text-semantic-success">{data.avgResponseTime.cached}ms</span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-semantic-success rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(data.avgResponseTime.cached / data.avgResponseTime.fresh) * 100}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>

          {/* Fresh */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fresh API Call</span>
              <span className="font-semibold text-muted-foreground">{data.avgResponseTime.fresh}ms</span>
            </div>
            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="absolute left-0 top-0 h-full bg-muted-foreground/50 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>

          {/* Badge */}
          <motion.div
            className="flex items-center justify-center gap-2 mt-4 p-3 bg-primary/10 rounded-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            <Zap className="w-5 h-5 text-primary" />
            <span className="font-semibold text-primary">
              {speedImprovement}x faster with cache
            </span>
          </motion.div>
        </div>
      </BaseCard>

      {/* Savings Ticker */}
      <BaseCard className="p-6 bg-gradient-to-br from-semantic-success/5 to-semantic-success/10 border-semantic-success/20">
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">You saved today</div>
            <div className="flex items-center justify-center gap-1">
              <DollarSign className="w-6 h-6 text-semantic-success" />
              <AnimatedCounter
                value={parseFloat(data.totalSaved.replace('$', ''))}
                className="text-4xl font-bold text-semantic-success"
                prefix="$"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-semantic-success/20 text-center">
            <div className="text-xs text-muted-foreground">Projected Monthly Savings</div>
            <div className="text-2xl font-bold text-semantic-success mt-1">
              {formatCurrency(parseFloat(data.totalSaved.replace('$', '')) * 30)}
            </div>
          </div>
        </div>
      </BaseCard>
    </div>
  );
};
