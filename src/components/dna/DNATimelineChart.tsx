import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DNATimelineChartProps {
  data: Array<{
    month: string;
    value: number;
  }>;
  currentIndex: number;
  color?: 'primary' | 'gold' | 'pink';
  className?: string;
}

export const DNATimelineChart = ({
  data,
  currentIndex,
  color = 'primary',
  className,
}: DNATimelineChartProps) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const colors = {
    primary: {
      line: 'stroke-primary-forest',
      dot: 'bg-primary-forest',
      glow: 'shadow-primary-forest/30',
    },
    gold: {
      line: 'stroke-primary-gold',
      dot: 'bg-primary-gold',
      glow: 'shadow-primary-gold/30',
    },
    pink: {
      line: 'stroke-primary-pink',
      dot: 'bg-primary-pink',
      glow: 'shadow-primary-pink/30',
    },
  };

  const colorScheme = colors[color];

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-40 flex items-end justify-between gap-4 px-4">
        {/* SVG Path for connecting line */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <motion.path
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            d={`M ${data.map((point, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - ((point.value / maxValue) * 80);
              return `${i === 0 ? 'M' : 'L'} ${x}% ${y}%`;
            }).join(' ')}`}
            fill="none"
            strokeWidth="2"
            className={colorScheme.line}
            strokeLinecap="round"
          />
        </svg>

        {/* Data Points */}
        {data.map((point, index) => {
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;
          const height = (point.value / maxValue) * 120;

          return (
            <div
              key={index}
              className="relative flex flex-col items-center flex-1"
              style={{ height: `${height}px` }}
            >
              {/* Dot */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                className={cn(
                  'rounded-full border-2 border-white mb-2',
                  isCurrent
                    ? `w-5 h-5 ${colorScheme.dot} shadow-lg ${colorScheme.glow}`
                    : isPast
                    ? `w-3 h-3 ${colorScheme.dot}`
                    : 'w-3 h-3 bg-neutral-300'
                )}
              />

              {/* Value */}
              {isCurrent && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-8 text-sm font-bold text-neutral-900"
                >
                  {point.value}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {/* Month Labels */}
      <div className="flex justify-between mt-4 px-4">
        {data.map((point, index) => (
          <div
            key={index}
            className={cn(
              'text-xs text-center flex-1',
              index === currentIndex
                ? 'font-semibold text-neutral-900'
                : 'text-neutral-500'
            )}
          >
            {point.month}
          </div>
        ))}
      </div>
    </div>
  );
};
