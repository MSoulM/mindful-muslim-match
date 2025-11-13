/**
 * TrendingCard Component
 * Shows trending topics/hashtags
 */

import { TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TrendingItem {
  id: string;
  tag: string;
  postCount: number;
  change: number; // percentage change
  category?: string;
}

interface TrendingCardProps {
  items: TrendingItem[];
  onItemClick?: (item: TrendingItem) => void;
  maxItems?: number;
  className?: string;
}

export const TrendingCard = ({
  items,
  onItemClick,
  maxItems = 5,
  className,
}: TrendingCardProps) => {
  const displayItems = items.slice(0, maxItems);

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Trending Now</h3>
      </div>

      <div className="space-y-3">
        {displayItems.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className="w-full text-left hover:bg-muted/50 rounded-lg p-3 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-muted-foreground">
                    #{index + 1}
                  </span>
                  <p className="font-semibold truncate">#{item.tag}</p>
                </div>
                {item.category && (
                  <Badge variant="secondary" className="text-xs mt-1">
                    {item.category}
                  </Badge>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {item.postCount.toLocaleString()} posts
                </p>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <TrendingUp
                  className={cn(
                    'h-4 w-4',
                    item.change > 0 ? 'text-green-600' : 'text-muted-foreground'
                  )}
                />
                <span
                  className={cn(
                    'text-xs font-medium',
                    item.change > 0 ? 'text-green-600' : 'text-muted-foreground'
                  )}
                >
                  {item.change > 0 ? '+' : ''}{item.change}%
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
};
