import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronRight, Coffee, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { InfoCard } from '@/components/ui/Cards/InfoCard';
import { useState } from 'react';
import { hoverLift } from '@/utils/animations';
import { ProgressiveImage } from '@/components/ui/ProgressiveImage';

interface MatchCardProps {
  match: {
    id: string;
    name: string;
    age: number;
    location: string;
    distance: string;
    compatibility: number;
    bio: string;
    emoji: string;
    photoUrl?: string;
    insights?: string;
    chaiChat?: {
      topicsCount: number;
      strength: 'Strong' | 'Moderate' | 'Building';
    };
  };
  onChaiChatClick?: () => void;
  onSkip?: () => void;
  variant?: 'full' | 'compact';
  className?: string;
}

export const MatchCard = ({
  match,
  onChaiChatClick,
  onSkip,
  variant = 'full',
  className,
}: MatchCardProps) => {
  const [bioExpanded, setBioExpanded] = useState(false);
  const [showLikeAnimation, setShowLikeAnimation] = useState(false);

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'from-semantic-success to-primary-forest';
    if (score >= 60) return 'from-primary-gold to-primary-forest';
    return 'from-primary-forest to-neutral-600';
  };

  if (variant === 'compact') {
    return (
      <motion.article
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          'bg-white rounded-xl border border-neutral-200 shadow-sm',
          'p-4 flex gap-4 items-center',
          className
        )}
        role="article"
        aria-label={`Match with ${match.name}, ${match.age} years old, ${match.compatibility}% compatibility`}
      >
        {/* Photo */}
        <div className="w-[120px] h-[120px] flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-primary-forest to-primary-gold flex items-center justify-center">
          {match.photoUrl ? (
            <ProgressiveImage
              src={match.photoUrl}
              alt={`Photo of ${match.name}`}
              className="w-full h-full"
            />
          ) : (
            <span className="text-6xl" aria-hidden="true">{match.emoji}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-neutral-900 truncate">
            {match.name}, {match.age}
          </h3>
          <p className="text-sm text-neutral-600 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5" />
            {match.location} • {match.distance}
          </p>
          <div className="mt-2">
            <span
              className={cn(
                'inline-block px-3 py-1 rounded-full text-xs font-semibold text-white',
                `bg-gradient-to-r ${getCompatibilityColor(match.compatibility)}`
              )}
            >
              {match.compatibility}% Match
            </span>
          </div>
        </div>

        <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" aria-hidden="true" />
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      style={{ willChange: 'transform, opacity' }}
      {...hoverLift}
      className={cn('bg-white rounded-2xl border border-neutral-200 shadow-lg overflow-hidden', className)}
      role="article"
      aria-label={`Match with ${match.name}, ${match.age} years old from ${match.location}. ${match.compatibility}% compatibility.`}
    >
      {/* Like Animation Overlay */}
      <AnimatePresence>
        {showLikeAnimation && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.2, 0], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
          >
            <Heart className="w-32 h-32 text-semantic-error fill-current drop-shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <header className="p-4 flex items-start gap-3">
        <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gradient-to-br from-primary-forest to-primary-gold flex items-center justify-center text-2xl" aria-hidden="true">
          {match.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-neutral-900">
            {match.name}, {match.age}
          </h2>
          <p className="text-sm text-neutral-600 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{match.location} • {match.distance}</span>
          </p>
        </div>
        <div
          className={cn(
            'px-3 py-1.5 rounded-full text-xs font-semibold text-white',
            `bg-gradient-to-r ${getCompatibilityColor(match.compatibility)}`
          )}
          aria-label={`${match.compatibility}% compatibility match`}
        >
          {match.compatibility}% Match
        </div>
      </header>

      {/* Photo */}
      <div 
        className="relative w-full h-[380px] sm:h-[420px] bg-gradient-to-br from-primary-forest/20 to-primary-gold/20"
        onDoubleClick={() => {
          setShowLikeAnimation(true);
          setTimeout(() => setShowLikeAnimation(false), 600);
        }}
        role="img"
        aria-label={`Photo of ${match.name}`}
      >
        {match.photoUrl ? (
          <ProgressiveImage
            src={match.photoUrl}
            alt={`Photo of ${match.name}`}
            className="w-full h-full"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[128px] opacity-50" aria-hidden="true">{match.emoji}</span>
          </div>
        )}
      </div>

      {/* Bio */}
      <section className="p-4" aria-label="Biography">
        <div className="relative">
          <p
            className={cn(
              'text-md text-neutral-700 leading-relaxed',
              !bioExpanded && 'line-clamp-4'
            )}
          >
            {match.bio}
          </p>
          {match.bio.length > 200 && !bioExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent" />
          )}
        </div>
        {match.bio.length > 200 && (
          <button
            onClick={() => setBioExpanded(!bioExpanded)}
            className="text-sm text-primary-forest font-medium mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded"
            aria-expanded={bioExpanded}
            aria-label={bioExpanded ? 'Show less biography' : 'Show more biography'}
          >
            {bioExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </section>

      {/* ChaiChat Preview */}
      {match.chaiChat && onChaiChatClick && (
        <div className="px-4 pb-4">
          <button
            onClick={onChaiChatClick}
            className={cn(
              'w-full p-4 rounded-xl border-2 border-semantic-warning',
              'bg-semantic-warning/8 hover:bg-semantic-warning/12',
              'transition-all duration-200',
              'active:scale-[0.98]',
              'flex items-center gap-3'
            )}
          >
            <Coffee className="w-6 h-6 text-semantic-warning flex-shrink-0" />
            <div className="flex-1 text-left">
              <p className="text-md font-semibold text-neutral-900">
                Review AI Conversation
              </p>
              <p className="text-sm text-neutral-600">
                {match.chaiChat.topicsCount} topics • {match.chaiChat.strength} compatibility
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-neutral-400 flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Agent Insight */}
      {match.insights && (
        <div className="px-4 pb-4">
          <InfoCard
            variant="highlight"
            icon={<span className="text-2xl">💡</span>}
            description={match.insights}
          />
        </div>
      )}

      {/* Actions */}
      {onSkip && (
        <div className="p-4 pt-0">
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onSkip}
            aria-label={`Skip match with ${match.name} for now`}
          >
            Skip for Now
          </Button>
        </div>
      )}
    </motion.article>
  );
};
