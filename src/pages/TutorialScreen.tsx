import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { VideoTutorialCard } from '@/components/help/VideoTutorialCard';
import { Button } from '@/components/ui/Button';
import { 
  Play, Pause, Maximize, Eye, Calendar, 
  CheckCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function TutorialScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [progress, setProgress] = useState(0);

  const tutorial = {
    id: id || '1',
    title: 'Getting Started with MuslimSoulmate.ai',
    duration: '2:30',
    views: '1.2k',
    lastUpdated: 'Dec 15, 2024',
    chapters: [
      { title: 'Introduction', time: '0:00', duration: 30 },
      { title: 'Creating Your Profile', time: '0:30', duration: 45 },
      { title: 'Building Your DNA', time: '1:15', duration: 60 },
      { title: 'Finding Matches', time: '2:15', duration: 15 },
    ],
  };

  const relatedTutorials = [
    { title: 'Creating Your DNA Profile', duration: '3:45', id: '2' },
    { title: 'Using ChaiChat Effectively', duration: '4:15', id: '3' },
    { title: 'Understanding Match Compatibility', duration: '3:20', id: '4' },
  ];

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // Implement video play/pause logic
  };

  const jumpToChapter = (index: number) => {
    setCurrentChapter(index);
    // Implement chapter jump logic
  };

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Tutorial"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20">
        {/* Video Player */}
        <div className="relative w-full aspect-video bg-black">
          {/* Video placeholder - in production, use actual video player */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10">
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-primary" />
              ) : (
                <Play className="w-8 h-8 text-primary ml-1" fill="currentColor" />
              )}
            </button>
          </div>

          {/* Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Progress Bar */}
            <div className="w-full h-1 bg-white/30 rounded-full mb-3">
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <button onClick={togglePlay} className="text-white">
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              <span className="text-white text-sm">0:00 / {tutorial.duration}</span>
              <button className="text-white">
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tutorial Info */}
        <div className="px-5 pt-4 pb-3 border-b border-border">
          <h1 className="text-xl font-bold mb-2">{tutorial.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {tutorial.views} views
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {tutorial.lastUpdated}
            </span>
          </div>
        </div>

        {/* Chapters */}
        <div className="px-5 py-4">
          <h2 className="text-lg font-semibold mb-3">Chapters</h2>
          <div className="space-y-2">
            {tutorial.chapters.map((chapter, index) => (
              <BaseCard
                key={index}
                padding="md"
                interactive
                onClick={() => jumpToChapter(index)}
                className={cn(
                  'flex items-center justify-between',
                  currentChapter === index && 'bg-primary/5 border-primary/20'
                )}
              >
                <div className="flex items-center gap-3 flex-1">
                  {currentChapter === index ? (
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
                    </div>
                  ) : currentChapter > index ? (
                    <CheckCircle className="w-6 h-6 text-semantic-success flex-shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-muted flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{chapter.title}</h3>
                    <p className="text-xs text-muted-foreground">{chapter.duration}s</p>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground flex-shrink-0">
                  {chapter.time}
                </span>
              </BaseCard>
            ))}
          </div>
        </div>

        {/* Related Tutorials */}
        <div className="px-5 py-4">
          <h2 className="text-lg font-semibold mb-3">Related Tutorials</h2>
          <div className="space-y-3">
            {relatedTutorials.map((video) => (
              <div
                key={video.id}
                onClick={() => navigate(`/help/tutorial/${video.id}`)}
                className="cursor-pointer"
              >
                <BaseCard padding="sm" interactive className="flex items-center gap-3">
                  <div className="w-24 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded flex-shrink-0 flex items-center justify-center">
                    <Play className="w-6 h-6 text-primary" fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium line-clamp-2 mb-1">{video.title}</h3>
                    <p className="text-xs text-muted-foreground">{video.duration}</p>
                  </div>
                </BaseCard>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
}
