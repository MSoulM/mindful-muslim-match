import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DNAStatsCardProps {
  title?: string;
  mainStat: {
    value: number;
    label: string;
  };
  subStats?: Array<{
    value: number;
    label: string;
  }>;
  gradient?: 'default' | 'gold' | 'pink';
  className?: string;
}

export const DNAStatsCard = ({
  title,
  mainStat,
  subStats,
  gradient = 'default',
  className,
}: DNAStatsCardProps) => {
  const gradients = {
    default: 'from-primary-forest to-[#4A8B8C]',
    gold: 'from-primary-gold to-primary-forest',
    pink: 'from-primary-pink to-primary-gold',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'relative rounded-2xl p-6 overflow-hidden',
        `bg-gradient-to-br ${gradients[gradient]}`,
        className
      )}
    >
      {/* Glass morphism overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10">
        {title && (
          <h3 className="text-sm font-semibold text-white/80 mb-4 uppercase tracking-wide">
            {title}
          </h3>
        )}

        {/* Main Stat */}
        <div className="mb-4">
          <div className="text-5xl font-bold text-white mb-1">
            {mainStat.value}%
          </div>
          <p className="text-md text-white/90 font-medium">
            {mainStat.label}
          </p>
        </div>

        {/* Sub Stats */}
        {subStats && subStats.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {subStats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-white/80">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Decorative circles */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
    </motion.div>
  );
};
