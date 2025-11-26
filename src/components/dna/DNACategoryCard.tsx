import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import fingerprintIcon from '@/assets/mysouldna-fingerprint.png';
interface DNACategoryCardProps {
  category: string;
  categoryId?: string;
  icon: React.ReactNode;
  completion: number;
  rarity?: 'common' | 'rare' | 'epic' | 'ultra-rare';
  percentile?: number;
  trend?: 'up' | 'down' | 'stable';
  onClick?: () => void;
  className?: string;
}
// DNA category color mapping using semantic tokens
const categoryColors: Record<string, string> = {
  'values': 'dna-values',
  'interests': 'dna-interests',
  'personality': 'dna-personality',
  'lifestyle': 'dna-lifestyle',
  'goals': 'dna-goals'
};
const rarityEmoji = {
  'ultra-rare': '🏆',
  'epic': '💜',
  'rare': '💎',
  'common': '⭐'
};
const rarityColors = {
  'ultra-rare': 'bg-gradient-to-r from-primary-gold to-primary-pink',
  'epic': 'bg-gradient-to-r from-purple-500 to-primary-pink',
  'rare': 'bg-gradient-to-r from-primary-forest to-primary-gold',
  'common': 'bg-gradient-to-r from-neutral-400 to-neutral-500'
};
export const DNACategoryCard = ({
  category,
  categoryId,
  icon,
  completion,
  rarity = 'common',
  percentile,
  trend,
  onClick,
  className
}: DNACategoryCardProps) => {
  // Get fingerprint color from category
  const fingerprintColor = categoryId ? `hsl(var(--dna-${categoryId}))` : 'hsl(var(--primary-forest))';
  return <BaseCard padding="md" shadow="sm" interactive={!!onClick} onClick={onClick} className={cn('min-h-[96px]', className)}>
    <div className="flex items-start gap-4">
      {/* Icon */}
      <motion.div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br from-primary-forest/10 to-primary-gold/10", "flex items-center justify-center flex-shrink-0 relative", "shadow-[0_0_20px_rgba(10,58,46,0.2)]")} whileHover={{
        boxShadow: "0 0 24px rgba(10,58,46,0.24)"
      }} whileTap={{
        boxShadow: "0 0 24px rgba(10,58,46,0.24)"
      }} transition={{
        duration: 0.2
      }}>

        <div className="absolute inset-0 w-7 h-7 object-contain opacity-80" style={{
          WebkitMaskImage: `url(${fingerprintIcon})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: `url(${fingerprintIcon})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          backgroundColor: fingerprintColor
        }} />
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-md font-semibold text-neutral-900 mb-2">
          {category}
        </h3>

        {/* Completion Row */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Completion */}
          <span className="text-sm text-neutral-600">
            {completion}% Complete
          </span>

          {/* Rarity Badge */}
          {rarity && <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold text-white', rarityColors[rarity])}>
            <span>{rarityEmoji[rarity]}</span>
            <span className="capitalize">{rarity.replace('-', ' ')}</span>
          </span>}

          {/* Percentile */}
          {percentile !== undefined && <span className="text-xs text-primary-forest font-medium">
            Top {percentile}%
          </span>}

          {/* Trend */}
          {trend && trend !== 'stable' && <span className={cn('text-xs font-medium', trend === 'up' ? 'text-semantic-success' : 'text-semantic-error')}>
            {trend === 'up' ? '↑' : '↓'}
          </span>}
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-neutral-200 rounded-full overflow-hidden">
          <motion.div initial={{
            width: 0
          }} animate={{
            width: `${completion}%`
          }} transition={{
            duration: 0.8,
            ease: 'easeOut'
          }} className="h-full bg-gradient-to-r from-primary-forest to-primary-gold" />
        </div>
      </div>

      {/* Chevron */}
      {onClick && <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />}
    </div>
  </BaseCard>;
};