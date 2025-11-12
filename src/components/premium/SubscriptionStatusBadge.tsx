import { Crown, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SubscriptionStatusBadgeProps {
  isPremium: boolean;
  expiresAt?: string;
  variant?: 'default' | 'compact';
}

export const SubscriptionStatusBadge = ({ 
  isPremium, 
  expiresAt,
  variant = 'default'
}: SubscriptionStatusBadgeProps) => {
  if (variant === 'compact') {
    return (
      <Badge 
        className={cn(
          'flex items-center gap-1',
          isPremium 
            ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <Crown className="w-3 h-3" />
        {isPremium ? 'Premium' : 'Free'}
      </Badge>
    );
  }

  return (
    <div className={cn(
      'inline-flex items-center gap-2 px-3 py-1.5 rounded-full',
      isPremium 
        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white'
        : 'bg-muted text-muted-foreground'
    )}>
      {isPremium ? (
        <>
          <Crown className="w-4 h-4" />
          <span className="font-semibold text-sm">Premium Member</span>
          {expiresAt && (
            <span className="text-xs opacity-90">• Until {expiresAt}</span>
          )}
        </>
      ) : (
        <>
          <CheckCircle className="w-4 h-4" />
          <span className="font-medium text-sm">Free Member</span>
        </>
      )}
    </div>
  );
};
