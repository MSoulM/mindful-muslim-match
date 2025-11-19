/**
 * Milestone Rewards Component
 * Displays reward cards for stage achievements
 */

import { motion } from 'framer-motion';
import { Award, Trophy, Star, Crown, Sparkles, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { MilestoneReward } from '@/types/journey.types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface MilestoneRewardsProps {
  reward: MilestoneReward;
  showCelebration?: boolean;
}

const RARITY_CONFIG = {
  common: {
    color: '#94a3b8',
    gradient: 'from-slate-400 to-slate-600',
    label: 'Common',
  },
  rare: {
    color: '#3b82f6',
    gradient: 'from-blue-400 to-blue-600',
    label: 'Rare',
  },
  epic: {
    color: '#a855f7',
    gradient: 'from-purple-400 to-purple-600',
    label: 'Epic',
  },
  legendary: {
    color: '#f59e0b',
    gradient: 'from-amber-400 to-amber-600',
    label: 'Legendary',
  },
};

const REWARD_ICONS = {
  welcome: Award,
  compass: Trophy,
  analysis: Star,
  priority: Crown,
  matchmaker: Sparkles,
};

export const MilestoneRewards = ({ reward, showCelebration = false }: MilestoneRewardsProps) => {
  // Trigger confetti on mount if celebration mode
  useEffect(() => {
    if (showCelebration) {
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.6 },
          colors: ['#86efac', '#34d399', '#fbbf24'],
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.6 },
          colors: ['#86efac', '#34d399', '#fbbf24'],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [showCelebration]);

  const rarity = reward.rarity || 'common';
  const rarityConfig = RARITY_CONFIG[rarity];
  const IconComponent = REWARD_ICONS[reward.icon as keyof typeof REWARD_ICONS] || Award;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <Card className={cn(
        'relative overflow-hidden p-6',
        rarity === 'legendary' && 'border-2 border-amber-400/50 shadow-lg shadow-amber-400/20'
      )}>
        {/* Islamic Pattern Background */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${rarityConfig.color} 2%, transparent 2%),
                            radial-gradient(circle at 75% 75%, ${rarityConfig.color} 2%, transparent 2%)`,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Content */}
        <div className="relative space-y-4">
          {/* Header with Icon */}
          <div className="flex items-start gap-4">
            {/* Animated Icon */}
            <motion.div
              className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center',
                'bg-gradient-to-br shadow-lg',
                rarityConfig.gradient
              )}
              animate={{
                boxShadow: showCelebration
                  ? [
                      `0 0 20px ${rarityConfig.color}`,
                      `0 0 40px ${rarityConfig.color}`,
                      `0 0 20px ${rarityConfig.color}`,
                    ]
                  : undefined,
              }}
              transition={{
                duration: 1.5,
                repeat: showCelebration ? Infinity : 0,
              }}
            >
              <IconComponent className="w-8 h-8 text-white" />
            </motion.div>

            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-xl text-foreground">{reward.name}</h3>
                {showCelebration && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xs font-semibold px-2 py-1 rounded-full bg-primary text-primary-foreground"
                  >
                    NEW!
                  </motion.span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{reward.description}</p>
            </div>
          </div>

          {/* Rarity Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" style={{ color: rarityConfig.color }} />
              <span className="text-xs font-semibold" style={{ color: rarityConfig.color }}>
                {rarityConfig.label} Achievement
              </span>
            </div>

            {reward.unlockedAt && (
              <span className="text-xs text-muted-foreground">
                {new Date(reward.unlockedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          {/* Actions (if newly unlocked) */}
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-2 border-t border-border flex gap-2"
            >
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  // TODO: Implement share functionality
                  console.log('Share achievement');
                }}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Achievement
              </Button>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

// Gallery view for all earned badges
export const MilestoneRewardsGallery = ({ rewards }: { rewards: MilestoneReward[] }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Your Achievements</h3>
        <span className="text-sm text-muted-foreground">{rewards.length} earned</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rewards.map((reward) => (
          <MilestoneRewards key={reward.id} reward={reward} />
        ))}
      </div>
    </div>
  );
};
