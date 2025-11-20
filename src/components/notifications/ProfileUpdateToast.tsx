import { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ProfileUpdateToastProps {
  categoryName: string;
  oldPercentage: number;
  newPercentage: number;
  categoryIcon: keyof typeof Icons;
  categoryColor: string;
}

export function ProfileUpdateToast({
  categoryName,
  oldPercentage,
  newPercentage,
  categoryIcon,
  categoryColor,
}: ProfileUpdateToastProps) {
  const increase = newPercentage - oldPercentage;
  const Icon = Icons[categoryIcon] as LucideIcon;

  return (
    <div className="flex items-center gap-3 p-2">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${categoryColor}15` }}
      >
        {Icon && <Icon size={20} style={{ color: categoryColor }} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">
          {categoryName} Updated!
        </p>
        <p className="text-xs text-muted-foreground">
          {oldPercentage}% → {newPercentage}% 
          <span className="text-green-600 font-medium ml-1">
            (+{increase.toFixed(1)}%)
          </span>
        </p>
      </div>
    </div>
  );
}
