/**
 * PostCard Component
 * Displays a post with media, caption, engagement, and actions
 */

import { Heart, MessageCircle, Share2, MoreVertical, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export interface PostData {
  id: string;
  author: {
    id: string;
    name: string;
    photo?: string;
    dnaScore: number;
  };
  media: {
    type: 'image' | 'video';
    url: string;
  }[];
  caption?: string;
  categories: string[];
  location?: string;
  privacy: 'everyone' | 'matches' | 'premium' | 'private';
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    isLiked: boolean;
  };
  createdAt: string;
}

interface PostCardProps {
  post: PostData;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onAuthorClick?: (authorId: string) => void;
  onMoreClick?: (postId: string) => void;
  className?: string;
}

export const PostCard = ({
  post,
  onLike,
  onComment,
  onShare,
  onAuthorClick,
  onMoreClick,
  className,
}: PostCardProps) => {
  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={() => onAuthorClick?.(post.author.id)}
          className="flex items-center gap-3 flex-1 min-w-0"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.photo} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-semibold truncate">{post.author.name}</p>
            <p className="text-xs text-muted-foreground">
              DNA {post.author.dnaScore}% • {new Date(post.createdAt).toLocaleDateString()}
            </p>
          </div>
        </button>
        {onMoreClick && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onMoreClick(post.id)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Media */}
      {post.media.length > 0 && (
        <div className="relative aspect-square bg-muted">
          {post.media[0].type === 'image' ? (
            <img
              src={post.media[0].url}
              alt="Post media"
              className="w-full h-full object-cover"
            />
          ) : (
            <video
              src={post.media[0].url}
              controls
              className="w-full h-full object-cover"
            />
          )}
          {post.media.length > 1 && (
            <Badge className="absolute top-3 right-3">
              +{post.media.length - 1}
            </Badge>
          )}
        </div>
      )}

      {/* Engagement Bar */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn('gap-2', post.engagement.isLiked && 'text-red-600')}
            onClick={() => onLike?.(post.id)}
          >
            <Heart className={cn('h-5 w-5', post.engagement.isLiked && 'fill-current')} />
            <span>{post.engagement.likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => onComment?.(post.id)}
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.engagement.comments}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => onShare?.(post.id)}
          >
            <Share2 className="h-5 w-5" />
            <span>{post.engagement.shares}</span>
          </Button>
        </div>

        {/* Caption */}
        {post.caption && (
          <p className="text-sm">
            <span className="font-semibold mr-2">{post.author.name}</span>
            {post.caption}
          </p>
        )}

        {/* Categories & Location */}
        <div className="flex items-center flex-wrap gap-2">
          {post.categories.map((category) => (
            <Badge key={category} variant="secondary" className="text-xs">
              {category}
            </Badge>
          ))}
          {post.location && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{post.location}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
