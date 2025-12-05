import { useState, useEffect, useRef, useCallback } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

interface AzureSpeechToTextProps {
  transcript: string;
  isListening: boolean;
  confidence: number;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  pauseListening: () => void;
  resumeListening: () => void;
  clearTranscript: () => void;
  undoLastSentence: () => void;
  setTranscript: (text: string) => void;
}

const SPEECH_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY;;
const SPEECH_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION;

export const useSpeechToText = (language: string = 'en-US') => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognizerRef = useRef<sdk.SpeechRecognizer | null>(null);
  const audioConfigRef = useRef<sdk.AudioConfig | null>(null);

  useEffect(() => {
    if (!SPEECH_KEY || !SPEECH_REGION) {
      setError('Azure Speech key or region not configured');
      return;
    }

    audioConfigRef.current = sdk.AudioConfig.fromDefaultMicrophoneInput();

    const speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
    speechConfig.speechRecognitionLanguage = language;
    speechConfig.enableAudioLogging();
    speechConfig.setProperty(sdk.PropertyId.Speech_SegmentationSilenceTimeoutMs, "1000");

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfigRef.current);
    recognizerRef.current = recognizer;

    recognizer.recognizing = (_, event) => {
      const interim = event.result.text || '';
      setTranscript(prev => {
        const finalPart = prev.replace(/ ?[\u200B-\u200D\uFEFF]+$/, '');
        return finalPart + interim;
      });
    };
    
    recognizer.recognized = (_, event) => {
      if (event.result.reason === sdk.ResultReason.RecognizedSpeech) {
        const text = event.result.text.trim();
        if (text) {
          const conf = event.result.properties?.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult);
          let confScore = 0.9;
          try {
            const json = JSON.parse(conf || '{}');
            confScore = json.NBest?.[0]?.Confidence || 0.9;
          } catch {}
          
          setConfidence(confScore);
          setTranscript(prev => prev + (prev.endsWith(' ') ? '' : ' ') + text + ' ');
        }
      } else if (event.result.reason === sdk.ResultReason.NoMatch) {
        setError('No speech could be recognized.');
      }
    };

    recognizer.canceled = (_, event) => {
      let msg = 'Recognition canceled.';
      if (event.reason === sdk.CancellationReason.Error) {
        msg = `Error: ${event.errorDetails} (Code: ${event.errorCode})`;
      }
      setError(msg);
      setIsListening(false);
    };

    recognizer.sessionStarted = () => {
      setIsListening(true);
      setError(null);
    };

    recognizer.sessionStopped = () => {
      setIsListening(false);
    };

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stopContinuousRecognitionAsync();
        recognizerRef.current.close();
      }
      if (audioConfigRef.current) {
        audioConfigRef.current.close();
      }
    };
  }, [language]);

  const startListening = useCallback(() => {
    if (!recognizerRef.current) {
      setError('Recognizer not initialized');
      return;
    }

    setError(null);
    recognizerRef.current.startContinuousRecognitionAsync(
      () => console.log('Azure STT started'),
      (err) => {
        setError('Failed to start recognition');
      }
    );
  }, []);

  const stopListening = useCallback(() => {
    if (recognizerRef.current) {
      recognizerRef.current.stopContinuousRecognitionAsync();
    }
  }, []);

  const pauseListening = stopListening;
  const resumeListening = startListening;

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setConfidence(0);
  }, []);

  const undoLastSentence = useCallback(() => {
    const sentences = transcript.trim().split(/[.!?]\s+/);
    if (sentences.length > 1) {
      sentences.pop();
      setTranscript(sentences.join('. ') + (sentences.length > 0 ? '. ' : ''));
    } else {
      setTranscript('');
    }
  }, [transcript]);

  return {
    transcript,
    isListening,
    confidence,
    error,
    startListening,
    stopListening,
    pauseListening,
    resumeListening,
    clearTranscript,
    undoLastSentence,
    setTranscript
  }
}