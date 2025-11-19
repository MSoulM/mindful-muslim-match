/**
 * Stage Access Control Component
 * Shows platform access restrictions by journey stage
 */

import { motion } from 'framer-motion';
import { Lock, Unlock, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useJourney } from '@/hooks/useJourney';
import { Progress } from '@/components/ui/progress';

interface StageAccessControlProps {
  feature: string;
  requiredStage?: string;
  showUpgradePrompt?: boolean;
}

export const StageAccessControl = ({
  feature,
  requiredStage,
  showUpgradePrompt = true,
}: StageAccessControlProps) => {
  const { journeyStatus, isFeatureUnlocked, getProgressPercentage } = useJourney();

  if (!journeyStatus) return null;

  const isUnlocked = isFeatureUnlocked(feature);
  const progressPercentage = getProgressPercentage();

  if (isUnlocked) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-sm text-success"
      >
        <Unlock className="w-4 h-4" />
        <span className="font-medium">Unlocked</span>
      </motion.div>
    );
  }

  if (!showUpgradePrompt) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="w-4 h-4" />
        <span>Locked</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-lg p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Lock className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground">Feature Locked</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Unlock {feature} by growing your MySoulDNA
          </p>
        </div>
      </div>

      {/* Progress to Unlock */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress to unlock</span>
          <span className="font-semibold text-foreground">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Encouragement */}
      <div className="flex items-start gap-2 bg-muted/50 rounded-md p-3">
        <TrendingUp className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Keep growing!</span>{' '}
          Share meaningful content and engage authentically to unlock this feature.
        </p>
      </div>

      {/* Islamic Encouragement */}
      <p className="text-xs text-center text-muted-foreground italic">
        "Sabr (patience) brings rewards"
      </p>
    </motion.div>
  );
};

// Wrapper component for gating entire features
export const FeatureGate = ({
  feature,
  requiredStage,
  children,
  fallback,
}: {
  feature: string;
  requiredStage?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const { isFeatureUnlocked } = useJourney();

  if (isFeatureUnlocked(feature)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <StageAccessControl
      feature={feature}
      requiredStage={requiredStage}
      showUpgradePrompt={true}
    />
  );
};
