import { useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  handler: (e: KeyboardEvent) => void;
  description: string;
}

/**
 * Hook to register keyboard shortcuts
 * @param shortcuts Array of keyboard shortcuts to register
 * @param enabled Whether shortcuts are enabled (default: true)
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === (e.ctrlKey || e.metaKey);
        const altMatch = shortcut.alt === undefined || shortcut.alt === e.altKey;
        const shiftMatch = shortcut.shift === undefined || shortcut.shift === e.shiftKey;
        const metaMatch = shortcut.meta === undefined || shortcut.meta === e.metaKey;
        const keyMatch = shortcut.key.toLowerCase() === e.key.toLowerCase();

        if (ctrlMatch && altMatch && shiftMatch && metaMatch && keyMatch) {
          e.preventDefault();
          shortcut.handler(e);
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

/**
 * Hook to handle Escape key for dismissals
 */
export function useEscapeKey(handler: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handler();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [handler, enabled]);
}

/**
 * Common keyboard shortcuts for the app
 */
export const APP_SHORTCUTS = {
  DISCOVER: { key: 'd', ctrl: true, description: 'Go to Discover' },
  DNA: { key: 'n', ctrl: true, description: 'Go to MySoul DNA' },
  MESSAGES: { key: 'm', ctrl: true, description: 'Go to Messages' },
  CHAICHAT: { key: 'c', ctrl: true, description: 'Go to ChaiChat' },
  AGENT: { key: 'a', ctrl: true, description: 'Go to MyAgent' },
  SEARCH: { key: 'k', ctrl: true, description: 'Open Search' },
  HELP: { key: '?', shift: true, description: 'Show Help' },
  SETTINGS: { key: ',', ctrl: true, description: 'Open Settings' },
};
