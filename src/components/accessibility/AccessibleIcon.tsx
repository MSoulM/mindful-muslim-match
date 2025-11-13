import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AccessibleIconProps {
  icon: LucideIcon;
  label?: string;
  decorative?: boolean;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

/**
 * Accessible icon wrapper that handles ARIA labels
 * @param decorative - If true, hides icon from screen readers (aria-hidden)
 * @param label - Accessible label for non-decorative icons
 */
export function AccessibleIcon({
  icon: Icon,
  label,
  decorative = false,
  className,
  size = 24,
  strokeWidth = 2,
}: AccessibleIconProps) {
  if (decorative) {
    return (
      <Icon
        aria-hidden="true"
        className={className}
        size={size}
        strokeWidth={strokeWidth}
      />
    );
  }

  if (!label) {
    console.warn('AccessibleIcon: Non-decorative icons should have a label');
  }

  return (
    <Icon
      role="img"
      aria-label={label}
      className={className}
      size={size}
      strokeWidth={strokeWidth}
    />
  );
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  iconClassName?: string;
  iconSize?: number;
  showLabel?: boolean;
}

/**
 * Accessible icon button with proper labeling
 */
export function AccessibleIconButton({
  icon: Icon,
  label,
  iconClassName,
  iconSize = 24,
  showLabel = false,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'min-w-[44px] min-h-[44px]',
        'rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    >
      <Icon
        aria-hidden="true"
        className={iconClassName}
        size={iconSize}
      />
      {showLabel && (
        <span className="text-sm font-medium">{label}</span>
      )}
    </button>
  );
}
