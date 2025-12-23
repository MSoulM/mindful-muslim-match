/**
 * Rarity Badge Component
 * Displays the user's rarity tier with appropriate styling
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Star, Zap, Gem, Sparkles, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RarityTier, RARITY_CONFIG } from '@/hooks/useDNAScore';

const RARITY_ICONS: Record<RarityTier, typeof Star> = {
  Common: Star,
  Uncommon: Zap,
  Rare: Gem,
  Epic: Sparkles,
  Legendary: Crown
};

interface RarityBadgeProps {
  tier: RarityTier;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
  animated?: boolean;
  className?: string;
}

export const RarityBadge = memo(({
  tier,
  score,
  size = 'md',
  showScore = false,
  animated = true,
  className
}: RarityBadgeProps) => {
  const config = RARITY_CONFIG[tier];
  const Icon = RARITY_ICONS[tier];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-3 py-1.5 text-sm gap-1.5',
    lg: 'px-4 py-2 text-base gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (!animated) {
    return (
      <div
        className={cn(
          'inline-flex items-center rounded-full font-semibold text-white',
          `bg-gradient-to-r ${config.bgGradient}`,
          sizeClasses[size],
          className
        )}
        style={{
          boxShadow: `0 4px 14px ${config.glowColor}`
        }}
      >
        <Icon className={iconSizes[size]} />
        <span>{tier}</span>
        {showScore && score !== undefined && (
          <span className="opacity-80">• {score}</span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', bounce: 0.4 }}
      className={cn(
        'inline-flex items-center rounded-full font-semibold text-white',
        `bg-gradient-to-r ${config.bgGradient}`,
        sizeClasses[size],
        className
      )}
      style={{
        boxShadow: `0 4px 14px ${config.glowColor}`
      }}
    >
      <Icon className={iconSizes[size]} />
      <span>{tier}</span>
      {showScore && score !== undefined && (
        <span className="opacity-80">• {score}</span>
      )}
    </motion.div>
  );
});

RarityBadge.displayName = 'RarityBadge';
