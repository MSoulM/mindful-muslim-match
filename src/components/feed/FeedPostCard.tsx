/**
 * FeedPostCard Component
 * Feed-optimized post card with inline comments preview
 */

import { Heart, MessageCircle, Share2, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface FeedPost {
  id: string;
  author: {
    name: string;
    photo?: string;
    dnaScore: number;
  };
  media?: string;
  caption: string;
  categories: string[];
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
  };
  topComments?: {
    author: string;
    text: string;
  }[];
  timeAgo: string;
}

interface FeedPostCardProps {
  post: FeedPost;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onMore?: () => void;
  onClick?: () => void;
  className?: string;
}

export const FeedPostCard = ({
  post,
  onLike,
  onComment,
  onShare,
  onMore,
  onClick,
  className,
}: FeedPostCardProps) => {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={post.author.photo} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{post.author.name}</p>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              DNA {post.author.dnaScore}%
            </Badge>
            <span className="text-xs text-muted-foreground">{post.timeAgo}</span>
          </div>
        </div>
        {onMore && (
          <Button variant="ghost" size="icon" onClick={onMore}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Caption */}
      <div className="px-4 pb-3">
        <p className="text-sm line-clamp-3">{post.caption}</p>
        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.categories.map((cat) => (
              <span key={cat} className="text-xs text-primary">
                #{cat.toLowerCase().replace(/ /g, '')}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      {post.media && (
        <div className="relative aspect-[4/3] bg-muted cursor-pointer" onClick={onClick}>
          <img
            src={post.media}
            alt="Post media"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Engagement */}
      <div className="p-4 pt-3 space-y-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-2', post.engagement.isLiked && 'text-red-600')}
            onClick={onLike}
          >
            <Heart className={cn('h-5 w-5', post.engagement.isLiked && 'fill-current')} />
            <span className="text-sm">{post.engagement.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={onComment}>
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">{post.engagement.comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2 ml-auto" onClick={onShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Top Comments Preview */}
        {post.topComments && post.topComments.length > 0 && (
          <div className="space-y-1">
            {post.topComments.slice(0, 2).map((comment, idx) => (
              <p key={idx} className="text-sm">
                <span className="font-semibold mr-1">{comment.author}</span>
                <span className="text-muted-foreground line-clamp-1">{comment.text}</span>
              </p>
            ))}
            {post.engagement.comments > 2 && (
              <button
                onClick={onComment}
                className="text-sm text-muted-foreground hover:underline"
              >
                View all {post.engagement.comments} comments
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
