import { motion } from 'framer-motion';
import { Sprout, Leaf, TreeDeciduous, TreePine, Sparkles } from 'lucide-react';
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
  journeyProgress?: {
    stage: 'seed' | 'sprout' | 'growth' | 'rooted' | 'transcendent';
    stageLabel: string;
    progressPercentage: number;
    daysInStage: number;
  };
}

const STAGE_ICONS = {
  seed: Sprout,
  sprout: Leaf,
  growth: TreeDeciduous,
  rooted: TreePine,
  transcendent: Sparkles,
};

const STAGE_COLORS = {
  seed: '#86efac',
  sprout: '#5eead4',
  growth: '#34d399',
  rooted: '#059669',
  transcendent: '#fbbf24',
};

export const DNAStatsCard = ({
  title,
  mainStat,
  subStats,
  gradient = 'default',
  className,
  journeyProgress,
}: DNAStatsCardProps) => {
  const gradients = {
    default: 'from-primary-forest to-[#4A8B8C]',
    gold: 'from-primary-gold to-primary-forest',
    pink: 'from-primary-pink to-primary-gold',
  };

  const StageIcon = journeyProgress ? STAGE_ICONS[journeyProgress.stage] : null;
  const stageColor = journeyProgress ? STAGE_COLORS[journeyProgress.stage] : null;

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

        <div className="flex items-start gap-6">
          {/* Main Stat */}
          <div className={cn("flex-1", journeyProgress && "mb-4")}>
            <div className="text-5xl font-bold text-white mb-1">
              {mainStat.value}%
            </div>
            <p className="text-md text-white/90 font-medium">
              {mainStat.label}
            </p>
          </div>

          {/* Journey Progress Ring */}
          {journeyProgress && StageIcon && stageColor && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="flex-shrink-0"
            >
              <div className="relative w-24 h-24">
                {/* Background Circle */}
                <svg className="absolute inset-0 w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.2)"
                    strokeWidth="6"
                  />
                  {/* Progress Circle */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke={stageColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: journeyProgress.progressPercentage / 100 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{
                      strokeDasharray: '264', // 2 * π * 42
                    }}
                  />
                </svg>

                {/* Center Icon */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <StageIcon className="w-7 h-7 text-white mb-1" />
                  <span className="text-xs font-bold text-white/90">
                    {journeyProgress.daysInStage}d
                  </span>
                </div>
              </div>
              
              {/* Stage Label */}
              <p className="text-[10px] text-white/80 text-center mt-1 font-medium">
                {journeyProgress.stageLabel}
              </p>
            </motion.div>
          )}
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
