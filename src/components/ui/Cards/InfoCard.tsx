import { ReactNode } from 'react';
import { BaseCard } from './BaseCard';
import { Button } from '../Button';
import { cn } from '@/lib/utils';

interface InfoCardProps {
  variant?: 'default' | 'highlight' | 'warning' | 'error';
  icon?: ReactNode;
  title?: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const InfoCard = ({
  variant = 'default',
  icon,
  title,
  description,
  action,
  className,
}: InfoCardProps) => {
  const variantClasses = {
    default: 'bg-white border-neutral-200',
    highlight: 'bg-primary-gold/10 border-primary-gold/30',
    warning: 'bg-semantic-warning/10 border-semantic-warning/30',
    error: 'bg-semantic-error/10 border-semantic-error/30',
  };

  const iconColorClasses = {
    default: 'text-neutral-700',
    highlight: 'text-primary-gold',
    warning: 'text-semantic-warning',
    error: 'text-semantic-error',
  };

  return (
    <BaseCard
      padding="md"
      shadow="sm"
      className={cn(variantClasses[variant], className)}
    >
      <div className="flex gap-3">
        {/* Icon */}
        {icon && (
          <div className={cn('flex-shrink-0 w-6 h-6', iconColorClasses[variant])}>
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-md font-semibold text-neutral-900 mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm text-neutral-600 leading-relaxed">
            {description}
          </p>

          {/* Action */}
          {action && (
            <div className="mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  );
};
