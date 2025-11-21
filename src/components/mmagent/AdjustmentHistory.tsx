import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  ThumbsUp, 
  ThumbsDown, 
  RotateCcw, 
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Info
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PersonalityAdjustment, AdjustmentType } from '@/types/personality.types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/CustomButton';
import { cn } from '@/lib/utils';

const adjustmentTypeLabels: Record<AdjustmentType, string> = {
  warmer: 'Warmer & Friendlier',
  more_formal: 'More Formal',
  more_casual: 'More Casual',
  more_empathetic: 'More Empathetic',
  more_direct: 'More Direct',
  more_encouraging: 'More Encouraging',
  more_analytical: 'More Analytical',
};

const adjustmentTypeColors: Record<AdjustmentType, { bg: string; text: string; border: string }> = {
  warmer: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  more_formal: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  more_casual: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  more_empathetic: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  more_direct: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
  more_encouraging: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
  more_analytical: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};

interface AdjustmentHistoryProps {
  adjustments: PersonalityAdjustment[];
  currentSettings: {
    warmth: number;
    formality: number;
    energy: number;
    empathy: number;
  };
  onRevert?: (adjustmentId: string) => void;
}

export const AdjustmentHistory = ({
  adjustments,
  currentSettings,
  onRevert,
}: AdjustmentHistoryProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (adjustments.length === 0) {
    return (
      <div className="text-center py-12">
        <History className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
        <p className="text-muted-foreground text-sm">
          No personality adjustments yet
        </p>
        <p className="text-muted-foreground text-xs mt-1">
          MMAgent will evolve based on your interactions
        </p>
      </div>
    );
  }

  const getFeedbackIcon = (feedback?: PersonalityAdjustment['userFeedback']) => {
    switch (feedback) {
      case 'liked':
        return <ThumbsUp className="w-3 h-3 text-green-600" />;
      case 'disliked':
        return <ThumbsDown className="w-3 h-3 text-red-600" />;
      case 'reverted':
        return <RotateCcw className="w-3 h-3 text-amber-600" />;
      default:
        return null;
    }
  };

  const getSettingChange = (
    key: keyof PersonalityAdjustment['previousSettings'],
    adjustment: PersonalityAdjustment
  ) => {
    const prev = adjustment.previousSettings[key];
    const current = adjustment.newSettings[key];
    const diff = current - prev;

    if (diff === 0) return null;

    return {
      diff,
      icon: diff > 0 ? TrendingUp : TrendingDown,
      color: diff > 0 ? 'text-green-600' : 'text-red-600',
    };
  };

  return (
    <div className="space-y-3">
      {/* Current Settings Summary */}
      <div className="bg-card rounded-xl border border-border p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">
            Current Personality Settings
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(currentSettings).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground capitalize">
                {key}
              </span>
              <Badge variant="secondary" className="text-xs">
                {value}/10
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Adjustment List */}
      {adjustments.map((adjustment, index) => {
        const isExpanded = expandedId === adjustment.id;
        const colors = adjustmentTypeColors[adjustment.adjustmentType];

        return (
          <motion.div
            key={adjustment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={cn(
              'bg-card rounded-xl border overflow-hidden',
              colors.border
            )}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : adjustment.id)}
              className={cn(
                'w-full p-4 text-left transition-colors hover:bg-muted/50',
                colors.bg
              )}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-sm font-semibold', colors.text)}>
                      {adjustmentTypeLabels[adjustment.adjustmentType]}
                    </span>
                    {adjustment.userFeedback && (
                      <div className="flex items-center gap-1">
                        {getFeedbackIcon(adjustment.userFeedback)}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {formatDistanceToNow(adjustment.timestamp, { addSuffix: true })}
                    </span>
                  </div>

                  {!isExpanded && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {adjustment.reason}
                    </p>
                  )}
                </div>

                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform flex-shrink-0',
                    isExpanded && 'rotate-180'
                  )}
                />
              </div>
            </button>

            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-border"
              >
                <div className="p-4 space-y-4">
                  {/* Reason */}
                  <div>
                    <p className="text-xs font-medium text-foreground mb-1">
                      Reason for Adjustment
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {adjustment.reason}
                    </p>
                  </div>

                  {/* Setting Changes */}
                  <div>
                    <p className="text-xs font-medium text-foreground mb-2">
                      Changes Made
                    </p>
                    <div className="space-y-2">
                      {Object.keys(adjustment.previousSettings).map(key => {
                        const settingKey = key as keyof PersonalityAdjustment['previousSettings'];
                        const change = getSettingChange(settingKey, adjustment);
                        if (!change) return null;

                        const Icon = change.icon;

                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between text-xs"
                          >
                            <span className="text-muted-foreground capitalize">
                              {key}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">
                                {adjustment.previousSettings[settingKey]}
                              </span>
                              <Icon className={cn('w-3 h-3', change.color)} />
                              <span className={cn('font-medium', change.color)}>
                                {adjustment.newSettings[settingKey]}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Feedback Status */}
                  {adjustment.userFeedback && adjustment.feedbackTimestamp && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        {adjustment.userFeedback === 'liked' && 'You loved this adjustment'}
                        {adjustment.userFeedback === 'disliked' && 'You disliked this adjustment'}
                        {adjustment.userFeedback === 'reverted' && 'This adjustment was reverted'}
                        {' · '}
                        {formatDistanceToNow(adjustment.feedbackTimestamp, { addSuffix: true })}
                      </p>
                    </div>
                  )}

                  {/* Revert Button */}
                  {onRevert && adjustment.userFeedback !== 'reverted' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRevert(adjustment.id)}
                      className="w-full text-xs"
                    >
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Revert to Previous Settings
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};
