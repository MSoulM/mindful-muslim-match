/**
 * Simplicity Badges Component
 * Reverse milestones celebrating quality over quantity
 */

import { motion } from 'framer-motion';
import { Award, Users, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SimplicityBadge {
  id: string;
  name: string;
  description: string;
  criteria: string;
  icon: 'essence' | 'quality' | 'minimalist';
  earned: boolean;
  rarityPercentage?: number;
  earnedAt?: Date;
}

const BADGE_ICONS = {
  essence: Award,
  quality: Users,
  minimalist: Share2,
};

const SIMPLICITY_BADGES: SimplicityBadge[] = [
  {
    id: 'essence_master',
    name: 'Essence Master',
    description: 'Achieved 60% DNA confidence with less than 500 words total',
    criteria: 'Quality over quantity in self-expression',
    icon: 'essence',
    earned: false,
    rarityPercentage: 5.2,
  },
  {
    id: 'quality_prophet',
    name: 'Quality Prophet',
    description: 'High match success rate with a minimal profile',
    criteria: '3+ meaningful connections with basic profile completion',
    icon: 'quality',
    earned: false,
    rarityPercentage: 3.8,
  },
  {
    id: 'authentic_minimalist',
    name: 'Authentic Minimalist',
    description: 'Deep connections from few but meaningful shares',
    criteria: '5+ quality conversations from <10 total shares',
    icon: 'minimalist',
    earned: true,
    rarityPercentage: 7.1,
    earnedAt: new Date('2024-01-15'),
  },
];

export const SimplicityBadges = () => {
  const earnedBadges = SIMPLICITY_BADGES.filter((badge) => badge.earned);
  const lockedBadges = SIMPLICITY_BADGES.filter((badge) => !badge.earned);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Simplicity Achievements</h2>
        <p className="text-sm text-muted-foreground">
          Rare badges celebrating quality over quantity
        </p>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Your Achievements</h3>
          <div className="grid grid-cols-1 gap-4">
            {earnedBadges.map((badge, index) => (
              <SimplicityBadgeCard key={badge.id} badge={badge} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Locked Badges */}
      {lockedBadges.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">Yet to Unlock</h3>
          <div className="grid grid-cols-1 gap-4">
            {lockedBadges.map((badge, index) => (
              <SimplicityBadgeCard key={badge.id} badge={badge} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const SimplicityBadgeCard = ({ badge, index }: { badge: SimplicityBadge; index: number }) => {
  const IconComponent = BADGE_ICONS[badge.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={cn(
          'p-5 relative overflow-hidden',
          badge.earned && 'border-2 border-amber-400/50 bg-gradient-to-br from-amber-400/5 to-amber-600/5'
        )}
      >
        {/* Gold shimmer effect for earned badges */}
        {badge.earned && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent"
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 5,
            }}
          />
        )}

        {/* Content */}
        <div className="relative flex items-start gap-4">
          {/* Icon */}
          <motion.div
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0',
              badge.earned
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-400/30'
                : 'bg-muted'
            )}
            whileHover={{ scale: 1.05 }}
          >
            <IconComponent
              className={cn('w-7 h-7', badge.earned ? 'text-white' : 'text-muted-foreground')}
            />
          </motion.div>

          {/* Text Content */}
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4
                    className={cn(
                      'font-bold text-base',
                      badge.earned ? 'text-amber-600 dark:text-amber-400' : 'text-foreground'
                    )}
                  >
                    {badge.name}
                  </h4>
                  {badge.earned && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-400 border border-amber-400/30">
                      Rare Achievement
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{badge.description}</p>
              </div>
            </div>

            {/* Criteria */}
            <div className="bg-muted/50 rounded-md p-3 space-y-1">
              <p className="text-xs font-semibold text-foreground">Criteria:</p>
              <p className="text-xs text-muted-foreground">{badge.criteria}</p>
            </div>

            {/* Rarity & Actions */}
            <div className="flex items-center justify-between pt-2">
              {badge.rarityPercentage && (
                <div className="flex items-center gap-1.5 text-xs">
                  <Users className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Only <span className="font-semibold text-foreground">{badge.rarityPercentage}%</span> of users
                  </span>
                </div>
              )}

              {badge.earned && badge.earnedAt && (
                <span className="text-xs text-muted-foreground">
                  Earned {new Date(badge.earnedAt).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Share Button (if earned) */}
            {badge.earned && (
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => {
                  // TODO: Implement share functionality
                  console.log('Share badge:', badge.id);
                }}
              >
                <Share2 className="w-3.5 h-3.5 mr-2" />
                Share Achievement
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
