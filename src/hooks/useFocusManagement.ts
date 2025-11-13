import { useEffect, useRef, useState, RefObject } from 'react';

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

/**
 * Hook for managing field-to-field navigation in forms
 * Provides Next/Done keyboard actions and automatic focus management
 */
export const useFieldNavigation = () => {
  const fieldRefs = useRef<Map<string, HTMLInputElement | HTMLTextAreaElement>>(new Map());
  const fieldOrder = useRef<string[]>([]);

  const registerField = (id: string, ref: HTMLInputElement | HTMLTextAreaElement | null) => {
    if (ref) {
      fieldRefs.current.set(id, ref);
      if (!fieldOrder.current.includes(id)) {
        fieldOrder.current.push(id);
      }
    } else {
      fieldRefs.current.delete(id);
      fieldOrder.current = fieldOrder.current.filter(fieldId => fieldId !== id);
    }
  };

  const unregisterField = (id: string) => {
    fieldRefs.current.delete(id);
    fieldOrder.current = fieldOrder.current.filter(fieldId => fieldId !== id);
  };

  const focusNextField = (currentId: string) => {
    const currentIndex = fieldOrder.current.indexOf(currentId);
    if (currentIndex === -1) return false;

    const nextIndex = currentIndex + 1;
    if (nextIndex < fieldOrder.current.length) {
      const nextId = fieldOrder.current[nextIndex];
      const nextField = fieldRefs.current.get(nextId);
      if (nextField && !nextField.disabled) {
        nextField.focus();
        return true;
      }
    }
    return false;
  };

  const focusPreviousField = (currentId: string) => {
    const currentIndex = fieldOrder.current.indexOf(currentId);
    if (currentIndex <= 0) return false;

    const prevIndex = currentIndex - 1;
    const prevId = fieldOrder.current[prevIndex];
    const prevField = fieldRefs.current.get(prevId);
    if (prevField && !prevField.disabled) {
      prevField.focus();
      return true;
    }
    return false;
  };

  const isLastField = (currentId: string) => {
    const currentIndex = fieldOrder.current.indexOf(currentId);
    return currentIndex === fieldOrder.current.length - 1;
  };

  const isFirstField = (currentId: string) => {
    const currentIndex = fieldOrder.current.indexOf(currentId);
    return currentIndex === 0;
  };

  const getReturnKeyType = (fieldId: string): 'next' | 'done' => {
    return isLastField(fieldId) ? 'done' : 'next';
  };

  return {
    registerField,
    unregisterField,
    focusNextField,
    focusPreviousField,
    isLastField,
    isFirstField,
    getReturnKeyType,
  };
};
