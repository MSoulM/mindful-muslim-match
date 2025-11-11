import { motion } from 'framer-motion';
import { Coffee, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BaseCard } from '@/components/ui/Cards/BaseCard';

interface ChaiChatSummaryCardProps {
  matchName: string;
  topicsDiscussed: number;
  compatibility: {
    overall: number;
    categories: Array<{
      name: string;
      score: number;
      strength: string;
    }>;
  };
  lastUpdated: string;
  status: 'active' | 'pending' | 'complete';
  onClick?: () => void;
  className?: string;
}

const statusConfig = {
  active: {
    color: 'text-semantic-success',
    bg: 'bg-semantic-success/10',
    label: 'Active',
  },
  pending: {
    color: 'text-semantic-warning',
    bg: 'bg-semantic-warning/10',
    label: 'Pending Review',
  },
  complete: {
    color: 'text-neutral-600',
    bg: 'bg-neutral-100',
    label: 'Complete',
  },
};

export const ChaiChatSummaryCard = ({
  matchName,
  topicsDiscussed,
  compatibility,
  lastUpdated,
  status,
  onClick,
  className,
}: ChaiChatSummaryCardProps) => {
  const statusStyle = statusConfig[status];

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-semantic-success';
    if (score >= 60) return 'text-semantic-warning';
    return 'text-neutral-600';
  };

  return (
    <BaseCard
      padding="md"
      shadow="sm"
      interactive={!!onClick}
      onClick={onClick}
      className={cn('border-2 border-semantic-warning/20', className)}
    >
      <div className="flex gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-semantic-warning/10 flex items-center justify-center flex-shrink-0">
          <Coffee className="w-6 h-6 text-semantic-warning" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-md font-semibold text-neutral-900">
              Conversation with {matchName}
            </h3>
            <span className={cn('text-xs px-2 py-1 rounded-full font-medium', statusStyle.bg, statusStyle.color)}>
              {statusStyle.label}
            </span>
          </div>

          {/* Stats */}
          <div className="space-y-2 mb-3">
            <p className="text-sm text-neutral-600">
              {topicsDiscussed} topics discussed
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-600">Overall:</span>
              <span className={cn('text-lg font-bold', getCompatibilityColor(compatibility.overall))}>
                {compatibility.overall}%
              </span>
            </div>
          </div>

          {/* Categories Preview */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {compatibility.categories.slice(0, 4).map((cat, index) => (
              <div key={index} className="bg-neutral-50 rounded-lg p-2">
                <div className="text-xs text-neutral-600 mb-1">{cat.name}</div>
                <div className="flex items-center gap-1">
                  <span className={cn('text-sm font-semibold', getCompatibilityColor(cat.score))}>
                    {cat.score}%
                  </span>
                  <span className="text-xs text-neutral-500">{cat.strength}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-neutral-500">
            <span>Updated {lastUpdated}</span>
            {onClick && <ChevronRight className="w-4 h-4" />}
          </div>
        </div>
      </div>
    </BaseCard>
  );
};
