import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Pause, Play, RotateCcw, Check, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { VoiceRegistrationProps } from '@/types/onboarding';
import { useSpeechRecorder } from '@/hooks/useSpeechRecorder';

export const VoiceRegistration = ({
  onComplete,
  onError,
  prompt,
  minWords = 10
}: VoiceRegistrationProps) => {
  const [useTextFallback, setUseTextFallback] = useState(false);
  const [manualText, setManualText] = useState('');

  const { transcript, isListening, confidence, error: speechError, startListening, stopListening, pauseListening, resumeListening, undoLastSentence, clearTranscript } = useSpeechToText('en-US');
  const { startRecordingAudio, stopRecordingAudio, playAudio, audioUrl } = useSpeechRecorder();

  useEffect(() => {
    if (speechError) {
      toast.error('Voice recognition error', {
        description: speechError
      });
      onError?.();
    }
  }, [speechError, onError]);

  const handleStartRecording = () => {
    startListening();
    startRecordingAudio();
  };

  const handleStopRecording = () => {
    stopListening();
    stopRecordingAudio();
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

    // Reset transcript and manual text after completion
    clearTranscript();
    setManualText('');
  };

  const handleSwitchToText = () => {
    setUseTextFallback(true);
    stopListening();
    setManualText(transcript);
  };

  const wordCount = (useTextFallback ? manualText : transcript).trim().split(/\s+/).filter(w => w.length > 0).length;
  const isComplete = wordCount >= minWords;

  return (
    <div className="flex flex-col h-full max-w-2xl w-full mx-auto gap-1 sm:gap-2">
      {/* Prompt */}
      <div className='flex flex-col gap-1 sm:gap-2'>
        <h2 className="text-xl font-semibold">{prompt}</h2>
        <p className="text-sm text-muted-foreground pb-1">
          {useTextFallback
            ? 'Type your response below'
            : 'Speak naturally - we\'ll transcribe your words in real-time'
          }
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="voice-mode"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="flex-1 flex flex-col gap-2"
        >
          {useTextFallback ?
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Type your response here..."
              className={cn(
                "flex-1 w-full p-4 rounded-lg resize-none min-h-[200px]",
                "bg-background border-2 border-border",
                "focus:border-primary focus:outline-none",
                "text-base"
              )}
            />
            : <div className={cn(
              "flex-1 rounded-lg overflow-y-auto p-4",
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
          }

          {!useTextFallback && confidence > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
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

          <div className="flex items-center justify-between">
            <span className={cn(
              "text-sm",
              isComplete ? "text-success" : "text-muted-foreground"
            )}>
              {wordCount} / {minWords} <span className='hidden md:inline'>words</span>
            </span>
            {/* {useTextFallback ?
              <Button
                onClick={() => setUseTextFallback(false)}
                variant="ghost"
                size="sm"
              >
                <Mic className="w-4 h-4" />
                <p className='hidden sm:block'>Switch to Voice</p>
              </Button> :
              <div className="flex gap-2">
                <Button
                  onClick={undoLastSentence}
                  variant="ghost"
                  size="sm"
                  disabled={!transcript}
                >
                  <RotateCcw className="w-4 h-4" />
                  <p className='hidden md:block'>Undo Last</p>
                </Button>
                <Button
                  onClick={handleSwitchToText}
                  variant="ghost"
                  size="sm"
                >
                  <Keyboard className="w-4 h-4" />
                  <p className='hidden md:block'>Type Instead</p>
                </Button>
              </div>
            } */}
          </div>
        </motion.div>
      </AnimatePresence>

      <hr />

      {/* Bottom controls */}
      <div className="flex flex-row-reverse gap-3 justify-between">
        <Button
          onClick={handleComplete}
          disabled={!isComplete}
          size="sm"
          className="gap-2"
        >
          <Check className="w-5 h-5" />
          <p className='hidden sm:block'>Continue</p>
        </Button>

        {!useTextFallback && (
          <>
            {!isListening ?
              <>
                {audioUrl && (
                  <Button onClick={playAudio} size="sm">
                    <Play className="w-5 h-5" />
                    <span className="hidden sm:block">Play</span>
                  </Button>
                )}
                <Button
                  onClick={handleStartRecording}
                  size="sm"
                  className="gap-2"
                >
                  <Mic className="w-5 h-5" />
                  <p className='hidden sm:block'>Start Speaking</p>
                </Button>
              </> : <>
                <Button
                  onClick={handlePauseResume}
                  variant="secondary"
                  size="sm"
                >
                  {isListening ? <>
                    <Pause className="w-5 h-5" />
                    <p className='hidden sm:block'>Pause</p>
                  </> : <>
                    <Play className="w-5 h-5" />
                    <p className='hidden sm:block'>Resume</p>
                  </>
                  }
                </Button>
                <Button
                  onClick={handleStopRecording}
                  variant="outline"
                  size="sm"
                >
                  <MicOff className="w-5 h-5" />
                  <p className='hidden sm:block'>Stop</p>
                </Button>
              </>
            }
          </>
        )}
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
