/**
 * HashtagPill Component
 * Clickable hashtag chip with post count
 */

import { Hash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface HashtagPillProps {
  tag: string;
  postCount?: number;
  onClick?: () => void;
  variant?: 'default' | 'secondary' | 'outline';
  showIcon?: boolean;
  className?: string;
}

export const HashtagPill = ({
  tag,
  postCount,
  onClick,
  variant = 'secondary',
  showIcon = false,
  className,
}: HashtagPillProps) => {
  const content = (
    <>
      {showIcon && <Hash className="h-3 w-3" />}
      <span>{tag.startsWith('#') ? tag : `#${tag}`}</span>
      {postCount !== undefined && postCount > 0 && (
        <span className="ml-1 opacity-70">({postCount})</span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors',
          'hover:bg-primary/10 active:scale-95',
          variant === 'default' && 'bg-primary text-primary-foreground',
          variant === 'secondary' && 'bg-secondary text-secondary-foreground',
          variant === 'outline' && 'border border-border bg-background',
          className
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <Badge variant={variant} className={cn('gap-1', className)}>
      {content}
    </Badge>
  );
};
