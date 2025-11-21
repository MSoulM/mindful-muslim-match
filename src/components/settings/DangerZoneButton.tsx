import { ReactNode } from 'react';
import { Button } from '@/components/ui/CustomButton';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DangerZoneButtonProps {
  icon?: ReactNode;
  label: string;
  description?: string;
  onClick: () => void;
  variant?: 'warning' | 'danger';
  loading?: boolean;
}

export const DangerZoneButton = ({
  icon,
  label,
  description,
  onClick,
  variant = 'danger',
  loading = false,
}: DangerZoneButtonProps) => {
  const variantStyles = {
    warning: {
      bg: 'bg-semantic-warning/5 hover:bg-semantic-warning/10',
      border: 'border-semantic-warning/30',
      text: 'text-semantic-warning',
    },
    danger: {
      bg: 'bg-semantic-error/5 hover:bg-semantic-error/10',
      border: 'border-semantic-error/30',
      text: 'text-semantic-error',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={cn('p-4 rounded-xl border-2 transition-colors', styles.bg, styles.border)}>
      <div className="flex items-start gap-3 mb-3">
        <AlertTriangle className={cn('w-5 h-5 flex-shrink-0 mt-0.5', styles.text)} />
        <div className="flex-1">
          <h3 className={cn('font-semibold mb-1', styles.text)}>{label}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <Button
        variant="secondary"
        className={cn('w-full', styles.border, styles.text, 'hover:opacity-80')}
        onClick={onClick}
        disabled={loading}
      >
        {icon}
        {loading ? 'Processing...' : label}
      </Button>
    </div>
  );
};
