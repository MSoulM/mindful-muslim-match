import { useState, useCallback, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Loader2, Volume2, Check } from 'lucide-react';
import { useVoiceIntro } from '@/hooks/useVoiceIntro';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MIN_DURATION = 5;
const MAX_DURATION = 30;

export function VoiceIntroRecorder() {
  const {
    voiceIntro,
    isLoading,
    isUploading,
    isRecording,
    recordingDuration,
    uploadVoice,
    deleteVoice,
    startRecording,
    stopRecording,
    hasVoiceIntro,
  } = useVoiceIntro();

  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleStartRecording = useCallback(async () => {
    setRecordedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    await startRecording();
  }, [startRecording, previewUrl]);

  const handleStopRecording = useCallback(async () => {
    const blob = await stopRecording();
    if (blob) {
      setRecordedBlob(blob);
      setRecordedDuration(recordingDuration);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    }
  }, [stopRecording, recordingDuration]);

  const handleUpload = useCallback(async () => {
    if (!recordedBlob) return;
    
    const result = await uploadVoice(recordedBlob, recordedDuration);
    if (result) {
      setRecordedBlob(null);
      setRecordedDuration(0);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [recordedBlob, recordedDuration, uploadVoice, previewUrl]);

  const handleDiscard = useCallback(() => {
    setRecordedBlob(null);
    setRecordedDuration(0);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  const handleDelete = useCallback(async () => {
    if (voiceIntro) {
      await deleteVoice(voiceIntro.id);
      setShowDeleteDialog(false);
    }
  }, [voiceIntro, deleteVoice]);

  const togglePlayback = useCallback(() => {
    const url = previewUrl || voiceIntro?.url;
    if (!url) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [previewUrl, voiceIntro?.url, isPlaying]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Voice Introduction</h3>
        {hasVoiceIntro && (
          <span className="flex items-center gap-1 text-sm text-green-600">
            <Check className="w-4 h-4" />
            Complete
          </span>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Record a {MIN_DURATION}-{MAX_DURATION} second voice introduction. This is required before you can message matches.
      </p>

      {/* Existing voice intro */}
      {hasVoiceIntro && voiceIntro && !recordedBlob && (
        <div className="p-4 bg-secondary/50 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayback}
                className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
              <div>
                <p className="font-medium text-foreground">Your Voice Intro</p>
                <p className="text-sm text-muted-foreground">
                  {formatDuration(voiceIntro.durationSeconds)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          {/* Processing status */}
          {voiceIntro.processingStatus === 'processing' && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing your voice...
            </div>
          )}

          {/* Personality markers */}
          {voiceIntro.processingStatus === 'completed' && voiceIntro.personalityMarkers && (
            <div className="flex flex-wrap gap-2">
              {voiceIntro.personalityMarkers.pace && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                  {voiceIntro.personalityMarkers.pace} pace
                </span>
              )}
              {voiceIntro.personalityMarkers.energy && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                  {voiceIntro.personalityMarkers.energy} energy
                </span>
              )}
              {voiceIntro.personalityMarkers.confidence && (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                  {voiceIntro.personalityMarkers.confidence} confidence
                </span>
              )}
            </div>
          )}

          {/* Transcription */}
          {voiceIntro.transcription && (
            <div className="p-3 bg-background rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Transcription:</p>
              <p className="text-sm text-foreground">{voiceIntro.transcription}</p>
            </div>
          )}

          {/* Re-record button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartRecording}
            className="w-full"
          >
            <Mic className="w-4 h-4 mr-2" />
            Record New
          </Button>
        </div>
      )}

      {/* Recording UI */}
      {!hasVoiceIntro && !recordedBlob && !isRecording && (
        <button
          onClick={handleStartRecording}
          className="w-full p-6 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mic className="w-8 h-8 text-primary" />
          </div>
          <span className="font-medium text-foreground">Tap to Record</span>
          <span className="text-sm text-muted-foreground">
            {MIN_DURATION}-{MAX_DURATION} seconds
          </span>
        </button>
      )}

      {/* Active recording */}
      {isRecording && (
        <div className="p-6 bg-primary/5 rounded-xl flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center animate-pulse">
              <Mic className="w-10 h-10 text-white" />
            </div>
            {/* Recording indicator rings */}
            <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping" />
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">
              {formatDuration(recordingDuration)}
            </p>
            <p className="text-sm text-muted-foreground">
              {recordingDuration < MIN_DURATION
                ? `Keep going... ${MIN_DURATION - recordingDuration}s more`
                : `${MAX_DURATION - recordingDuration}s remaining`}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-1000",
                recordingDuration >= MIN_DURATION ? "bg-green-500" : "bg-primary"
              )}
              style={{ width: `${(recordingDuration / MAX_DURATION) * 100}%` }}
            />
          </div>

          <button
            onClick={handleStopRecording}
            disabled={recordingDuration < MIN_DURATION}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center transition-all",
              recordingDuration >= MIN_DURATION
                ? "bg-destructive text-white hover:bg-destructive/90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            <Square className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Preview recorded audio */}
      {recordedBlob && !isRecording && (
        <div className="p-4 bg-secondary/50 rounded-xl space-y-4">
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlayback}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            <div>
              <p className="font-medium text-foreground">Preview Recording</p>
              <p className="text-sm text-muted-foreground">
                {formatDuration(recordedDuration)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDiscard}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Discard
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
              )}
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voice Introduction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove your voice introduction. You'll need to record a new one before messaging matches.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
