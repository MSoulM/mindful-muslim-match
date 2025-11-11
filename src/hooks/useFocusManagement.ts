import { useEffect, RefObject } from 'react';

export const useFocusTrap = (ref: RefObject<HTMLElement>, isActive: boolean = true) => {
  useEffect(() => {
    if (!isActive) return;
    
    const element = ref.current;
    if (!element) return;
    
    const focusableElements = element.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    
    // Focus first element when trap activates
    const previouslyFocused = document.activeElement as HTMLElement;
    firstElement?.focus();
    
    return () => {
      element.removeEventListener('keydown', handleTabKey);
      // Restore focus when trap deactivates
      previouslyFocused?.focus();
    };
  }, [ref, isActive]);
};

export const useFocusReturn = () => {
  const previousFocus = useRef<HTMLElement | null>(null);
  
  const saveFocus = () => {
    previousFocus.current = document.activeElement as HTMLElement;
  };
  
  const returnFocus = () => {
    previousFocus.current?.focus();
  };
  
  return { saveFocus, returnFocus };
};

export const useAnnouncement = () => {
  const [announcement, setAnnouncement] = useState('');
  
  const announce = (message: string) => {
    setAnnouncement(message);
    // Clear after announcement
    setTimeout(() => setAnnouncement(''), 1000);
  };
  
  return { announcement, announce };
};

import { useRef, useState } from 'react';
