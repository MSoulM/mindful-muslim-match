import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

interface PlanCardProps {
  title: string;
  price: string;
  billing: string;
  total?: string;
  savings?: string;
  badge?: string;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

export const PlanCard = ({
  title,
  price,
  billing,
  total,
  savings,
  badge,
  isSelected,
  onSelect,
  className,
}: PlanCardProps) => {
  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        'relative rounded-2xl p-5 cursor-pointer',
        'border-2 transition-all duration-200',
        'min-h-[180px] flex flex-col',
        isSelected
          ? 'border-transparent bg-gradient-to-br from-primary-forest/10 to-primary-forest/5'
          : 'border-neutral-200 bg-white hover:border-neutral-300',
        className
      )}
    >
      {/* Gradient border effect when selected */}
      {isSelected && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-forest to-primary-forest/70 p-[2px]">
          <div className="absolute inset-[2px] rounded-2xl bg-white" />
        </div>
      )}
      
      <div className="relative z-10">
        {/* Header with badge */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Radio indicator */}
            <div className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              isSelected
                ? 'border-primary-forest bg-primary-forest'
                : 'border-neutral-300 bg-white'
            )}>
              {isSelected && <Check className="w-3 h-3 text-white" />}
            </div>
            <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
          </div>
          
          {badge && (
            <Badge 
              variant="secondary"
              className="bg-primary-gold/10 text-primary-gold border-primary-gold/20 text-xs whitespace-nowrap"
            >
              {badge}
            </Badge>
          )}
        </div>

        {/* Price */}
        <div className="mb-2">
          <div className="text-3xl font-bold text-neutral-900 mb-1">
            {price}
          </div>
          <div className="text-sm text-neutral-600">{billing}</div>
        </div>

        {/* Total and savings */}
        {total && (
          <div className="text-sm text-neutral-600 mb-1">
            {total}
          </div>
        )}
        
        {savings && (
          <div className="text-sm font-semibold text-semantic-success">
            💰 {savings}
          </div>
        )}
      </div>
    </motion.div>
  );
};
