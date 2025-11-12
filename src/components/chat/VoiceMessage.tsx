import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VoiceMessageProps {
  duration: number;
  waveform: number[];
  audioUrl?: string;
  isOwn?: boolean;
}

export const VoiceMessage = ({ duration, waveform, audioUrl, isOwn }: VoiceMessageProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (audioUrl && !audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
          setProgress(audioRef.current.currentTime / audioRef.current.duration);
        }
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [audioUrl]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);
  
  const handlePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const cycleSpeed = () => {
    const speeds = [1, 1.5, 2];
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIndex]);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-2xl min-w-[200px]",
      isOwn
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-foreground"
    )}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePlayPause}
        className={cn(
          "shrink-0 h-8 w-8 rounded-full",
          isOwn ? "hover:bg-primary-foreground/20" : "hover:bg-background"
        )}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>
      
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex items-center gap-0.5 h-8">
          {waveform.map((amplitude, index) => (
            <div
              key={index}
              className={cn(
                "w-1 rounded-full transition-all",
                isOwn ? "bg-primary-foreground/70" : "bg-foreground/70",
                index < progress * waveform.length && "opacity-100",
                index >= progress * waveform.length && "opacity-30"
              )}
              style={{ height: `${amplitude * 100}%` }}
            />
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={cycleSpeed}
          className="text-xs font-medium px-2 py-0.5 rounded hover:bg-background/10"
        >
          {playbackSpeed}x
        </button>
        <span className="text-xs font-medium">
          {isPlaying ? formatTime(currentTime) : formatTime(duration)}
        </span>
      </div>
    </div>
  );
};
