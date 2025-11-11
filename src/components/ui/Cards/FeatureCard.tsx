import { ReactNode } from 'react';
import { BaseCard } from './BaseCard';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  rightElement?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const FeatureCard = ({
  icon,
  title,
  description,
  rightElement,
  onClick,
  disabled = false,
  className,
}: FeatureCardProps) => {
  return (
    <BaseCard
      padding="md"
      shadow="sm"
      interactive={!!onClick}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'min-h-[72px] flex items-center gap-4',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {/* Icon */}
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-forest/10 to-primary-gold/10 flex items-center justify-center flex-shrink-0 text-primary-forest">
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-md font-semibold text-neutral-900 mb-0.5 truncate">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-neutral-600 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Right element or arrow */}
      {rightElement || (onClick && (
        <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
      ))}
    </BaseCard>
  );
};
