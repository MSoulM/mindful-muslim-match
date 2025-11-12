import { ReactNode } from 'react';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsItemProps {
  icon?: ReactNode;
  label: string;
  description?: string;
  rightElement?: ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const SettingsItem = ({
  icon,
  label,
  description,
  rightElement,
  showChevron = true,
  onClick,
  disabled = false,
  className,
}: SettingsItemProps) => {
  return (
    <BaseCard
      padding="md"
      interactive={!!onClick && !disabled}
      onClick={disabled ? undefined : onClick}
      className={cn(
        'flex items-center gap-3',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {icon && (
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
          {icon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{label}</h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-1">{description}</p>
        )}
      </div>

      {rightElement || (onClick && showChevron && (
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      ))}
    </BaseCard>
  );
};
