import { Badge } from '@/components/ui/badge';
import { CulturalVariant, getCulturalColor, getCulturalIcon } from '@/utils/culturalAdaptation';
import { cn } from '@/lib/utils';

interface CulturalBadgeProps {
  variant: CulturalVariant;
  showIcon?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const CulturalBadge = ({ 
  variant, 
  showIcon = true, 
  size = 'sm',
  className 
}: CulturalBadgeProps) => {
  const colorClass = getCulturalColor(variant);
  const icon = getCulturalIcon(variant);

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'border font-medium',
        colorClass,
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
        className
      )}
    >
      {showIcon && <span className="mr-1">{icon}</span>}
      {variant}
    </Badge>
  );
};
