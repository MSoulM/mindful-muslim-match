import { useEffect, useRef, useCallback } from 'react';

interface UseDebouncedTypingOptions {
  onStartTyping: () => void;
  onStopTyping: () => void;
  delay?: number;
}

/**
 * Debounced typing indicator hook
 * 
 * Prevents excessive typing indicator updates by:
 * - Only triggering onStartTyping once per typing session
 * - Waiting for delay ms of inactivity before triggering onStopTyping
 * 
 * Performance target: < 200ms from first keystroke to indicator shown
 */
export const useDebouncedTyping = ({
  onStartTyping,
  onStopTyping,
  delay = 1000
}: UseDebouncedTypingOptions) => {
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const isTypingRef = useRef(false);

  const handleTypingStart = useCallback(() => {
    // Only trigger if not already typing
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onStartTyping();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onStopTyping();
    }, delay);
  }, [onStartTyping, onStopTyping, delay]);

  const handleTypingStop = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onStopTyping();
    }
  }, [onStopTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    handleTypingStart,
    handleTypingStop
  };
};
