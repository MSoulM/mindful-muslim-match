import { Play } from 'lucide-react';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Badge } from '@/components/ui/badge';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';

interface VideoTutorialCardProps {
  title: string;
  duration: string;
  thumbnail?: string;
  onClick: () => void;
}

export const VideoTutorialCard = ({
  title,
  duration,
  thumbnail,
  onClick,
}: VideoTutorialCardProps) => {
  return (
    <div className="flex-shrink-0 w-[200px]" onClick={onClick}>
      <BaseCard padding="none" interactive className="overflow-hidden">
        {/* Thumbnail */}
        <div className="relative w-full h-[110px] bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center overflow-hidden">
          {thumbnail ? (
            <ProgressiveImage
              src={thumbnail}
              alt={title}
              className="w-full h-full"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
              <Play className="w-6 h-6 text-primary ml-1" fill="currentColor" />
            </div>
          )}
          <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs">
            {duration}
          </Badge>
        </div>
        
        {/* Title */}
        <div className="p-3">
          <h3 className="text-sm font-medium line-clamp-2">{title}</h3>
        </div>
      </BaseCard>
    </div>
  );
};
