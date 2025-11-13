/**
 * CommentCard Component
 * Individual comment with replies support
 */

import { Heart, MoreVertical, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Comment {
  id: string;
  author: {
    name: string;
    photo?: string;
  };
  text: string;
  likes: number;
  isLiked: boolean;
  timeAgo: string;
  replyCount?: number;
}

interface CommentCardProps {
  comment: Comment;
  onLike?: () => void;
  onReply?: () => void;
  onMore?: () => void;
  isReply?: boolean;
  className?: string;
}

export const CommentCard = ({
  comment,
  onLike,
  onReply,
  onMore,
  isReply = false,
  className,
}: CommentCardProps) => {
  return (
    <div className={cn('flex items-start gap-3', isReply && 'ml-12', className)}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.author.photo} />
        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="bg-muted rounded-2xl px-4 py-2">
          <p className="font-semibold text-sm">{comment.author.name}</p>
          <p className="text-sm mt-0.5">{comment.text}</p>
        </div>

        <div className="flex items-center gap-4 mt-1 px-2">
          <span className="text-xs text-muted-foreground">{comment.timeAgo}</span>

          {onLike && (
            <button
              onClick={onLike}
              className={cn(
                'text-xs font-medium hover:underline',
                comment.isLiked ? 'text-red-600' : 'text-muted-foreground'
              )}
            >
              {comment.likes > 0 ? `${comment.likes} Likes` : 'Like'}
            </button>
          )}

          {onReply && !isReply && (
            <button
              onClick={onReply}
              className="text-xs font-medium text-muted-foreground hover:underline"
            >
              Reply
            </button>
          )}

          {comment.replyCount && comment.replyCount > 0 && (
            <button
              onClick={onReply}
              className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
            >
              <Reply className="h-3 w-3" />
              {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
            </button>
          )}
        </div>
      </div>

      {onMore && (
        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={onMore}>
          <MoreVertical className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
