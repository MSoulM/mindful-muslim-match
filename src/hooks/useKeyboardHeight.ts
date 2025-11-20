import { useState, useEffect } from 'react';

/**
 * Hook to track keyboard height on mobile devices
 * Listens to visualViewport resize events to detect keyboard
 */
export const useKeyboardHeight = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const viewport = window.visualViewport;
    let initialHeight = viewport.height;

    const handleResize = () => {
      const currentHeight = viewport.height;
      const heightDiff = initialHeight - currentHeight;

      // Keyboard is considered open if viewport shrinks by more than 150px
      if (heightDiff > 150) {
        setKeyboardHeight(heightDiff);
        setIsKeyboardOpen(true);
      } else {
        setKeyboardHeight(0);
        setIsKeyboardOpen(false);
      }
    };

    const handleFocusIn = () => {
      // Small delay to let the viewport adjust
      setTimeout(handleResize, 100);
    };

    const handleFocusOut = () => {
      setKeyboardHeight(0);
      setIsKeyboardOpen(false);
    };

    viewport.addEventListener('resize', handleResize);
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    return () => {
      viewport.removeEventListener('resize', handleResize);
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return { keyboardHeight, isKeyboardOpen };
};
