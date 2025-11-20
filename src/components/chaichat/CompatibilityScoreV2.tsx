import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info, Calculator, TrendingUp, Heart, Home, Sparkles, Coffee } from 'lucide-react';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SubFactor {
  score: number;
  weight: number;
}

interface Dimension {
  score: number;
  weight: number;
  contribution: number;
  factors: Record<string, SubFactor>;
}

interface ScoreBreakdownData {
  overall: number;
  formula: string;
  dimensions: {
    coreValues: Dimension;
    lifestyle: Dimension;
    personality: Dimension;
    interests: Dimension;
  };
  preferenceBoost?: {
    applied: boolean;
    multiplier: number;
    reason: string;
  };
}

interface CompatibilityScoreV2Props {
  data?: ScoreBreakdownData;
  className?: string;
}

const defaultData: ScoreBreakdownData = {
  overall: 87,
  formula: 'Weighted average with preference multiplier',
  dimensions: {
    coreValues: {
      score: 92,
      weight: 35,
      contribution: 32.2,
      factors: {
        religious: { score: 95, weight: 40 },
        family: { score: 90, weight: 30 },
        moral: { score: 88, weight: 20 },
        purpose: { score: 92, weight: 10 },
      },
    },
    lifestyle: {
      score: 85,
      weight: 25,
      contribution: 21.25,
      factors: {
        children: { score: 90, weight: 35 },
        career: { score: 82, weight: 25 },
        financial: { score: 85, weight: 20 },
        location: { score: 80, weight: 20 },
      },
    },
    personality: {
      score: 83,
      weight: 25,
      contribution: 20.75,
      factors: {
        communication: { score: 88, weight: 30 },
        temperament: { score: 80, weight: 25 },
        emotional: { score: 85, weight: 25 },
        social: { score: 78, weight: 20 },
      },
    },
    interests: {
      score: 80,
      weight: 15,
      contribution: 12.0,
      factors: {
        hobbies: { score: 85, weight: 40 },
        activities: { score: 78, weight: 30 },
        entertainment: { score: 75, weight: 20 },
        learning: { score: 82, weight: 10 },
      },
    },
  },
  preferenceBoost: {
    applied: true,
    multiplier: 1.15,
    reason: 'Matched 3 must-have preferences',
  },
};

const dimensionConfig = {
  coreValues: {
    label: 'Core Values',
    icon: Heart,
    color: 'hsl(var(--primary))',
    gradient: 'from-primary/20 to-primary/5',
  },
  lifestyle: {
    label: 'Lifestyle',
    icon: Home,
    color: 'hsl(210, 70%, 60%)',
    gradient: 'from-blue-500/20 to-blue-500/5',
  },
  personality: {
    label: 'Personality',
    icon: Sparkles,
    color: 'hsl(270, 70%, 60%)',
    gradient: 'from-purple-500/20 to-purple-500/5',
  },
  interests: {
    label: 'Interests',
    icon: Coffee,
    color: 'hsl(30, 70%, 60%)',
    gradient: 'from-orange-500/20 to-orange-500/5',
  },
};

export const CompatibilityScoreV2 = ({ data = defaultData, className }: CompatibilityScoreV2Props) => {
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
  const [showFormula, setShowFormula] = useState(false);

  const dimensionKeys = Object.keys(data.dimensions) as Array<keyof typeof data.dimensions>;

  // Calculate base score before boost
  const baseScore = data.preferenceBoost?.applied
    ? Math.round(data.overall / data.preferenceBoost.multiplier)
    : data.overall;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Score Circle with Segmented Ring */}
      <BaseCard className="p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Main Score Circle */}
          <motion.div
            className="relative w-64 h-64"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Segmented outer ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
                fill="none"
              />

              {/* Segmented dimension rings */}
              {dimensionKeys.map((key, index) => {
                const dimension = data.dimensions[key];
                const config = dimensionConfig[key];
                const totalWeight = dimensionKeys.reduce(
                  (sum, k) => sum + data.dimensions[k].weight,
                  0
                );
                
                // Calculate segment angles
                const startAngle = dimensionKeys
                  .slice(0, index)
                  .reduce((sum, k) => sum + (data.dimensions[k].weight / totalWeight) * 360, 0);
                const segmentAngle = (dimension.weight / totalWeight) * 360;
                const circumference = 2 * Math.PI * 90;
                const segmentLength = (segmentAngle / 360) * circumference;
                const gap = 2; // Small gap between segments

                return (
                  <motion.circle
                    key={key}
                    cx="100"
                    cy="100"
                    r="90"
                    stroke={config.color}
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${segmentLength - gap} ${circumference - segmentLength + gap}`}
                    strokeDashoffset={circumference - (startAngle / 360) * circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{
                      strokeDashoffset: circumference - (startAngle / 360) * circumference,
                    }}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
                    className="cursor-pointer transition-opacity hover:opacity-70"
                    onClick={() => setExpandedDimension(expandedDimension === key ? null : key)}
                  />
                );
              })}
            </svg>

            {/* Center score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.div
                className="text-6xl font-bold text-foreground"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                {data.overall}%
              </motion.div>
              <div className="text-sm text-muted-foreground mt-1">Compatibility</div>
              
              {data.preferenceBoost?.applied && (
                <motion.div
                  className="mt-2 flex items-center gap-1 text-xs text-semantic-success font-semibold"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.4 }}
                >
                  <TrendingUp className="w-3 h-3" />
                  +{Math.round((data.preferenceBoost.multiplier - 1) * 100)}% Boost
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
            {dimensionKeys.map((key) => {
              const config = dimensionConfig[key];
              const dimension = data.dimensions[key];
              const DimensionIcon = config.icon;

              return (
                <div key={key} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="text-muted-foreground flex-1">{config.label}</span>
                  <span className="font-semibold text-foreground">{dimension.weight}%</span>
                </div>
              );
            })}
          </div>

          {/* Formula Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFormula(!showFormula)}
            className="gap-2 text-xs"
          >
            <Calculator className="w-3 h-3" />
            {showFormula ? 'Hide' : 'Show'} Formula
          </Button>
        </div>
      </BaseCard>

      {/* Interactive Formula Display */}
      <AnimatePresence>
        {showFormula && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BaseCard className="p-6 bg-muted/30">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Info className="w-4 h-4" />
                  How the score is calculated
                </div>

                <div className="space-y-2 text-sm font-mono">
                  <div className="text-muted-foreground">Base Score =</div>
                  {dimensionKeys.map((key) => {
                    const dimension = data.dimensions[key];
                    const config = dimensionConfig[key];
                    return (
                      <div key={key} className="flex items-center gap-2 pl-4">
                        <span style={{ color: config.color }}>
                          ({dimension.score} × {dimension.weight}%)
                        </span>
                        <span className="text-muted-foreground">= {dimension.contribution.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  
                  <div className="pt-2 border-t border-border">
                    <span className="text-muted-foreground">Total = </span>
                    <span className="font-bold text-foreground">{baseScore}%</span>
                  </div>

                  {data.preferenceBoost?.applied && (
                    <>
                      <div className="pt-2 text-muted-foreground">
                        × {data.preferenceBoost.multiplier} (preference boost)
                      </div>
                      <div className="font-bold text-semantic-success">
                        Final Score = {data.overall}%
                      </div>
                      <div className="text-xs text-muted-foreground italic pt-1">
                        {data.preferenceBoost.reason}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </BaseCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dimension Cards with Sub-factors */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Dimension Breakdown</h3>

        {dimensionKeys.map((key, index) => {
          const dimension = data.dimensions[key];
          const config = dimensionConfig[key];
          const DimensionIcon = config.icon;
          const isExpanded = expandedDimension === key;
          const factorKeys = Object.keys(dimension.factors);

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <BaseCard
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  isExpanded && 'ring-2 ring-primary ring-offset-2'
                )}
                onClick={() => setExpandedDimension(isExpanded ? null : key)}
              >
                <div className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn('p-2 rounded-lg bg-gradient-to-br', config.gradient)}
                        style={{ color: config.color }}
                      >
                        <DimensionIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{config.label}</div>
                        <div className="text-xs text-muted-foreground">
                          Weight: {dimension.weight}% · Contributes: {dimension.contribution.toFixed(1)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">{dimension.score}%</div>
                      </div>
                      <ChevronDown
                        className={cn(
                          'w-5 h-5 text-muted-foreground transition-transform',
                          isExpanded && 'rotate-180'
                        )}
                      />
                    </div>
                  </div>

                  {/* Progress bar */}
                  <Progress value={dimension.score} className="h-2" />

                  {/* Expanded sub-factors */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pt-3 border-t border-border space-y-3"
                      >
                        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Sub-factors
                        </div>

                        {factorKeys.map((factorKey) => {
                          const factor = dimension.factors[factorKey];
                          return (
                            <div key={factorKey} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground capitalize">
                                  {factorKey.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">
                                    {factor.weight}%
                                  </span>
                                  <span className="font-semibold text-foreground w-12 text-right">
                                    {factor.score}
                                  </span>
                                </div>
                              </div>
                              <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full rounded-full"
                                  style={{ backgroundColor: config.color }}
                                  initial={{ width: 0 }}
                                  animate={{ width: `${factor.score}%` }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </BaseCard>
            </motion.div>
          );
        })}
      </div>

      {/* Preference Boost Card */}
      {data.preferenceBoost?.applied && (
        <BaseCard className="p-6 bg-gradient-to-br from-semantic-success/5 to-semantic-success/10 border-semantic-success/20">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-semantic-success/20">
              <TrendingUp className="w-6 h-6 text-semantic-success" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="font-semibold text-foreground">Preference Boost Applied</div>
              <div className="text-sm text-muted-foreground">{data.preferenceBoost.reason}</div>
              <div className="flex items-center gap-4 text-sm pt-2">
                <div>
                  <span className="text-muted-foreground">Base Score: </span>
                  <span className="font-semibold text-foreground">{baseScore}%</span>
                </div>
                <span className="text-muted-foreground">×</span>
                <div>
                  <span className="text-muted-foreground">Multiplier: </span>
                  <span className="font-semibold text-semantic-success">
                    {data.preferenceBoost.multiplier}
                  </span>
                </div>
                <span className="text-muted-foreground">=</span>
                <div>
                  <span className="text-muted-foreground">Final: </span>
                  <span className="font-bold text-semantic-success">{data.overall}%</span>
                </div>
              </div>
            </div>
          </div>
        </BaseCard>
      )}
    </div>
  );
};
