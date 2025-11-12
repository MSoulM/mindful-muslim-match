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

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * audioRef.current.duration;
    
    audioRef.current.currentTime = newTime;
    setProgress(percentage);
    setCurrentTime(newTime);
  };
  
  return (
    <div className={cn(
      "flex items-center gap-3 px-3 py-2 rounded-2xl min-w-[240px]",
      isOwn
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-foreground"
    )}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handlePlayPause}
        disabled={!audioUrl}
        className={cn(
          "shrink-0 h-9 w-9 rounded-full transition-transform active:scale-95",
          isOwn ? "hover:bg-primary-foreground/20" : "hover:bg-background",
          !audioUrl && "opacity-50 cursor-not-allowed"
        )}
      >
        {isPlaying ? (
          <Pause className="h-4 w-4 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current ml-0.5" />
        )}
      </Button>
      
      <div className="flex-1 flex flex-col gap-1.5">
        {/* Waveform with click-to-seek */}
        <div 
          className="flex items-center gap-0.5 h-10 cursor-pointer"
          onClick={handleWaveformClick}
          role="slider"
          aria-label="Audio progress"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
        >
          {waveform.map((amplitude, index) => {
            const barProgress = index / waveform.length;
            const isPlayed = barProgress <= progress;
            
            return (
              <div
                key={index}
                className={cn(
                  "flex-1 rounded-full transition-all duration-150 min-w-[2px]",
                  isOwn 
                    ? isPlayed 
                      ? "bg-primary-foreground" 
                      : "bg-primary-foreground/30"
                    : isPlayed
                      ? "bg-primary"
                      : "bg-foreground/30"
                )}
                style={{ 
                  height: `${Math.max(12, amplitude * 40)}px`,
                  opacity: isPlayed ? 1 : 0.4
                }}
              />
            );
          })}
        </div>
        
        {/* Progress bar for better visibility */}
        <div className={cn(
          "h-0.5 rounded-full overflow-hidden",
          isOwn ? "bg-primary-foreground/20" : "bg-foreground/20"
        )}>
          <div 
            className={cn(
              "h-full transition-all duration-100",
              isOwn ? "bg-primary-foreground" : "bg-primary"
            )}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-1 shrink-0">
        {/* Speed control */}
        <button
          onClick={cycleSpeed}
          disabled={!audioUrl}
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-md transition-colors",
            isOwn 
              ? "hover:bg-primary-foreground/20 active:bg-primary-foreground/30" 
              : "hover:bg-background/50 active:bg-background/70",
            !audioUrl && "opacity-50 cursor-not-allowed"
          )}
        >
          {playbackSpeed}×
        </button>
        
        {/* Time display */}
        <span className="text-xs font-mono font-medium tabular-nums">
          {isPlaying ? formatTime(currentTime) : formatTime(duration)}
        </span>
      </div>
    </div>
  );
};
