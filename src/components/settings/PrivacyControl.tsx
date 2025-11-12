import { ReactNode } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { cn } from '@/lib/utils';

interface PrivacyControlProps {
  icon: ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  isPremium?: boolean;
  disabled?: boolean;
}

export const PrivacyControl = ({
  icon,
  label,
  description,
  checked,
  onChange,
  isPremium = false,
  disabled = false,
}: PrivacyControlProps) => {
  return (
    <BaseCard padding="md" className={cn(disabled && 'opacity-50')}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{label}</h3>
              {isPremium && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 text-xs">
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <Switch
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          className="flex-shrink-0"
        />
      </div>
    </BaseCard>
  );
};
