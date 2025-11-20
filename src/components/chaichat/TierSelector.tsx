import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Check, Zap, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TierData {
  id: 'standard' | 'deep' | 'expert';
  name: string;
  model: string;
  price: string;
  priceNum: number;
  speed: string;
  features: string[];
  recommended: string;
  badge: string;
  highlight?: boolean;
}

const tiers: TierData[] = [
  {
    id: 'standard',
    name: 'Standard',
    model: 'GPT-4o-mini',
    price: '$0.002',
    priceNum: 0.002,
    speed: '< 2 seconds',
    features: [
      'Basic compatibility check',
      'Demographic alignment',
      'Interest overlap',
    ],
    recommended: 'Free users, initial screening',
    badge: 'FAST & CHEAP',
  },
  {
    id: 'deep',
    name: 'Deep',
    model: 'Claude Sonnet 3.5',
    price: '$0.035',
    priceNum: 0.035,
    speed: '< 5 seconds',
    features: [
      'Full profile analysis',
      'Value alignment',
      'Personality matching',
      'Conversation starters',
    ],
    recommended: 'Premium users, weekly matches',
    badge: 'RECOMMENDED',
    highlight: true,
  },
  {
    id: 'expert',
    name: 'Expert',
    model: 'Claude + Review',
    price: '$0.08',
    priceNum: 0.08,
    speed: '< 24 hours',
    features: [
      'Everything from Deep',
      'Cultural nuances',
      'Family dynamics',
      'Long-term projection',
      'Human review option',
    ],
    recommended: 'VIP users, serious matches',
    badge: 'PREMIUM',
  },
];

interface TierSelectorProps {
  selectedTier?: 'standard' | 'deep' | 'expert';
  onTierSelect: (tierId: 'standard' | 'deep' | 'expert') => void;
  userType?: 'free' | 'premium' | 'vip';
  autoSelected?: boolean;
  monthlyMatchEstimate?: number;
}

export const TierSelector = ({
  selectedTier = 'deep',
  onTierSelect,
  userType = 'premium',
  autoSelected = true,
  monthlyMatchEstimate = 20,
}: TierSelectorProps) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [isOverriding, setIsOverriding] = useState(!autoSelected);

  // Auto-select tier based on user type
  const autoSelectedTier = userType === 'free' ? 'standard' : userType === 'vip' ? 'expert' : 'deep';
  const displayTier = isOverriding ? selectedTier : autoSelectedTier;

  // Calculate savings
  const currentTierPrice = tiers.find((t) => t.id === displayTier)?.priceNum || 0;
  const expertTierPrice = tiers.find((t) => t.id === 'expert')?.priceNum || 0;
  const monthlySavings = ((expertTierPrice - currentTierPrice) * monthlyMatchEstimate).toFixed(2);

  const handleTierClick = (tierId: 'standard' | 'deep' | 'expert') => {
    setIsOverriding(true);
    onTierSelect(tierId);
  };

  const handleResetAuto = () => {
    setIsOverriding(false);
    onTierSelect(autoSelectedTier);
  };

  return (
    <div className="space-y-4">
      {/* Auto-Selection Banner */}
      {!isOverriding && autoSelected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary/10 border border-primary/20 rounded-lg p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  Auto-selected: {tiers.find((t) => t.id === autoSelectedTier)?.name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                Based on your {userType} subscription
              </p>
              {parseFloat(monthlySavings) > 0 && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-xs font-medium text-green-600">
                    Smart routing saves you ${monthlySavings}/month
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOverriding(true)}
              className="text-xs shrink-0"
            >
              Choose different
            </Button>
          </div>
        </motion.div>
      )}

      {/* Override Active Banner */}
      {isOverriding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border border-amber-200 rounded-lg p-3"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-amber-800">
              You're manually selecting tiers. This may increase your costs.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetAuto}
              className="text-xs text-amber-700 hover:text-amber-900 shrink-0"
            >
              Reset to auto
            </Button>
          </div>
        </motion.div>
      )}

      {/* Tier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tiers.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <TierCard
              tier={tier}
              isSelected={displayTier === tier.id}
              onSelect={() => handleTierClick(tier.id)}
            />
          </motion.div>
        ))}
      </div>

      {/* Price Comparison Chart */}
      <BaseCard className="bg-muted/30">
        <h4 className="text-sm font-semibold text-foreground mb-3">Cost Comparison</h4>
        <div className="space-y-2">
          {tiers.map((tier) => (
            <div key={tier.id} className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground w-20">{tier.name}</span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(tier.priceNum / expertTierPrice) * 100}%` }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className={cn(
                    'h-full',
                    tier.id === 'standard' && 'bg-green-500',
                    tier.id === 'deep' && 'bg-blue-500',
                    tier.id === 'expert' && 'bg-purple-500'
                  )}
                />
              </div>
              <span className="text-xs font-medium text-foreground w-16 text-right">
                {tier.price}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Based on {monthlyMatchEstimate} matches/month • Total: $
          {(currentTierPrice * monthlyMatchEstimate).toFixed(2)}/month
        </p>
      </BaseCard>

      {/* Expandable Explanation */}
      <button
        onClick={() => setShowExplanation(!showExplanation)}
        className="w-full flex items-center justify-between p-3 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-medium text-foreground">Why different tiers?</span>
        {showExplanation ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      <AnimatePresence>
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <BaseCard className="space-y-3">
              <div>
                <h5 className="text-sm font-semibold text-foreground mb-1">Cost Optimization</h5>
                <p className="text-xs text-muted-foreground">
                  Different AI models have different capabilities and costs. We match the right model
                  to your needs to maximize value.
                </p>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-foreground mb-1">Quality vs. Speed</h5>
                <p className="text-xs text-muted-foreground">
                  Standard tier is perfect for quick screening. Deep tier provides comprehensive
                  analysis. Expert tier adds human intuition for critical decisions.
                </p>
              </div>
              <div>
                <h5 className="text-sm font-semibold text-foreground mb-1">Smart Routing</h5>
                <p className="text-xs text-muted-foreground">
                  We automatically select the best tier based on your subscription and match
                  importance, saving you money while maintaining quality.
                </p>
              </div>
            </BaseCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Tier Card Component
interface TierCardProps {
  tier: TierData;
  isSelected: boolean;
  onSelect: () => void;
}

const TierCard = ({ tier, isSelected, onSelect }: TierCardProps) => {
  return (
    <BaseCard
      interactive
      onClick={onSelect}
      className={cn(
        'relative transition-all duration-200',
        tier.highlight && 'border-2 border-primary shadow-lg',
        isSelected && 'ring-2 ring-primary ring-offset-2',
        !tier.highlight && !isSelected && 'border border-border'
      )}
    >
      {/* Badge */}
      <div className="absolute top-3 right-3">
        <Badge
          variant={tier.highlight ? 'default' : 'secondary'}
          className={cn(
            'text-xs',
            tier.id === 'standard' && 'bg-green-500 text-white',
            tier.id === 'expert' && 'bg-purple-500 text-white'
          )}
        >
          {tier.badge}
        </Badge>
      </div>

      {/* Header */}
      <div className="mb-4 pt-2">
        <h3 className="text-lg font-bold text-foreground mb-1">{tier.name}</h3>
        <p className="text-xs text-muted-foreground mb-3">{tier.model}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-primary">{tier.price}</span>
          <span className="text-xs text-muted-foreground">/match</span>
        </div>
      </div>

      {/* Speed Indicator */}
      <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded-lg">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{tier.speed}</span>
      </div>

      {/* Features List */}
      <div className="space-y-2 mb-4">
        {tier.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <span className="text-xs text-foreground flex-1">{feature}</span>
          </div>
        ))}
      </div>

      {/* Recommended For */}
      <div className="pt-3 border-t border-border">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium">Best for:</span> {tier.recommended}
        </p>
      </div>

      {/* Selected Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg"
        >
          <Check className="w-5 h-5 text-primary-foreground" />
        </motion.div>
      )}
    </BaseCard>
  );
};
