/**
 * MySoul DNA™ Visual Component
 * Displays the user's DNA score with rarity tier badge and DNA helix animation
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Dna, Sparkles, Zap, Crown, Star, Gem, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDNAScore, RARITY_CONFIG, RarityTier, isDNASeedState } from '@/hooks/useDNAScore';
import { useOriginality } from '@/hooks/useOriginality';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Rarity tier icons
const RARITY_ICONS: Record<RarityTier, typeof Star> = {
  COMMON: Star,
  UNCOMMON: Zap,
  RARE: Gem,
  EPIC: Sparkles,
  LEGENDARY: Crown
};

interface MySoulDNAProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const MySoulDNA = memo(({ variant = 'full', className }: MySoulDNAProps) => {
  const { dnaScore, loading, rarityConfig } = useDNAScore();
  const { originality, loading: originalityLoading } = useOriginality();

  if (loading) {
    return (
      <div className={cn('animate-pulse', className)}>
        <div className="bg-muted rounded-2xl h-48" />
      </div>
    );
  }

  // Check if DNA is not ready (rarity_tier is null or missing)
  const isNotReady = !dnaScore || !dnaScore.rarityTier || !rarityConfig;
  
  if (isNotReady) {
    return (
      <div className={cn('bg-card rounded-2xl p-6 border border-border text-center', className)}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
        >
          <Dna className="w-12 h-12 mx-auto mb-3 text-muted-foreground animate-pulse" />
          <p className="text-lg font-semibold text-foreground mb-2">DNA Seed Planted</p>
          <p className="text-sm text-muted-foreground mb-4">
            {dnaScore?.approvedInsightsCount !== undefined && dnaScore.approvedInsightsCount < 5 && (
              <>You need at least 5 approved insights to calculate your DNA score. You have {dnaScore.approvedInsightsCount}.</>
            )}
            {dnaScore?.daysActive !== undefined && dnaScore.daysActive < 7 && (
              <>You need at least 7 days of activity. You have {dnaScore.daysActive} day{dnaScore.daysActive !== 1 ? 's' : ''}.</>
            )}
            {(!dnaScore?.approvedInsightsCount || dnaScore.approvedInsightsCount >= 5) && 
             (!dnaScore?.daysActive || dnaScore.daysActive >= 7) && (
              <>Keep engaging to build your DNA profile.</>
            )}
            {!dnaScore && (
              <>Start sharing to build your DNA</>
            )}
          </p>
        </motion.div>
      </div>
    );
  }

  // Check if DNA is in seed state (score = 0 but tier exists - should not happen, but handle gracefully)
  const isSeedState = isDNASeedState(dnaScore);
  
  if (isSeedState && dnaScore.rarityTier === 'COMMON' && dnaScore.score === 0) {
    return (
      <div className={cn('bg-card rounded-2xl p-6 border border-border text-center', className)}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
        >
          <Dna className="w-12 h-12 mx-auto mb-3 text-muted-foreground animate-pulse" />
          <p className="text-lg font-semibold text-foreground mb-2">DNA Seed Planted</p>
          <p className="text-sm text-muted-foreground mb-4">
            {dnaScore.approvedInsightsCount !== undefined && dnaScore.approvedInsightsCount < 5 && (
              <>You need at least 5 approved insights to calculate your DNA score. You have {dnaScore.approvedInsightsCount}.</>
            )}
            {dnaScore.daysActive !== undefined && dnaScore.daysActive < 7 && (
              <>You need at least 7 days of activity. You have {dnaScore.daysActive} day{dnaScore.daysActive !== 1 ? 's' : ''}.</>
            )}
            {(!dnaScore.approvedInsightsCount || dnaScore.approvedInsightsCount >= 5) && 
             (!dnaScore.daysActive || dnaScore.daysActive >= 7) && (
              <>Keep engaging to build your DNA profile.</>
            )}
          </p>
        </motion.div>
      </div>
    );
  }

  // Extract tier and verify it's valid
  const tier = rarityConfig.tier;
  
  // Safeguard: If tier is unknown or not in RARITY_ICONS, show "DNA not ready"
  if (!tier || !RARITY_ICONS[tier]) {
    return (
      <div className={cn('bg-card rounded-2xl p-6 border border-border text-center', className)}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', bounce: 0.4 }}
        >
          <Dna className="w-12 h-12 mx-auto mb-3 text-muted-foreground animate-pulse" />
          <p className="text-lg font-semibold text-foreground mb-2">DNA not ready</p>
          <p className="text-sm text-muted-foreground">
            Your DNA score is being calculated. Please check back later.
          </p>
        </motion.div>
      </div>
    );
  }

  const { color, bgGradient, glowColor, description } = rarityConfig;
  const RarityIcon = RARITY_ICONS[tier];

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'bg-gradient-to-br rounded-2xl p-4 shadow-lg relative overflow-hidden',
          bgGradient,
          className
        )}
        style={{
          boxShadow: tier === 'UNCOMMON' || tier === 'RARE' || tier === 'EPIC' || tier === 'LEGENDARY'
            ? `0 8px 32px ${glowColor}`
            : `0 4px 16px ${glowColor}`
        }}
      >
        {/* Tier-specific effects for compact variant */}
        {tier === 'RARE' && (
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{ backgroundColor: glowColor }}
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {tier === 'EPIC' && (
          <motion.div
            className="absolute inset-0 opacity-15"
            style={{
              background: `linear-gradient(45deg, transparent 30%, ${glowColor} 50%, transparent 70%)`,
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />
        )}
        {tier === 'LEGENDARY' && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: color,
                  left: `${20 + i * 15}%`,
                  top: '50%',
                }}
                animate={{
                  y: [-20, 20, -20],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
        )}
        
        <div className="relative z-10 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Dna className="w-5 h-5" />
            <span className="font-semibold text-sm">MySoul DNA™</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{dnaScore.score}</span>
            <RarityIcon className="w-5 h-5" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative rounded-2xl overflow-hidden',
        className
      )}
    >
      {/* Background with tier-specific effects */}
      <div 
        className={cn('absolute inset-0 bg-gradient-to-br', bgGradient)}
        style={{
          boxShadow: `inset 0 0 60px ${glowColor}`
        }}
      />
      
      {/* Tier-specific visual effects */}
      {tier === 'UNCOMMON' && (
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 70%)`,
            animation: 'pulse 3s ease-in-out infinite'
          }}
        />
      )}
      {tier === 'RARE' && (
        <motion.div 
          className="absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${glowColor} 0%, transparent 70%)`,
          }}
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
      {tier === 'EPIC' && (
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: `linear-gradient(45deg, transparent 30%, ${glowColor} 50%, transparent 70%)`,
            }}
            animate={{
              x: ['-100%', '200%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        </div>
      )}
      {tier === 'LEGENDARY' && (
        <div className="absolute inset-0 overflow-hidden">
          <ParticleEffect color={color} />
        </div>
      )}
      
      {/* DNA Helix Animation */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <DNAHelixAnimation color={color} />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6 text-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Dna className="w-6 h-6" />
            <span className="font-bold text-lg">MySoul DNA™</span>
          </div>
          
          {/* Rarity Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
            className="flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5"
          >
            <RarityIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">{tier}</span>
          </motion.div>
        </div>

        {/* Score Display */}
        <div className="text-center py-6">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', bounce: 0.4 }}
            className="relative inline-block"
          >
            {/* Glow ring - tier-specific animation */}
            <motion.div 
              className="absolute inset-0 rounded-full blur-xl"
              style={{ backgroundColor: glowColor }}
              animate={
                tier === 'COMMON' 
                  ? {} // Basic - no animation
                  : tier === 'UNCOMMON' || tier === 'RARE'
                  ? { opacity: [0.3, 0.7, 0.3], scale: [1, 1.1, 1] } // Pulse
                  : tier === 'EPIC'
                  ? { opacity: [0.4, 0.8, 0.4], scale: [1, 1.15, 1] } // Shimmer pulse
                  : { opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] } // Legendary strong pulse
              }
              transition={{
                duration: tier === 'LEGENDARY' ? 1.5 : 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            {/* Score circle */}
            <div className="relative w-32 h-32 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border-2 border-white/30">
              <div className="text-center">
                <span className="text-5xl font-bold">{dnaScore.score}</span>
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-4 text-sm opacity-90"
          >
            {description}
          </motion.p>
        </div>

        {/* Score Breakdown - Five DNA Strands */}
        <div className="grid grid-cols-5 gap-2 mt-4">
          <ScoreBreakdownItem
            label="Trait Rarity"
            value={dnaScore.traitRarityScore}
            maxValue={35}
            delay={0.6}
            weight="35%"
          />
          <ScoreBreakdownItem
            label="Profile Depth"
            value={dnaScore.profileDepthScore}
            maxValue={25}
            delay={0.65}
            weight="25%"
          />
          <ScoreBreakdownItem
            label="Behavioral"
            value={dnaScore.behavioralScore}
            maxValue={20}
            delay={0.7}
            weight="20%"
          />
          <ScoreBreakdownItem
            label="Content"
            value={dnaScore.contentScore}
            maxValue={15}
            delay={0.75}
            weight="15%"
          />
          <ScoreBreakdownItem
            label="Cultural"
            value={dnaScore.culturalScore}
            maxValue={5}
            delay={0.8}
            weight="5%"
          />
        </div>

        {/* Originality Metric */}
        {!originalityLoading && originality && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-3"
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center justify-between cursor-help">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      <span className="text-xs font-medium">Content Originality</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{originality.score}</div>
                      <div className="text-xs opacity-75">{originality.label}</div>
                      {originality.percentile !== null && (
                        <div className="text-xs opacity-60">Top {(100 - originality.percentile).toFixed(0)}%</div>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{originality.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

MySoulDNA.displayName = 'MySoulDNA';

// Score breakdown item component
const ScoreBreakdownItem = memo(({ 
  label, 
  value, 
  maxValue, 
  delay,
  weight
}: { 
  label: string; 
  value: number; 
  maxValue: number; 
  delay: number;
  weight?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white/10 backdrop-blur-sm rounded-xl p-2 text-center"
  >
    <div className="text-sm font-bold">{value}</div>
    <div className="text-xs opacity-75 leading-tight">{label}</div>
    {weight && (
      <div className="text-xs opacity-60 mt-0.5">{weight}</div>
    )}
    <div className="mt-1 h-1 bg-white/20 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / maxValue) * 100}%` }}
        transition={{ delay: delay + 0.2, duration: 0.8 }}
        className="h-full bg-white/60 rounded-full"
      />
    </div>
  </motion.div>
));

ScoreBreakdownItem.displayName = 'ScoreBreakdownItem';

// DNA Helix animation component
const DNAHelixAnimation = memo(({ color }: { color: string }) => {
  return (
    <div className="absolute inset-0">
      {/* Animated helix strands */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-full h-1 rounded-full"
          style={{
            backgroundColor: color,
            top: `${10 + i * 12}%`,
            transformOrigin: 'center'
          }}
          animate={{
            scaleX: [0.3, 1, 0.3],
            opacity: [0.3, 0.8, 0.3],
            x: ['-30%', '30%', '-30%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.2,
            ease: 'easeInOut'
          }}
        />
      ))}
      
      {/* Floating particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: 'white',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.6, 0.2],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}
    </div>
  );
});

DNAHelixAnimation.displayName = 'DNAHelixAnimation';

// Particle effect for LEGENDARY tier
const ParticleEffect = memo(({ color }: { color: string }) => {
  return (
    <>
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -100, 0],
            x: [0, (Math.random() - 0.5) * 50, 0],
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeInOut'
          }}
        />
      ))}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute w-2 h-2 rounded-full"
          style={{
            backgroundColor: 'white',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut'
          }}
        />
      ))}
    </>
  );
});

ParticleEffect.displayName = 'ParticleEffect';
