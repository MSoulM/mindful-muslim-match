import { useState, useEffect, useRef, useCallback } from 'react';
import * as sdk from 'microsoft-cognitiveservices-speech-sdk';

const SPEECH_KEY = import.meta.env.VITE_AZURE_SPEECH_KEY;;
const SPEECH_REGION = import.meta.env.VITE_AZURE_SPEECH_REGION;

export const useSpeechToText = (language: string = 'en-US') => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognizerRef = useRef<sdk.SpeechRecognizer | null>(null);
  const audioConfigRef = useRef<sdk.AudioConfig | null>(null);
  const finalTranscriptRef = useRef<string>('');

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
    // Request detailed results to get confidence scores
    speechConfig.requestWordLevelTimestamps();
    speechConfig.setProperty(sdk.PropertyId.SpeechServiceResponse_RequestSentenceBoundary, "true");

    const recognizer = new sdk.SpeechRecognizer(speechConfig, audioConfigRef.current);
    recognizerRef.current = recognizer;

    recognizer.recognizing = (_, event) => {
      const interim = event.result.text || '';
      setTranscript(finalTranscriptRef.current + interim);
    };
    
    recognizer.recognized = (_, event) => {
      if (event.result.reason === sdk.ResultReason.RecognizedSpeech) {
        const text = event.result.text.trim();
        if (text) {
          let confScore = 0;
          try {
            // Get JSON result from properties
            const jsonResult = event.result.properties?.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult);
            if (jsonResult) {
              const json = JSON.parse(jsonResult);
              
              if (json.NBest && Array.isArray(json.NBest) && json.NBest.length > 0) {
                confScore = json.NBest[0].Confidence || json.NBest[0].confidence || 0;
              } else if (json.Confidence !== undefined) {
                confScore = json.Confidence;
              } else if (json.confidence !== undefined) {
                confScore = json.confidence;
              }
              
              if (confScore === 0) {
                console.log('JSON result structure:', JSON.stringify(json, null, 2));
              }
            } else {
              console.warn('No JSON result property found');
            }
          } catch (err) {
            console.warn('Error parsing confidence:', err);
            confScore = 0;
          }
          
          // Set confidence (convert to percentage if needed, or keep as 0-1)
          setConfidence(confScore);
          finalTranscriptRef.current = finalTranscriptRef.current + (finalTranscriptRef.current && !finalTranscriptRef.current.endsWith(' ') ? ' ' : '') + text + ' ';
          setTranscript(finalTranscriptRef.current);
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
    finalTranscriptRef.current = '';
    setTranscript('');
    setConfidence(0);
  }, []);

  const undoLastSentence = useCallback(() => {
    const sentences = finalTranscriptRef.current.trim().split(/[.!?]\s+/);
    if (sentences.length > 1) {
      sentences.pop();
      const newTranscript = sentences.join('. ') + (sentences.length > 0 ? '. ' : '');
      finalTranscriptRef.current = newTranscript;
      setTranscript(newTranscript);
    } else {
      finalTranscriptRef.current = '';
      setTranscript('');
    }
  }, []);

  const updateTranscript = useCallback((newTranscript: string) => {
    finalTranscriptRef.current = newTranscript;
    setTranscript(newTranscript);
  }, []);

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
    setTranscript: updateTranscript
  }
}