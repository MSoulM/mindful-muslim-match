import { useEffect, useState } from 'react';
import { X, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioRecorder, AudioRecordingResult } from '@/hooks/useAudioRecorder';
import { WaveformVisualizer } from './WaveformVisualizer';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface VoiceNoteRecorderProps {
  onSend: (result: AudioRecordingResult) => void;
  onCancel: () => void;
  maxDuration?: number;
}

export const VoiceNoteRecorder = ({
  onSend,
  onCancel,
  maxDuration = 60
}: VoiceNoteRecorderProps) => {
  const { isRecording, duration, amplitude, startRecording, stopRecording, cancelRecording } = useAudioRecorder(maxDuration);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    // Start recording immediately on mount
    startRecording().catch((error) => {
      console.error('Failed to start recording:', error);
      setPermissionError('Microphone access denied. Please enable microphone permissions.');
    });

    return () => {
      cancelRecording();
    };
  }, []);

  useEffect(() => {
    // Update waveform data as amplitude changes
    if (isRecording) {
      setWaveformData(prev => [...prev, amplitude]);
    }
  }, [amplitude, isRecording]);

  const handleSend = async () => {
    const result = await stopRecording();
    if (result.duration > 0) {
      onSend(result);
    }
  };

  const handleCancel = () => {
    cancelRecording();
    onCancel();
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (permissionError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <div className="bg-card border border-border rounded-lg p-6 max-w-sm w-full text-center">
          <p className="text-destructive mb-4">{permissionError}</p>
          <Button onClick={onCancel} className="w-full">
            Close
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
    >
      <div className="h-full flex flex-col safe-area">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button
            variant="ghost"
            onClick={handleCancel}
            className="text-destructive hover:text-destructive"
          >
            Cancel
          </Button>
          <span className="text-sm font-medium">Recording Voice Note</span>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        {/* Waveform Visualizer */}
        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-full max-w-md">
            <WaveformVisualizer
              amplitude={amplitude}
              waveformData={waveformData}
              maxBars={40}
              height={120}
              className="mb-8"
            />
          </div>

          {/* Timer */}
          <div className="text-center mb-12">
            <div className={cn(
              "text-5xl font-mono font-bold mb-2",
              duration >= maxDuration - 5 && "text-destructive animate-pulse"
            )}>
              {formatDuration(duration)}
            </div>
            <div className="text-sm text-muted-foreground">
              {duration >= maxDuration - 5 ? (
                <span className="text-destructive">Maximum duration reached</span>
              ) : (
                `Max ${formatDuration(maxDuration)}`
              )}
            </div>
          </div>

          {/* Recording Indicator */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
            <span className="text-sm text-muted-foreground">Recording...</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-12 p-8 border-t border-border">
          <Button
            variant="outline"
            size="icon"
            onClick={handleCancel}
            className="h-14 w-14 rounded-full border-destructive text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-6 w-6" />
          </Button>

          <div className="relative">
            <div className="absolute inset-0 bg-destructive/20 rounded-full animate-ping" />
            <div className="relative h-20 w-20 bg-destructive rounded-full flex items-center justify-center">
              <div className="h-6 w-6 bg-white rounded-full" />
            </div>
          </div>

          <Button
            size="icon"
            onClick={handleSend}
            disabled={duration < 1}
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90"
          >
            <Send className="h-6 w-6" />
          </Button>
        </div>

        {/* Slide to Cancel hint (mobile) */}
        <div className="text-center pb-4 text-xs text-muted-foreground md:hidden">
          Tap cancel or send when done
        </div>
      </div>
    </motion.div>
  );
};
