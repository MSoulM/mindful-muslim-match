import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { ProgressBar } from '@/components/ui/Feedback/ProgressBar';

interface ChaiChatRecommendationProps {
  type: 'positive' | 'caution' | 'neutral';
  title: string;
  message: string;
  confidence: number;
  className?: string;
}

const typeConfig = {
  positive: {
    icon: CheckCircle,
    iconColor: 'text-semantic-success',
    bgColor: 'bg-semantic-success/10',
    borderColor: 'border-semantic-success/20',
    progressColor: 'success' as const,
  },
  caution: {
    icon: AlertTriangle,
    iconColor: 'text-semantic-warning',
    bgColor: 'bg-semantic-warning/10',
    borderColor: 'border-semantic-warning/20',
    progressColor: 'warning' as const,
  },
  neutral: {
    icon: Info,
    iconColor: 'text-semantic-info',
    bgColor: 'bg-semantic-info/10',
    borderColor: 'border-semantic-info/20',
    progressColor: 'primary' as const,
  },
};

export const ChaiChatRecommendation = ({
  type,
  title,
  message,
  confidence,
  className,
}: ChaiChatRecommendationProps) => {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      <BaseCard
        padding="md"
        shadow="sm"
        className={cn('border-2', config.borderColor, config.bgColor)}
      >
        <div className="flex gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            <Icon className={cn('w-6 h-6', config.iconColor)} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-md font-semibold text-neutral-900 mb-2">
              {title}
            </h3>
            <p className="text-sm text-neutral-700 leading-relaxed mb-3">
              {message}
            </p>

            {/* Confidence */}
            <div>
              <ProgressBar
                value={confidence}
                label="AI Confidence"
                showPercentage
                color={config.progressColor}
                size="sm"
                animated
              />
            </div>
          </div>
        </div>
      </BaseCard>
    </motion.div>
  );
};
