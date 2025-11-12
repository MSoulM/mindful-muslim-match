import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Heart, MapPin, Calendar } from 'lucide-react';

interface SuccessStoryCardProps {
  couple: {
    name1: string;
    name2: string;
    location: string;
    matchDate: string;
    story: string;
    image?: string;
  };
}

export const SuccessStoryCard = ({ couple }: SuccessStoryCardProps) => {
  return (
    <BaseCard padding="md" className="overflow-hidden">
      {/* Image */}
      {couple.image ? (
        <div className="w-full h-48 rounded-lg mb-4 overflow-hidden">
          <img 
            src={couple.image} 
            alt={`${couple.name1} and ${couple.name2}`}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-48 rounded-lg mb-4 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <Heart className="w-16 h-16 text-primary/40" fill="currentColor" />
        </div>
      )}

      {/* Couple Info */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <h3 className="text-lg font-semibold">{couple.name1}</h3>
        <Heart className="w-5 h-5 text-semantic-error" fill="currentColor" />
        <h3 className="text-lg font-semibold">{couple.name2}</h3>
      </div>

      {/* Details */}
      <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-3">
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {couple.location}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          {couple.matchDate}
        </span>
      </div>

      {/* Story */}
      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
        "{couple.story}"
      </p>
    </BaseCard>
  );
};
