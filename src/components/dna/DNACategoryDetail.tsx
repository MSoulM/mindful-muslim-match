import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DNAStatsCard } from './DNAStatsCard';
import { AgentMessage } from '../chat/AgentMessage';
import { InfoCard } from '../ui/Cards/InfoCard';
import { DNAProgressBar } from './DNAProgressBar';
import { DNATimelineChart } from './DNATimelineChart';
import { Button } from '../ui/button';

export type RarityLevel = 'common' | 'rare' | 'epic' | 'ultra-rare';

export interface Trait {
  id: string;
  emoji: string;
  name: string;
  score: number;
  description: string;
  trend?: {
    direction: 'up' | 'down' | 'stable';
    value: number;
  };
}

export interface RareTrait {
  id: string;
  name: string;
  description: string;
  percentile: number;
  badges: string[];
}

export interface TimelineData {
  data: Array<{
    month: string;
    value: number;
  }>;
  currentIndex: number;
}

export interface ImpactItem {
  icon: string;
  text: string;
  percentage: number;
}

export interface CategoryDetailProps {
  category: {
    id: string;
    name: string;
    icon: string | React.ReactNode;
    description: string;
    score: number;
    rarity: RarityLevel;
    percentile: number;
  };
  traits: Trait[];
  rareTraits: RareTrait[];
  timeline: TimelineData;
  impact: ImpactItem[];
  agentInsight: string;
  onUpdate: () => void;
}

const rarityConfig = {
  'ultra-rare': { emoji: '🏆', label: 'Ultra Rare', gradient: 'gold' as const },
  'epic': { emoji: '💜', label: 'Epic', gradient: 'pink' as const },
  'rare': { emoji: '💎', label: 'Rare', gradient: 'default' as const },
  'common': { emoji: '⭐', label: 'Common', gradient: 'default' as const },
};

export const DNACategoryDetail = ({
  category,
  traits,
  rareTraits,
  timeline,
  impact,
  agentInsight,
  onUpdate,
}: CategoryDetailProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [expandedInsight, setExpandedInsight] = useState(false);
  const [showStickyButton, setShowStickyButton] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        setIsScrolled(scrollTop > 50);
        setShowStickyButton(scrollTop > 400);
      }
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  const rarityData = rarityConfig[category.rarity];
  const categoryIcon = typeof category.icon === 'string' ? category.icon : null;

  return (
    <div ref={containerRef} className="h-full overflow-y-auto">
      {/* Header Section - Sticky on scroll */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'sticky top-0 z-10 bg-background transition-shadow duration-200',
          isScrolled && 'shadow-md'
        )}
      >
        <div className="px-5 pt-6 pb-5 text-center">
          <div className="flex flex-col items-center gap-3">
            {/* Icon */}
            <div className="text-5xl">
              {categoryIcon || category.icon}
            </div>
            
            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground">
              {category.name}
            </h1>
            
            {/* Description */}
            <p className="text-[15px] text-muted-foreground max-w-[90%] leading-relaxed">
              {category.description}
            </p>
          </div>
        </div>
      </motion.header>

      <div className="px-5 pb-28">
        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className={cn(
            'relative rounded-2xl p-6 overflow-hidden',
            `bg-gradient-to-br from-primary to-[#4A8B8C]`
          )}>
            {/* Glass morphism overlay */}
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm" />
            
            {/* Content */}
            <div className="relative z-10 flex items-center justify-between">
              {/* Left section */}
              <div>
                <div className="text-5xl font-bold text-white mb-1">
                  {category.score}%
                </div>
                <p className="text-sm text-white/90 font-medium">
                  Completeness
                </p>
              </div>
              
              {/* Right section */}
              <div className="text-right">
                <div className="bg-white/25 backdrop-blur-sm rounded-full px-3 py-1.5 mb-2 inline-block">
                  <span className="text-sm font-semibold text-white">
                    {rarityData.emoji} {rarityData.label}
                  </span>
                </div>
                <p className="text-sm text-white/80">
                  Top {category.percentile}%
                </p>
              </div>
            </div>

            {/* Decorative circles */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          </div>
        </motion.div>

        {/* Agent Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="relative">
            <AgentMessage
              avatar="🤖"
              title="Your MMAgent"
              message={expandedInsight ? agentInsight : agentInsight.slice(0, 150) + (agentInsight.length > 150 ? '...' : '')}
              variant="default"
            />
            {agentInsight.length > 150 && (
              <button
                onClick={() => setExpandedInsight(!expandedInsight)}
                className="mt-2 text-sm text-primary font-medium flex items-center gap-1 hover:underline"
              >
                {expandedInsight ? 'Show less' : 'Read more'}
                <ChevronDown className={cn(
                  'w-4 h-4 transition-transform',
                  expandedInsight && 'rotate-180'
                )} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Core Traits Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">
            Core Traits
          </h2>
          
          <div className="space-y-3">
            {traits.map((trait, index) => (
              <motion.div
                key={trait.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-card rounded-xl p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{trait.emoji}</span>
                    <h3 className="font-semibold text-[15px] text-foreground">
                      {trait.name}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {trait.score}%
                    </span>
                    {trait.trend && (
                      <div className={cn(
                        'flex items-center',
                        trait.trend.direction === 'up' && 'text-green-600',
                        trait.trend.direction === 'down' && 'text-red-600',
                        trait.trend.direction === 'stable' && 'text-muted-foreground'
                      )}>
                        {trait.trend.direction === 'up' && <TrendingUp className="w-4 h-4" />}
                        {trait.trend.direction === 'down' && <TrendingDown className="w-4 h-4" />}
                        {trait.trend.direction === 'stable' && <Minus className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Description */}
                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {trait.description}
                </p>
                
                {/* Progress bar */}
                <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${trait.score}%` }}
                    transition={{ duration: 0.8, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Rare Traits Section */}
        {rareTraits.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h2 className="text-lg font-bold text-foreground mb-4">
              🏆 Your Rare Traits
            </h2>
            
            <div className="space-y-4">
              {rareTraits.map((rareTrait, index) => (
                <motion.div
                  key={rareTrait.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="relative overflow-hidden"
                >
                  <InfoCard
                    variant="highlight"
                    title={rareTrait.name}
                    description={rareTrait.description}
                    className="border-2"
                  />
                  
                  {/* Badge row */}
                  <div className="mt-3 flex flex-wrap gap-2 px-4 pb-4">
                    {rareTrait.badges.map((badge, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full"
                      >
                        {badge}
                      </span>
                    ))}
                    <span className="text-xs font-bold bg-gradient-to-r from-primary to-primary/80 text-white px-2.5 py-1 rounded-full">
                      Top {rareTrait.percentile}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Growth Timeline */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-8"
        >
          <h2 className="text-lg font-bold text-foreground mb-4">
            📈 Your Growth Journey
          </h2>
          
          <div className="bg-card rounded-xl p-6 shadow-sm min-h-[200px]">
            <DNATimelineChart
              data={timeline.data}
              currentIndex={timeline.currentIndex}
              color="primary"
            />
          </div>
        </motion.section>

        {/* Matching Impact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-6"
        >
          <InfoCard
            variant="highlight"
            icon={<span className="text-2xl">💡</span>}
            title="How This Helps You Match"
            description=""
            className="border-2"
          />
          
          <div className="mt-4 space-y-3 px-4">
            {impact.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <div className="flex-1">
                  <p className="text-sm text-foreground leading-relaxed">
                    {item.text}
                  </p>
                </div>
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1 + index * 0.1, type: 'spring' }}
                  className="text-sm font-bold text-primary"
                >
                  {item.percentage}%
                </motion.span>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Update CTA - Sticky bottom button */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: showStickyButton ? 0 : 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 px-5 py-4 z-20 shadow-lg"
        style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
      >
        <Button
          onClick={onUpdate}
          className="w-full h-[52px] text-base font-semibold"
          size="lg"
        >
          ✨ Update {category.name}
        </Button>
      </motion.div>
    </div>
  );
};
