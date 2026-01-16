/**
 * MySoul DNA™ Visual Component
 * Displays the user's DNA score with rarity tier badge and DNA helix animation
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Dna, Sparkles, Zap, Crown, Star, Gem, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDNAScore, RARITY_CONFIG, RarityTier } from '@/hooks/useDNAScore';
import { useOriginality } from '@/hooks/useOriginality';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Rarity tier icons
const RARITY_ICONS: Record<RarityTier, typeof Star> = {
  Common: Star,
  Uncommon: Zap,
  Rare: Gem,
  Epic: Sparkles,
  Legendary: Crown
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

  if (!dnaScore || !rarityConfig) {
    return (
      <div className={cn('bg-card rounded-2xl p-6 border border-border text-center', className)}>
        <Dna className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Start sharing to build your DNA</p>
      </div>
    );
  }

  const { tier, color, bgGradient, glowColor, description } = rarityConfig;
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
          boxShadow: `0 8px 32px ${glowColor}`
        }}
      >
        <div className="flex items-center justify-between text-white">
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
      {/* Background with glow effect */}
      <div 
        className={cn('absolute inset-0 bg-gradient-to-br', bgGradient)}
        style={{
          boxShadow: `inset 0 0 60px ${glowColor}`
        }}
      />
      
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
            {/* Glow ring */}
            <div 
              className="absolute inset-0 rounded-full blur-xl animate-pulse"
              style={{ backgroundColor: glowColor }}
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
