import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Pause, Play, RotateCcw, Check, AlertCircle, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WaveformVisualizer } from '@/components/chat/WaveformVisualizer';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VoiceRegistrationProps {
  onComplete: (transcript: string) => void;
  onError?: () => void;
  prompt: string;
  minWords?: number;
}

export const VoiceRegistration = ({ 
  onComplete, 
  onError,
  prompt,
  minWords = 10 
}: VoiceRegistrationProps) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [useTextFallback, setUseTextFallback] = useState(false);
  const [manualText, setManualText] = useState('');
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const {
    transcript,
    isListening,
    confidence,
    error: speechError,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    undoLastSentence,
    setTranscript
  } = useSpeechToText();

  // Voice error handling
  useEffect(() => {
    if (speechError) {
      toast.error('Voice recognition error', {
        description: speechError
      });
      onError?.();
    }
  }, [speechError, onError]);

  const {
    amplitude,
    isRecording
  } = useAudioRecorder();

  // Update waveform data
  useEffect(() => {
    if (isRecording) {
      setWaveformData(prev => [...prev.slice(-39), amplitude]);
    }
  }, [amplitude, isRecording]);

  // Request microphone permission on mount
  useEffect(() => {
    const requestPermission = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setHasPermission(true);
      } catch (err) {
        console.error('Microphone permission denied:', err);
        setHasPermission(false);
        toast.error('Microphone access denied', {
          description: 'Please allow microphone access or use text input'
        });
      }
    };

    requestPermission();
  }, []);

  const handleStartRecording = async () => {
    if (!hasPermission) {
      toast.error('Microphone permission required');
      return;
    }

    startListening();
  };

  const handleStopRecording = () => {
    stopListening();
  };

  const handlePauseResume = () => {
    if (isListening) {
      pauseListening();
    } else {
      resumeListening();
    }
  };

  const handleComplete = () => {
    const finalText = useTextFallback ? manualText : transcript;
    const wordCount = finalText.trim().split(/\s+/).length;

    if (wordCount < minWords) {
      toast.warning(`Please provide at least ${minWords} words`);
      return;
    }

    onComplete(finalText);
  };

  const handleSwitchToText = () => {
    setUseTextFallback(true);
    stopListening();
    setManualText(transcript);
  };

  const wordCount = (useTextFallback ? manualText : transcript).trim().split(/\s+/).filter(w => w.length > 0).length;
  const isComplete = wordCount >= minWords;

  // Permission denied or error state
  if (hasPermission === false || speechError?.includes('not supported')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Microphone Not Available</h3>
        <p className="text-muted-foreground text-center mb-6">
          {speechError || 'We need microphone access for voice registration'}
        </p>
        <Button onClick={() => setUseTextFallback(true)}>
          <Keyboard className="w-4 h-4 mr-2" />
          Use Text Input Instead
        </Button>
      </div>
    );
  }

  // Loading permission state
  if (hasPermission === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-pulse">
          <Mic className="w-16 h-16 text-primary mb-4" />
        </div>
        <p className="text-muted-foreground">Requesting microphone access...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-6">
      {/* Prompt */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">{prompt}</h2>
        <p className="text-sm text-muted-foreground">
          {useTextFallback 
            ? 'Type your response below'
            : 'Speak naturally - we\'ll transcribe your words in real-time'
          }
        </p>
      </div>

      <AnimatePresence mode="wait">
        {useTextFallback ? (
          // Text fallback mode
          <motion.div
            key="text-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col"
          >
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Type your response here..."
              className={cn(
                "flex-1 w-full p-4 rounded-lg resize-none",
                "bg-background border-2 border-border",
                "focus:border-primary focus:outline-none",
                "text-base"
              )}
            />
            
            {/* Word count */}
            <div className="mt-4 flex items-center justify-between">
              <span className={cn(
                "text-sm",
                isComplete ? "text-success" : "text-muted-foreground"
              )}>
                {wordCount} / {minWords} words
              </span>
              <Button
                onClick={() => setUseTextFallback(false)}
                variant="ghost"
                size="sm"
              >
                <Mic className="w-4 h-4 mr-2" />
                Switch to Voice
              </Button>
            </div>
          </motion.div>
        ) : (
          // Voice mode
          <motion.div
            key="voice-mode"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col"
          >
            {/* Waveform visualization */}
            {isListening && (
              <div className="mb-6 bg-muted/30 rounded-lg p-4">
                <WaveformVisualizer
                  amplitude={amplitude}
                  waveformData={waveformData}
                  maxBars={40}
                  height={80}
                />
              </div>
            )}

            {/* Transcript display */}
            <div className={cn(
              "flex-1 p-4 rounded-lg overflow-y-auto mb-4",
              "bg-background border-2 border-border",
              "min-h-[200px]"
            )}>
              {transcript ? (
                <p className="text-base leading-relaxed">{transcript}</p>
              ) : (
                <p className="text-muted-foreground italic">
                  {isListening ? 'Start speaking...' : 'Press the microphone to begin'}
                </p>
              )}
            </div>

            {/* Confidence indicator */}
            {confidence > 0 && (
              <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
                <div className="h-1 flex-1 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span>{Math.round(confidence * 100)}% confident</span>
              </div>
            )}

            {/* Word count & controls */}
            <div className="flex items-center justify-between mb-4">
              <span className={cn(
                "text-sm",
                isComplete ? "text-success" : "text-muted-foreground"
              )}>
                {wordCount} / {minWords} words
              </span>
              <div className="flex gap-2">
                <Button
                  onClick={undoLastSentence}
                  variant="ghost"
                  size="sm"
                  disabled={!transcript}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Undo Last
                </Button>
                <Button
                  onClick={handleSwitchToText}
                  variant="ghost"
                  size="sm"
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  Type Instead
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom controls */}
      <div className="flex gap-3 justify-center pt-4 border-t">
        {!useTextFallback && (
          <>
            {!isListening ? (
              <Button
                onClick={handleStartRecording}
                size="lg"
                className="min-w-[140px]"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Speaking
              </Button>
            ) : (
              <>
                <Button
                  onClick={handlePauseResume}
                  variant="secondary"
                  size="lg"
                >
                  {isListening ? (
                    <>
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Resume
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleStopRecording}
                  variant="outline"
                  size="lg"
                >
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop
                </Button>
              </>
            )}
          </>
        )}

        <Button
          onClick={handleComplete}
          disabled={!isComplete}
          size="lg"
          className="min-w-[140px]"
        >
          <Check className="w-5 h-5 mr-2" />
          Continue
        </Button>
      </div>

      {/* Error display */}
      {speechError && !useTextFallback && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{speechError}</p>
        </div>
      )}
    </div>
  );
};
