/**
 * EngagementBar Component
 * Displays engagement metrics with interactive buttons
 */

import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EngagementBarProps {
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onBookmark?: () => void;
  showBookmark?: boolean;
  compact?: boolean;
  className?: string;
}

export const EngagementBar = ({
  likes,
  comments,
  shares,
  isLiked = false,
  isBookmarked = false,
  onLike,
  onComment,
  onShare,
  onBookmark,
  showBookmark = true,
  compact = false,
  className,
}: EngagementBarProps) => {
  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Like Button */}
      <Button
        variant="ghost"
        size={compact ? 'sm' : 'default'}
        className={cn(
          'gap-2',
          isLiked && 'text-red-600 hover:text-red-700'
        )}
        onClick={onLike}
      >
        <Heart
          className={cn(
            'h-5 w-5',
            isLiked && 'fill-current'
          )}
        />
        {!compact && <span>{formatCount(likes)}</span>}
      </Button>
      {compact && likes > 0 && (
        <span className="text-sm text-muted-foreground">{formatCount(likes)}</span>
      )}

      {/* Comment Button */}
      <Button
        variant="ghost"
        size={compact ? 'sm' : 'default'}
        className="gap-2"
        onClick={onComment}
      >
        <MessageCircle className="h-5 w-5" />
        {!compact && <span>{formatCount(comments)}</span>}
      </Button>
      {compact && comments > 0 && (
        <span className="text-sm text-muted-foreground">{formatCount(comments)}</span>
      )}

      {/* Share Button */}
      <Button
        variant="ghost"
        size={compact ? 'sm' : 'default'}
        className="gap-2"
        onClick={onShare}
      >
        <Share2 className="h-5 w-5" />
        {!compact && <span>{formatCount(shares)}</span>}
      </Button>
      {compact && shares > 0 && (
        <span className="text-sm text-muted-foreground">{formatCount(shares)}</span>
      )}

      {/* Bookmark Button */}
      {showBookmark && (
        <Button
          variant="ghost"
          size={compact ? 'sm' : 'default'}
          className={cn(
            'ml-auto',
            isBookmarked && 'text-primary'
          )}
          onClick={onBookmark}
        >
          <Bookmark
            className={cn(
              'h-5 w-5',
              isBookmarked && 'fill-current'
            )}
          />
        </Button>
      )}
    </div>
  );
};
