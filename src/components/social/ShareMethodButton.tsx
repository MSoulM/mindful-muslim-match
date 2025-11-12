import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareMethodButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  color?: string;
}

export const ShareMethodButton = ({
  icon: Icon,
  label,
  onClick,
  color = 'bg-primary/10 text-primary',
}: ShareMethodButtonProps) => {
  return (
    <BaseCard
      padding="md"
      interactive
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 min-h-[100px]"
    >
      <div className={cn('w-12 h-12 rounded-full flex items-center justify-center', color)}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-sm font-medium text-center">{label}</span>
    </BaseCard>
  );
};
